/**
 * Utility for making HTTP requests with caching and aborting support.
 *
 * @example
 *
 * import { request, abortRequest, clearCache, requestConfigurator } from "@ludekarts/utility-belt";
 *
 * // 📝 Making a GET request
 * request("https://api.example.com/data").then(console.log);
 *
 * // 📝 Making a POST request with JSON body
 * request("https://api.example.com/data", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ key: "value" }),
 * }).then(console.log);
 *
 * // 📝 Making a request with caching
 * request("https://api.example.com/data", {
 *  cacheRequest: true,
 * }).then(console.log);
 *
 * // 📝 Aborting a request
 * const requestHash = "my-request-hash";
 * request("https://api.example.com/data", {
 *  requestHash,
 *  abortable: true,
 * }).then(console.log);
 *
 * // 📝 Aborting a request by hash
 * abortRequest(requestHash);
 *
 * // 📝 Clearing cache by hash
 * clearCache(requestHash);
 *
 * // 📝 Configuring a request function for a specific HTTP method
 * const post = requestConfigurator("POST", {
 *  headers: {
 *   "Content-Type": "application/json",
 *  },
 * });
 *
 * // 📝 Using the configured request function
 * post("https://api.example.com/data", {
 *  body: JSON.stringify({ key: "value" }),
 *  headers: (globalHeaders) => ({
 *   ...globalHeaders,
 *   "X-Custom-Header": "value",
 *  }),
 * }).then(console.log);
 *
 */

// Types.
export type baseType = string | number | boolean;
type ResponseProcessor = <R>(response: unknown) => R;
export type ResponseFallback = (response: Response) => any;
export type BodyObject = {
  [key: string]: baseType | baseType[] | BodyObject | BodyObject[];
};

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
  requestRef: Promise<unknown>;
  controller: AbortController;
};
const requestQueue: Map<string, RequestQueueValue> = new Map();

// Container for all cached requests.
const responseCache: Map<string, unknown> = new Map();

/**
 * Main request function with caching and aborting support.
 * @param url The request URL
 * @param options Request options
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
    return Promise.resolve(responseCache.get(finalRequestHash) as R);
  } else if (IS_PENDING_REQUEST) {
    if (abortable) {
      const pendingRequest = requestQueue.get(finalRequestHash);
      if (pendingRequest) {
        pendingRequest.controller.abort();
        requestQueue.delete(finalRequestHash);
      }
      return createNewRequest() as Promise<R>;
    } else {
      const cachedRequest = requestQueue.get(finalRequestHash);
      return (
        cachedRequest ? cachedRequest.requestRef : createNewRequest()
      ) as Promise<R>;
    }
  } else {
    return createNewRequest() as Promise<R>;
  }
}

type RequestConfiguratorOptions = RequestOptions & {
  headers?:
    | Record<string, string>
    | ((globalHeaders: HeadersInit) => HeadersInit);
};

/**
 * Returns a configured request function for a specific HTTP method.
 * @param method HTTP method
 * @param globalOptions Global request options
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
 * @param hashOrMethod Request hash or HTTP method
 * @param url Optional URL
 */
export function abortRequest(hashOrMethod: string, url?: string) {
  if (typeof hashOrMethod !== "string") {
    throw new Error(`RequestHelperError: RequestHash needs to be a string`);
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
// export function requestDebug() {
//   console.log("Request Queue:", requestQueue);
//   console.log("Response Cache:", responseCache);
// }

/**
 * Clear request cache by hash, RegExp, or all.
 * @param hashOrMethod Request hash, HTTP method, or RegExp
 * @param url Optional URL
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
  "PUT",
  "POST",
  "HEAD",
  "PATCH",
  "TRACE",
  "DELETE",
  "OPTIONS",
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

// Cache parsed response in the responseCache.
function cacheResponse(requestHash: string, cacheRequest: boolean) {
  return (parsed: unknown) => {
    if (cacheRequest) {
      responseCache.set(requestHash, parsed);
      requestQueue.delete(requestHash);
    }
    return parsed;
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

/**
 * Converts a JSON object to a URL query string, supporting nested objects and arrays.
 * @param json The object to convert
 */
export function objectToUrlString(json: BodyObject) {
  if (isBasicType(json) || notAllowed(json) || Array.isArray(json)) {
    throw new Error("ObjectToUrlStringError: Given value is not a JSON object");
  }

  return Object.keys(json)
    .map((key) => {
      return removeTrailingAmpersand(
        isBasicType(json[key])
          ? `${key}=${encodeURIComponent(json[key])}`
          : Array.isArray(json[key])
          ? arrayToUrl(json[key] as BodyObject[], key)
          : objectToUrl(json[key] as BodyObject, key)
      );
    })
    .join("&");
}

function arrayToUrl(array: BodyObject[], prefix = ""): string {
  return array
    .map((item, index): string => {
      if (notAllowed(item)) {
        throw new Error(
          `ObjectToUrlStringError: Encounter not allowed value at: ${prefix} index: ${index}`
        );
      } else if (isBasicType(item)) {
        return `${prefix}=${encodeURIComponent(item)}&`;
      } else if (Array.isArray(item)) {
        return arrayToUrl(item, prefix + `[${index}]`);
      } else {
        return objectToUrl(item, prefix + `[${index}]`);
      }
    })
    .join("");
}

function objectToUrl(object: BodyObject, prefix = ""): string {
  return Object.keys(object)
    .map((key): string => {
      if (notAllowed(object[key])) {
        throw new Error(
          `ObjectToUrlStringError: Encounter not allowed value at: ${prefix}`
        );
      } else if (isBasicType(object[key])) {
        return prefix + `[${key}]=${encodeURIComponent(object[key])}&`;
      } else if (Array.isArray(object[key])) {
        return arrayToUrl(object[key] as BodyObject[], prefix + `[${key}]`);
      } else {
        return objectToUrl(object[key] as BodyObject, prefix + `[${key}]`);
      }
    })
    .join("");
}

function removeTrailingAmpersand(value: string) {
  return value.replace(/&$/g, "");
}

/**
 * Converts a JSON object to FormData, supporting nested objects and arrays.
 * @param body The object to convert
 */
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
