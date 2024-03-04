
// USAGE:
/*

import { get, post, withConfig, abortRequest, clearCache } from "@ludekarts/utility-belt;
. . .

// Add global config.
const { get post } = withConfig({ headers: { "Authorization": 123 } });
. . .

// Use regular GET and POST methods.

get("http://localhost:3030/get/json?status=200").then(console.log).catch(console.error); // LOG: {message: '🔌 Hello API'}
get("http://localhost:3030/get/json?status=400").then(console.log).catch(console.error); // ERR: {message: '🤮 Bad request'}

// With cache - each time you call the same URL, it will return the same response without making a new request.
get("http://localhost:3030/get/json?status=200", { cacheRequest: true }).then(console.log).catch(console.error); // LOG: {message: '🔌 Hello API'}

// With abortable - if you call the same URL while the previous request is still pending, it will abort the previous request and make a new one.
get("http://localhost:3030/get/json?status=200&delay=3000", { abortable: true }).then(console.log).catch(console.error); // LOG: {message: '🔌 Hello API'}

// With responseProcessor - you can process the response before it's returned, and then the result of processing is cached.
get("http://localhost:3030/get/json?status=200", { cacheRequest: true, responseProcessor: response => response.message }).then(console.log).catch(console.error); // LOG: '🔌 Hello API'

// Aborting any request.
get("http://localhost:3030/get/json?status=200&delay=3000", {cacheRequest: true}).then(console.log).catch(console.error); // LOG: {message: '🔌 Hello API'}
abortRequest("http://localhost:3030/get/json?status=200&delay=3000");

// Clearing cache with URL.
clearCache("http://localhost:3030/get/json?status=200");

// Clearing cache with URL and HASH.
clearCache("http://localhost:3030/post/json", "X3ersSD7");

// Clearing cache with Regular Expression- all requests matching the REGEX will be removed from the cache.
clearCache(/status=200/);

// Clearing all cache.
clearCache();

// Using POST method.

post("http://localhost:3030/post/echo", "hello").then(console.log).catch(console.error); // LOG: echo



*/


// Container for all pending requests.
const requestQueue = new Map();

// Container for all cached requests.
const responseCache = new Map();

export function get(url, options = {}) {

  const { method, body, cacheRequest = false, abortable = false, responseProcessor = (x => x), ...restOptions } = options;
  const finalURL = new URL(url);

  const config = {
    method: "GET",
  };

  if (isObject(body)) {
    finalURL.search = objectToUrlString(body);
  }

  const requestHash = finalURL.toString();
  const requestProcessor = response => response.status === 200
    ? parseResponse(response).then(responseProcessor).then(cacheResponse(requestHash, cacheRequest))
    : parseResponse(response).then(Promise.reject).catch(clearRejectedResponse(requestHash, cacheRequest));

  const IS_PENDING_REQUEST = cacheRequest && requestQueue.has(requestHash);
  const HAS_CACHED_RESPONSE = cacheRequest && responseCache.has(requestHash);

  const createNewRequest = () => {
    const controller = new AbortController();
    const { signal } = controller;
    config.signal = signal;

    const request = fetch(finalURL, { ...config, ...restOptions }).then(requestProcessor);
    requestQueue.set(requestHash, { request, controller });
    return request;
  }

  if (HAS_CACHED_RESPONSE) {
    return Promise.resolve(responseCache.get(requestHash));
  }
  else if (IS_PENDING_REQUEST) {
    if (abortable) {
      requestQueue.get(requestHash).controller.abort();
      requestQueue.delete(requestHash);
      return createNewRequest();
    }
    else {
      return requestQueue.get(requestHash).request;
    }
  }
  else {
    return createNewRequest();
  }
}


export function abortRequest(url) {
  if (requestQueue.has(url)) {
    requestQueue.get(url).controller.abort();
    requestQueue.delete(url);
  }
}

export function clearCache(url, requestHash = "") {

  if (typeof requestHash !== "string") {
    throw new Error(`RequestHash need to be a string`);
  }

  const key = url === undefined ? undefined : url instanceof RegExp ? url : `${url}${requestHash}`;

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


export async function post(url, body, options = {}) {

  const { method, cacheRequest = false, abortable = false, responseProcessor = (x => x), requestHash = "", ...restOptions } = options;
  const finalURL = new URL(url);

  let config = {
    method: "POST",
  };

  if (body) {
    config = { ...config, ...encodeBody(config, body) };
  }

  if (cacheRequest && !requestHash) {
    throw new Error("RequestHash is required for POST requests with cache enabled.");
  }

  const postRequestHash = finalURL.toString() + requestHash;
  const requestProcessor = response => response.status === 200
    ? parseResponse(response).then(responseProcessor).then(cacheResponse(postRequestHash, cacheRequest))
    : parseResponse(response).then(Promise.reject).catch(clearRejectedResponse(postRequestHash, cacheRequest));

  const IS_PENDING_REQUEST = cacheRequest && requestQueue.has(postRequestHash);
  const HAS_CACHED_RESPONSE = cacheRequest && responseCache.has(postRequestHash);

  const createNewRequest = () => {
    const controller = new AbortController();
    const { signal } = controller;
    config.signal = signal;

    const request = fetch(finalURL, { ...config, ...restOptions }).then(requestProcessor);
    requestQueue.set(postRequestHash, { request, controller });
    return request;
  }

  if (HAS_CACHED_RESPONSE) {
    return Promise.resolve(responseCache.get(postRequestHash));
  }
  else if (IS_PENDING_REQUEST) {
    if (abortable) {
      requestQueue.get(postRequestHash).controller.abort();
      requestQueue.delete(postRequestHash);
      return createNewRequest();
    }
    else {
      return requestQueue.get(postRequestHash).request;
    }
  }
  else {
    return createNewRequest();
  }
}

// ---- Helpers ----------------

function cacheResponse(requestHash, cacheRequest) {
  return response => {
    if (cacheRequest) {
      responseCache.set(requestHash, response);
      requestQueue.delete(requestHash);
    }
    return response;
  }
}

function clearRejectedResponse(requestHash, cacheRequest) {
  return response => {
    if (cacheRequest) {
      requestQueue.delete(requestHash);
    }
    return Promise.reject(response);
  };
}

function isBasicType(value) {
  return typeof value === "string"
    || typeof value === "number"
    || typeof value === "boolean";
}

function notAllowed(value) {
  return value === null
    || value === undefined
    || typeof value === "symbol"
    || typeof value === "function";
}

function isObject(value) {
  return typeof value === "object" && !notAllowed(value) && !Array.isArray(value);
}


async function parseResponse(response, fallback) {

  let result;

  // Get Content Type.
  const contentType = response.headers.get("content-type").split(";")[0];

  // Handle various content types.

  if (/^text\//.test(contentType)) {
    result = await response.text();
  }

  else if (/^image\//.test(contentType)) {
    result = await response.blob();
  }

  else if (contentType === "application/json") {
    result = await response.json();
  }

  else if (contentType === "multipart/form-data") {
    result = await response.formData();
  }

  else {
    console.warn(`Not recognized content - type: ${response.headers.get("content-type")} `);
    result = response;
  }

  if (response.ok) {
    return result;
  }

  else if (fallback) {
    return fallback;
  }

  else {
    throw result;
  }
}

function encodeBody(config, body) {

  const contentType = config.headers?.["content-type"] || config.headers?.["Content-Type"];

  if (contentType) {

    if (contentType === "application/json") {
      return { body: JSON.stringify(body) };
    }

    else if (contentType === "text/plain") {
      return { body: JSON.stringify(body) };
    }

    else if (contentType === "application/x-www-form-urlencoded" && isObject(body)) {
      return { body: new URLSearchParams(body) };
    }

    else if (contentType === "application/form-data" && body instanceof HTMLFormElement) {
      return { body: new FormData(body) };
    }

    else {
      throw new (`Cannot handle content type: "${contentType}". Try to use different content type or use syntax: post(url, null, { body }) to encode body your way.`);
    }
  }

  else {

    // Set Request body.
    if (isBasicType(body)) {
      return {
        body: body + "",
        headers: config.headers ? { ...config.headers, "Content-Type": "text/plain" } : {
          "Content-Type": "text/plain",
        },
      };
    }

    else if (body instanceof FormData) {
      return {
        body: body,
        headers: config.headers ? { ...config.headers, "Content-Type": "multipart/form-data" } : {
          "Content-Type": "multipart/form-data",
        }
      }
    }

    else if (!notAllowed(body)) {
      return {
        body: JSON.stringify(body),
        headers: config.headers ? { ...config.headers, "Content-Type": "application/json" } : {
          "Content-Type": "application/json",
        },
      };
    }

    else {
      throw new Error("Invalid body");
    }
  }
}

export function objectToUrlString(json) {
  if (isBasicType(json) || notAllowed(json) || Array.isArray(json)) {
    throw new Error("objectToUrlString: Given value is not a JSON object");
  }

  return Object.keys(json).map(key => {
    return sliceEndAnd(
      isBasicType(json[key])
        ? `${key}=${json[key]}`
        : Array.isArray(json[key])
          ? arrayToUrl(json[key], key)
          : objectToUrl(json[key], key)
    );
  }).join("&");
}

function arrayToUrl(array, prefix = "") {
  let result = "";

  array.forEach((item, index) => {
    if (notAllowed(item)) {
      throw new Error(`objectToUrlString: Encounter not allowed value at: ${prefix} index: ${index}`);
    }

    else if (isBasicType(item)) {
      result += prefix + `[]=${item}&`;
    }

    else if (Array.isArray(item)) {
      result += arrayToUrl(item, prefix + `[${index}]`);
    }

    else {
      result += objectToUrl(item, prefix + `[${index}]`);
    }
  });

  return result;
}

function objectToUrl(object, prefix = "") {

  let result = "";

  Object.keys(object).forEach(key => {

    if (notAllowed(object[key])) {
      throw new Error(`objectToUrlString: Encounter not allowed value at: ${prefix}`);
    }

    else if (isBasicType(object[key])) {
      result += prefix + `[${key}]=${object[key]}&`;
    }

    else if (Array.isArray(object[key])) {
      result += arrayToUrl(object[key], prefix + `[${key}]`);
    }

    else {
      result += objectToUrl(object[key], prefix + `[${key}]`);
    }

    return result;

  });

  return result;
}

function sliceEndAnd(value) {
  return value.replace(/&$/g, "");
}
