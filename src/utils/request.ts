// USAGE:
// import { request, abortRequest, clearCache, requestConfigurator } from "@ludekarts/utility-belt;

// Types.
export type baseType = string | number | boolean;
export type ResponseFallback = (response: Response) => any;
export type BodyObject = {
  [key: string]: baseType | baseType[] | BodyObject | BodyObject[];
};

type ResponseProcessor = <R>(response: unknown) => R;

export type RequestOptions = RequestInit & {
  abortable?: boolean;
  requestHash?: string;
  cacheRequest?: boolean;
  fallback?: ResponseFallback;
  responseParser?: (response: Response) => Promise<unknown>;
  responseProcessor?: ResponseProcessor;
};

// Container for all pending requests.
type RequestQueueValue = {
  requestRef: Promise<any>;
  controller: AbortController;
};
const requestQueue: Map<string, RequestQueueValue> = new Map();

// Container for all cached requests.
const responseCache: Map<string, any> = new Map();

/**
 * Main request function with caching and aborting support.
 */
export function request<R>(url: string, options?: RequestOptions): Promise<R> {
  const {
    method = "GET",
    fallback,
    requestHash,
    abortable = false,
    cacheRequest = false,
    responseParser = parseResponse,
    responseProcessor = (response: Response) => response,
    ...restOptions
  } = options || {};

  const finalURL = new URL(url);
  const finalRequestHash = createRequestHash(
    method.toLocaleUpperCase(),
    finalURL.toString(),
    requestHash
  );

  const requestProcessor = (response: Response) =>
    response.status === 200
      ? responseParser(response)
          .then(responseProcessor)
          .then(cacheResponse(finalRequestHash, cacheRequest))
      : fallback
      ? fallback(response)
      : responseParser(response)
          .then(Promise.reject)
          .catch(clearRejectedResponse(finalRequestHash, cacheRequest));

  const IS_PENDING_REQUEST = cacheRequest && requestQueue.has(finalRequestHash);
  const HAS_CACHED_RESPONSE =
    cacheRequest && responseCache.has(finalRequestHash);

  const createNewRequest = () => {
    const controller = new AbortController();
    const { signal } = controller;
    const requestRef = fetch(finalURL, { method, ...restOptions, signal }).then(
      requestProcessor
    );
    requestQueue.set(finalRequestHash, { requestRef, controller });
    return requestRef;
  };

  if (HAS_CACHED_RESPONSE) {
    return Promise.resolve(responseCache.get(finalRequestHash));
  } else if (IS_PENDING_REQUEST) {
    if (abortable) {
      const pendingRequest = requestQueue.get(finalRequestHash);
      if (pendingRequest) {
        pendingRequest.controller.abort();
        requestQueue.delete(finalRequestHash);
      }
      return createNewRequest();
    } else {
      const cachedRequest = requestQueue.get(finalRequestHash);
      return cachedRequest ? cachedRequest.requestRef : createNewRequest();
    }
  } else {
    return createNewRequest();
  }
}

type RequestConfiguratorOptions = RequestOptions & {
  headers?:
    | Record<string, string>
    | ((globalHeaders: HeadersInit) => HeadersInit);
};

/**
 * Returns a configured request function for a specific HTTP method.
 */
export function requestConfigurator(
  method: string,
  globalOptions: RequestOptions = {}
) {
  return function <R>(
    url: string,
    options: RequestConfiguratorOptions
  ): Promise<R> {
    const { headers, ...restOptions } = options || {};
    const finalOptions = {
      ...globalOptions,
      ...restOptions,
      headers:
        typeof headers === "function"
          ? headers(globalOptions.headers || {})
          : headers
          ? headers
          : globalOptions.headers,
      method: method.toUpperCase(),
    };
    return request<R>(url, finalOptions);
  };
}

/**
 * Abort a pending request by hash or method/url.
 */
export function abortRequest(hashOrMethod: string, url?: string) {
  if (typeof hashOrMethod !== "string") {
    throw new Error(`RequestHelperError: RequestHash need to be a string`);
  }
  const requestHash = createRequestHash(
    hashOrMethod,
    url,
    !url ? hashOrMethod : undefined
  );

  if (requestQueue.has(requestHash)) {
    requestQueue.get(requestHash)?.controller.abort();
    requestQueue.delete(requestHash);
  }
}

/**
 * Debug helper to log current request queue and cache.
 */
export function requestDebug() {
  console.log("Request Queue:", requestQueue);
  console.log("Response Cache:", responseCache);
}

/**
 * Clear request cache by hash, RegExp, or all.
 */
export function clearCache(hashOrMethod: string | RegExp, url?: string) {
  // Remove by Request Hash.
  if (typeof hashOrMethod === "string") {
    const requestHash = createRequestHash(
      hashOrMethod,
      url,
      !url ? hashOrMethod : undefined
    );
    responseCache.delete(requestHash);
  }

  // Remove by Regular Expression.
  else if (hashOrMethod instanceof RegExp) {
    for (let cacheKey of responseCache.keys()) {
      hashOrMethod.test(cacheKey) && responseCache.delete(cacheKey);
    }
  }

  // Remove all instances.
  else {
    responseCache.clear();
  }
}

// ---- Helpers ----------------

const allowMethods = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
  "TRACE",
  "CONNECT",
];

// Create a request hash based on method and URL.
function createRequestHash(method: string, url?: string, hash?: string) {
  if (hash === undefined && !allowMethods.includes(method.toUpperCase())) {
    throw new Error(
      `RequestHelperError: Method "${method}" is not allowed. Allowed methods are: ${allowMethods.join(
        ", "
      )}.`
    );
  }

  if (hash === undefined && typeof url !== "string") {
    throw new Error(
      `RequestHelperError: URL must be a string. Received: ${typeof url}`
    );
  }

  return hash ? hash : `${method}:${url}`;
}

// Cache response in the responseCache.
function cacheResponse(requestHash: string, cacheRequest: boolean) {
  return (response: Response) => {
    if (cacheRequest) {
      responseCache.set(requestHash, response);
      requestQueue.delete(requestHash);
    }
    return response;
  };
}

// Remove rejected response from the request queue.
function clearRejectedResponse(requestHash: string, cacheRequest: boolean) {
  return (response: Response) => {
    if (cacheRequest) {
      requestQueue.delete(requestHash);
    }
    return Promise.reject(response);
  };
}

// Handle common response types.
async function parseResponse(response: Response) {
  let result;

  // Get Content Type.
  const contentType =
    response.headers?.get("content-type")?.split(";")[0] || "";

  // Handle various content types.

  if (/^text\//.test(contentType)) {
    result = await response.text();
  } else if (/^image\//.test(contentType)) {
    result = await response.blob();
  } else if (contentType === "application/json") {
    result = await response.json();
  } else if (contentType === "multipart/form-data") {
    result = await response.formData();
  } else {
    console.warn(
      `Not recognized content - type: ${response.headers.get(
        "content-type"
      )}. Try to provide your own responseParser.`
    );
    result = response;
  }

  if (response.ok) {
    return result;
  } else {
    throw result;
  }
}

// Convert object to URL string. Allow for nested objects and arrays.
export function objectToUrlString(json: BodyObject) {
  if (isBasicType(json) || notAllowed(json) || Array.isArray(json)) {
    throw new Error("ObjectToUrlStringError: Given value is not a JSON object");
  }

  return Object.keys(json)
    .map((key) => {
      return sliceEndAnd(
        isBasicType(json[key])
          ? `${key}=${encodeURIComponent(json[key])}`
          : Array.isArray(json[key])
          ? arrayToUrl(json[key] as BodyObject[], key)
          : objectToUrl(json[key] as BodyObject, key)
      );
    })
    .join("&");
}

function arrayToUrl(array: BodyObject[], prefix = "") {
  let result = "";

  array.forEach((item, index) => {
    if (notAllowed(item)) {
      throw new Error(
        `ObjectToUrlStringError: Encounter not allowed value at: ${prefix} index: ${index}`
      );
    } else if (isBasicType(item)) {
      result += `${prefix}=${encodeURIComponent(item)}&`;
    } else if (Array.isArray(item)) {
      result += arrayToUrl(item, prefix + `[${index}]`);
    } else {
      result += objectToUrl(item, prefix + `[${index}]`);
    }
  });

  return result;
}

function objectToUrl(object: BodyObject, prefix = "") {
  let result = "";

  Object.keys(object).forEach((key) => {
    if (notAllowed(object[key])) {
      throw new Error(
        `ObjectToUrlStringError: Encounter not allowed value at: ${prefix}`
      );
    } else if (isBasicType(object[key])) {
      result += prefix + `[${key}]=${encodeURIComponent(object[key])}&`;
    } else if (Array.isArray(object[key])) {
      result += arrayToUrl(object[key] as BodyObject[], prefix + `[${key}]`);
    } else {
      result += objectToUrl(object[key] as BodyObject, prefix + `[${key}]`);
    }
    // Removed unnecessary return statement inside forEach
  });

  return result;
}

function sliceEndAnd(value: string) {
  return value.replace(/&$/g, "");
}

// Convert object to FormData. Allow for nested objects and arrays.
export function objectToDataForm(body: BodyObject) {
  const formData = new FormData();
  Object.keys(body).forEach((name) => {
    if (Array.isArray(body[name])) {
      (body[name] as BodyObject[]).forEach((item) => {
        formData.append(
          name,
          isBasicType(item) ? `${item}` : JSON.stringify(item)
        );
      });
    } else {
      formData.append(
        name,
        isBasicType(body[name]) ? `${body[name]}` : JSON.stringify(body[name])
      );
    }
  });
  return formData;
}

// ---- Verifiers ----------------

function isBasicType(value: unknown): value is baseType {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function notAllowed(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    typeof value === "symbol" ||
    typeof value === "function" ||
    value instanceof FormData
  );
}
