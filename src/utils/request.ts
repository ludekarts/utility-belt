/**
 * Utility for making HTTP requests with caching and aborting support.
 *
 * @example
 *
 * import { request, abortRequest, clearCache, requestConfigurator, objectToUrlString, objectToDataForm } from "@ludekarts/utility-belt";
 * import type { RequestOptions, ResponseProcessor, BaseType, BodyObject, ResponseFallback, RequestConfiguratorOptions } from "@ludekarts/utility-belt";
 *
 * // 📝 Making a GET request:
 *
 * request("https://api.example.com/data").then(console.log);
 *
 * // 📝 Making a POST request with JSON body:
 *
 * request("https://api.example.com/data", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ key: "value" }),
 * }).then(console.log);
 *
 * // 📝 Making a request with caching:
 *
 * request("https://api.example.com/data", {
 *  cacheRequest: true,
 * }).then(console.log);
 *
 * // 📝 Setup aborting a request:
 *
 * const requestHash = "my-request-hash";
 * request("https://api.example.com/data", {
 *  requestHash,
 *  abortable: true,
 * }).then(console.log);
 *
 * // 📝 Aborting a request by hash:
 *
 * abortRequest(requestHash);
 *
 * // 📝 Clearing cache by hash:
 * clearCache(requestHash);
 *
 * // 📝 Configuring a request function for a specific HTTP method:
 *
 * const post = requestConfigurator("POST", {
 *  headers: {
 *   "Content-Type": "application/json",
 *  },
 * });
 *
 * // 📝 Using the configured request function:
 *
 * post("https://api.example.com/data", {
 *  body: JSON.stringify({ key: "value" }),
 *  headers: (globalHeaders) => ({
 *   ...globalHeaders,
 *   "X-Custom-Header": "this-is-a-custom-header",
 *  }),
 * }).then(console.log);
 *
 */

// Types.
export type BaseType = string | number | boolean | null;
export type ResponseFallback = (response: Response) => any;

type NestedObject<V> = {
  [key: string]: V | NestedObject<V> | Array<V | NestedObject<V>>;
};

export type BodyObject = NestedObject<BaseType>;
export type FormDataValue = BaseType | Blob | File | Date;
export type FormDataObject = NestedObject<FormDataValue>;
interface UrlArray extends Array<BaseType | BodyObject | UrlArray> {}

export type RequestOptions = RequestInit & {
  abortable?: boolean;
  requestHash?: string;
  cacheRequest?: boolean;
  fallback?: ResponseFallback;
  responseParser?: (response: Response) => Promise<unknown>;
  responseProcessor?: <R, RP>(response: R) => RP;
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
    responseProcessor = (response: unknown) => response as R,
    ...restOptions
  } = options || {};

  const finalURL = new URL(url);
  const finalRequestHash = createRequestHash(
    method.toLocaleUpperCase(),
    finalURL.toString(),
    requestHash,
  );

  const requestProcessor = (response: Response) =>
    response.ok === true
      ? responseParser(response)
          .then(responseProcessor)
          .then(cacheResponse(finalRequestHash, cacheRequest))
      : typeof fallback === "function"
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
      requestProcessor,
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

export type RequestConfiguratorOptions = RequestOptions & {
  headers?: HeadersInit | ((globalHeaders: HeadersInit) => HeadersInit);
};

/**
 * Returns a configured request function for a specific HTTP method.
 * Additional features:
 * - headers can be provided as a function to merge with global headers.
 * - apply global responseProcessor for each request.
 * @param method HTTP method
 * @param globalOptions Global request options
 */
export function requestConfigurator(
  method: string,
  globalOptions: RequestOptions = {},
) {
  return function <R>(
    url: string,
    options?: RequestConfiguratorOptions,
  ): Promise<R> {
    const { headers, responseProcessor, ...restOptions } = options || {};
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

    // Apply global responseProcessor and chain it with request-specific responseProcessor.
    if (typeof globalOptions.responseProcessor === "function") {
      const globalResponseProcessor = globalOptions.responseProcessor;

      finalOptions.responseProcessor = (response: unknown) =>
        typeof responseProcessor === "function"
          ? responseProcessor(globalResponseProcessor(response))
          : globalResponseProcessor(response);
    }

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
    !url ? hashOrMethod : undefined,
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
      !url ? hashOrMethod : undefined,
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
        ", ",
      )}.`,
    );
  }

  if (hash === undefined && typeof url !== "string") {
    throw new Error(
      `RequestHelperError: URL must be a string. Received: ${typeof url}`,
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
async function parseResponse<R>(response: Response): Promise<R> {
  let result;

  // Get Content Type.
  const contentType =
    response.headers?.get("content-type")?.split(";")[0] || "none";

  // Handle various content types.

  if (/^text\//.test(contentType)) {
    result = await response.text();
  } else if (/^image\//.test(contentType)) {
    result = await response.blob();
  } else if (contentType === "application/json") {
    result = await response.json();
  } else if (contentType === "multipart/form-data") {
    result = await response.formData();
  } else if (contentType === "none") {
    result = null;
  } else {
    console.warn(
      `Not recognized content-type: ${response.headers.get(
        "content-type",
      )}. Try to provide your own responseParser.`,
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
export function objectToUrlString(json: BodyObject): string {
  if (isBasicType(json) || notAllowed(json) || Array.isArray(json)) {
    throw new Error("ObjectToUrlStringError: Given value is not a JSON object");
  }

  return Object.keys(json)
    .map((key) => {
      const value = json[key];

      return removeTrailingAmpersand(
        isBasicType(value)
          ? `${key}=${encodeURIComponent(value || "null")}`
          : Array.isArray(value)
            ? arrayToUrl(value, key)
            : objectToUrl(value, key),
      );
    })
    .join("&");
}

function arrayToUrl(array: UrlArray, prefix = ""): string {
  return array
    .map((item, index): string => {
      if (notAllowed(item)) {
        throw new Error(
          `ObjectToUrlStringError: Encounter not allowed value at: ${prefix} index: ${index}`,
        );
      } else if (isBasicType(item)) {
        return `${prefix}=${encodeURIComponent(`${item}`)}&`;
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
      const value = object[key];

      if (notAllowed(value)) {
        throw new Error(
          `ObjectToUrlStringError: Encounter not allowed value at: ${prefix}`,
        );
      } else if (isBasicType(value)) {
        return `${prefix}[${key}]=${encodeURIComponent(value || "null")}&`;
      } else if (Array.isArray(value)) {
        return arrayToUrl(value, prefix + `[${key}]`);
      } else {
        return objectToUrl(value, prefix + `[${key}]`);
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
export function objectToDataForm<T extends FormDataObject>(body: T): FormData {
  const formData = new FormData();
  Object.keys(body).forEach((name) => {
    if (Array.isArray(body[name])) {
      (body[name] as Array<FormDataValue | FormDataObject>).forEach((item) => {
        appendFormDataValue(formData, name, item);
      });
    } else {
      appendFormDataValue(formData, name, body[name]);
    }
  });
  return formData;
}

function appendFormDataValue(
  formData: FormData,
  name: string,
  value: FormDataValue | FormDataObject,
) {
  if (value instanceof Blob) {
    console.log("parse blob", name, value);
    formData.append(name, value);
  } else if (value instanceof Date) {
    console.log("parse date", name, value);
    formData.append(name, value.toISOString());
  } else if (isBasicType(value)) {
    console.log("parse basic type", name, value);
    formData.append(name, `${value}`);
  } else {
    console.log("parse object", name, value);
    formData.append(name, JSON.stringify(value));
  }
}

// ---- Verifiers ----------------

function isBasicType(value: unknown): value is BaseType {
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
