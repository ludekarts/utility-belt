// USAGE:
// import { get, post, abortRequest, clearCache } from "@ludekarts/utility-belt;

// Types.
export type baseType = string | number | boolean;
export type ResponseFallback = (response: Response) => any;
export type BodyObject = {
  [key: string]: baseType | baseType[] | BodyObject | BodyObject[];
};

export type RequestBody =
  | baseType
  | baseType[]
  | BodyObject
  | BodyObject[]
  | FormData;

export type RequestOptions = RequestInit & {
  body?: RequestBody;
  abortable?: boolean;
  requestHash?: string;
  cacheRequest?: boolean;
  fallback?: ResponseFallback;
  responseProcessor?: (response: Response) => any;
};

// Container for all pending requests.
const requestQueue = new Map();

// Container for all cached requests.
const responseCache = new Map();

// GET.
export function get(url: string, options?: RequestOptions) {
  const {
    body,
    method,
    fallback,
    abortable = false,
    cacheRequest = false,
    responseProcessor = (response: Response) => response,
    ...restOptions
  } = options || {};

  const finalURL = new URL(url);

  const config = {
    method: "GET",
  };

  if (body && isBodyObject(body)) {
    finalURL.search = objectToUrlString(body as BodyObject);
  }

  const requestHash = finalURL.toString();
  const requestProcessor = (response: Response) =>
    response.status === 200
      ? parseResponse(response)
          .then(responseProcessor)
          .then(cacheResponse(requestHash, cacheRequest))
      : fallback
      ? fallback(response)
      : parseResponse(response)
          .then(Promise.reject)
          .catch(clearRejectedResponse(requestHash, cacheRequest));

  const IS_PENDING_REQUEST = cacheRequest && requestQueue.has(requestHash);
  const HAS_CACHED_RESPONSE = cacheRequest && responseCache.has(requestHash);

  const createNewRequest = () => {
    const controller = new AbortController();
    const { signal } = controller;
    const request = fetch(finalURL, { ...config, ...restOptions, signal }).then(
      requestProcessor
    );
    requestQueue.set(requestHash, { request, controller });
    return request;
  };

  if (HAS_CACHED_RESPONSE) {
    return Promise.resolve(responseCache.get(requestHash));
  } else if (IS_PENDING_REQUEST) {
    if (abortable) {
      requestQueue.get(requestHash).controller.abort();
      requestQueue.delete(requestHash);
      return createNewRequest();
    } else {
      return requestQueue.get(requestHash).request;
    }
  } else {
    return createNewRequest();
  }
}

export function abortRequest(url: string) {
  if (requestQueue.has(url)) {
    requestQueue.get(url).controller.abort();
    requestQueue.delete(url);
  }
}

export function clearCache(url: string | RegExp, requestHash: string = "") {
  if (typeof requestHash !== "string") {
    throw new Error(`RequestHelperError: RequestHash need to be a string`);
  }

  const key =
    url === undefined
      ? undefined
      : url instanceof RegExp
      ? url
      : `${url}${requestHash}`;

  // Remove by URL + HASH;
  if (typeof key === "string") {
    responseCache.delete(key);
  }

  // Remove by Reular Expression.
  else if (key instanceof RegExp) {
    for (let cacheKey of responseCache.keys()) {
      key.test(cacheKey) && responseCache.delete(cacheKey);
    }
  }

  // Remove all instances.
  else {
    responseCache.clear();
  }
}

export async function post(url: string, options?: RequestOptions) {
  const {
    body,
    method,
    headers,
    fallback,
    requestHash = "",
    abortable = false,
    cacheRequest = false,
    responseProcessor = (x: Response) => x,
    ...restOptions
  } = options || {};

  const finalURL = new URL(url);

  if (cacheRequest && typeof requestHash !== "string") {
    throw new Error(
      "RequestHelperError: RequestHash is required for POST requests with cache enabled."
    );
  }

  if (typeof requestHash !== "string") {
    throw new Error("RequestHelperError: RequestHash need to be a string");
  }

  const postRequestHash = finalURL.toString() + requestHash;
  const requestProcessor = (response: Response) =>
    response.status === 200
      ? parseResponse(response)
          .then(responseProcessor)
          .then(cacheResponse(postRequestHash, cacheRequest))
      : fallback
      ? fallback(response)
      : parseResponse(response)
          .then(Promise.reject)
          .catch(clearRejectedResponse(postRequestHash, cacheRequest));

  const IS_PENDING_REQUEST = cacheRequest && requestQueue.has(postRequestHash);
  const HAS_CACHED_RESPONSE =
    cacheRequest && responseCache.has(postRequestHash);

  const createNewRequest = () => {
    const controller = new AbortController();
    const { signal } = controller;
    const config: RequestInit = {
      method: "POST",
      headers,
    };

    if (body) {
      const encoded = encodeBody(body, headers);
      config.body = encoded.body;
      config.headers = encoded.headers;
    }

    const request = fetch(finalURL, {
      ...config,
      ...restOptions,
      signal,
    } as RequestInit).then(requestProcessor);
    requestQueue.set(postRequestHash, { request, controller });
    return request;
  };

  if (HAS_CACHED_RESPONSE) {
    return Promise.resolve(responseCache.get(postRequestHash));
  } else if (IS_PENDING_REQUEST) {
    if (abortable) {
      requestQueue.get(postRequestHash).controller.abort();
      requestQueue.delete(postRequestHash);
      return createNewRequest();
    } else {
      return requestQueue.get(postRequestHash).request;
    }
  } else {
    return createNewRequest();
  }
}

// ---- Helpers ----------------

function cacheResponse(requestHash: string, cacheRequest: boolean) {
  return (response: Response) => {
    if (cacheRequest) {
      responseCache.set(requestHash, response);
      requestQueue.delete(requestHash);
    }
    return response;
  };
}

function clearRejectedResponse(requestHash: string, cacheRequest: boolean) {
  return (response: Response) => {
    if (cacheRequest) {
      requestQueue.delete(requestHash);
    }
    return Promise.reject(response);
  };
}

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
      `Not recognized content - type: ${response.headers.get("content-type")} `
    );
    result = response;
  }

  if (response.ok) {
    return result;
  } else {
    throw result;
  }
}

function encodeBody(body: RequestBody, initHeaders: HeadersInit = {}) {
  const headers = new Headers(initHeaders);
  const contentType = headers.get("Content-Type");

  // Content-Type auto detection.
  if (!contentType) {
    if (isFormElement(body)) {
      // Not setting Content-Type so the browser can set it automaicaly.
      return { headers, body: new FormData(body as HTMLFormElement) };
    } else if (body instanceof FormData) {
      // Not setting Content-Type so the browser can set it automaicaly.
      return { headers, body };
    } else if (isBodyObject(body)) {
      headers.set("Content-Type", "application/json");
      return { headers, body: JSON.stringify(body) };
    } else if (isBasicType(body)) {
      headers.set("Content-Type", "text/plain");
      return { headers, body: `${body}` };
    } else {
      throw new Error(
        `RequestHelperError: Cannot handle content type "${contentType}". Try to use different content type or use syntax: post(url, null, { body }) to encode body your way.`
      );
    }
  }
  // Encode acorrding to Content-Type.
  else {
    if (contentType === "application/json") {
      return { headers, body: JSON.stringify(body) };
    } else if (contentType === "text/plain") {
      return {
        headers,
        body: typeof body === "string" ? body : JSON.stringify(body),
      };
    } else if (contentType === "application/x-www-form-urlencoded") {
      return {
        headers,
        body: isBodyObject(body)
          ? objectToUrlString(body as BodyObject)
          : JSON.stringify(body),
      };
    } else if (contentType === "multipart/form-data") {
      headers.delete("Content-Type");
      if (isFormElement(body)) {
        return { headers, body: new FormData(body as HTMLFormElement) };
      } else if (body instanceof FormData) {
        return { headers, body };
      } else if (isBodyObject(body)) {
        return { headers, body: objectToDataForm(body as BodyObject) };
      } else {
        throw new Error(
          `RequestHelperError: Cannot convert body of type "${typeof body}". Try to use different Content-Type or use syntax: post(url, null, { body }) to encode body your way.`
        );
      }
    } else {
      throw new Error(
        `RequestHelperError: Cannot handle content type "${contentType}". Try to use different Content-Type or use syntax: post(url, null, { body }) to encode body your way.`
      );
    }
  }
}

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

    return result;
  });

  return result;
}

function sliceEndAnd(value: string) {
  return value.replace(/&$/g, "");
}

function objectToDataForm(body: BodyObject) {
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

function isFormElement(body: any) {
  return typeof window !== "undefined" && body instanceof HTMLFormElement;
}

function isBasicType(value: any) {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function notAllowed(value: any) {
  return (
    value === null ||
    value === undefined ||
    typeof value === "symbol" ||
    typeof value === "function" ||
    value instanceof FormData
  );
}

function isBodyObject(value: any) {
  return (
    typeof value === "object" && // Is an object.
    !Array.isArray(value) && // Is not array.
    !notAllowed(value) // Is allowed value.
  );
}
