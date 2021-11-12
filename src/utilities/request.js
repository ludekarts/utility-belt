import { isObject } from "./general.js";
import deepOverride from "./deep-override.js"

export default function createRequest(config) {

  if (config && !(config instanceof RequestConfig)) {
    throw new Error("Configuration object should be instace of RequestConfig");
  }

  // Container for all pending requests.
  const requestQueue = new Map();

  // Container for all cached requests.
  const requestCache = new Map();

  // Global configuration.
  const globalConfiguration = config ? { ...config } : {};

  // Default request.
  function request(url, config) {

    if (config && !(config instanceof RequestConfig)) {
      throw new Error("Configuration object should be instace of RequestConfig");
    }

    const controller = new AbortController();
    const { signal } = controller;
    const { native } = config;

    const requestCleanup = response => {
      requestQueue.delete(fetchPromise);
      return response;
    };

    const requestHash = `${url}${native.requestHash}`;
    const cachedResponse = native.cacheRequests && requestCache.has(requestHash)
      ? getResponseFromCache(requestCache, requestHash)
      : undefined;

    const fetchPromise = cachedResponse ||
      fetch(url, { ...config, signal })
        // Remove from requests queue.
        .then(requestCleanup)
        // Parse response.
        .then(response => !native.doNotParseResponse ? parseResponse(response, native.fallback, native.useErrorWrapper) : response)
        // Cache request.
        .then(response => native.cacheRequests ? cacheResponse(response, requestHash, requestCache, native.responseProcessor) : response)
        // Remove from requests queue on failure.
        .catch(handleError(requestCleanup));


    // Add request to the queue for cancelation.
    !cachedResponse && requestQueue.set(fetchPromise, () => controller.abort());

    return fetchPromise;
  }

  // -------------------------- 
  // ---- GET -----------------
  // -------------------------- 

  function get(url, config) {
    if (config && !(config instanceof RequestConfig)) {
      throw new Error("Configuration object should be instace of RequestConfig");
    }

    const requestConfig = new RequestConfig({
      ...deepOverride(globalConfiguration, config || {}),
      method: "GET",
    });

    return request(url, requestConfig);
  }


  // -------------------------- 
  // ---- POST ----------------
  // -------------------------- 

  function post(url, config, body) {

    const configuration = config instanceof RequestConfig ? config : body instanceof RequestConfig ? body : !body ? undefined : undefined;
    const bodyContent = (body && !(body instanceof RequestConfig)) ? body : (config && !(config instanceof RequestConfig)) ? config : undefined;

    if (configuration && !(configuration instanceof RequestConfig)) {
      throw new Error("Configuration object should be instace of RequestConfig");
    }

    const requestConfig = new RequestConfig({
      ...deepOverride(globalConfiguration, configuration || {}),
      method: "POST",
      body: encodeBody(bodyContent, configuration?.headers),
    });

    return request(url, requestConfig);
  }

  // Allows to abort given request.
  function abort(requestToCancel) {
    if (requestQueue.has(requestToCancel)) {
      requestQueue.get(requestToCancel)();
      requestQueue.delete(requestToCancel);
    }
  }

  function releaseCache(url, requestHash = "") {

    if (typeof requestHash !== "string") {
      throw new Error(`RequestHash need to be a string`);
    }

    const key = !url ? null : url instanceof RegExp ? url : `${url}${requestHash}`;

    // Remove by URL + HASH;
    if (typeof key === "string") {
      requestCache.delete(key);
    }

    // Remove by Reular Expression.
    else if (key instanceof RegExp) {
      for (let cacheKey of requestCache.keys()) {
        key.test(cacheKey) && requestCache.delete(cacheKey);
      }
    }

    // Remove all instances.
    else {
      requestCache.clear();
    }
  }

  function updateConfig(config) {
    for (const key in config) {
      if (config.hasOwnProperty(key)) {
        globalConfiguration[key] = config[key];
      }
    }
  }

  return {
    get,
    post,
    abort,
    request,
    releaseCache,
    updateConfig,
  };
};


/*
  Configuration options:
  this.headers = {};   
  this.method = "GET";                 // GET, POST, PUT, DELETE, etc.
  this.redirect = "follow";            // manual, follow, error
  this.mode = "no-cors";               // no-cors, cors, same-origin  
  this.credentials = "omit";           // include, same-origin, omit
  this.cache = false;                 // default, no-cache, reload, force-cache, only-if-cached 
  this.referrerPolicy = "no-referrer"; // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  this.native = {
    cache: false,
    fallback: false,
    requestHash: "",
    useErrorWrapper: false,
    responseProcessor: false,
    doNotParseResponse: false,
  };
*/

const requestAllowProps = [
  "mode",
  "body",
  "cache",
  "method",
  "headers",
  "redirect",
  "credentials",
  "referrerPolicy",
];

const nativeAllowProps = [
  "fallback",
  "requestHash",
  "cacheRequests",
  "useErrorWrapper",
  "responseProcessor",
  "doNotParseResponse",
];


export class RequestConfig {
  constructor(config) {

    this.native = {};

    for (const key in config) {
      if (config.hasOwnProperty(key)) {
        if (requestAllowProps.includes(key)) {
          this[key] = config[key];
        } else if (nativeAllowProps.includes(key)) {
          this.native[key] = config[key];
        }
      }
    }
  };
};



// ---- helpers ----------------

function cacheResponse(response, requestHash, cache, responseProcessor) {
  cache.set(requestHash, responseProcessor ? responseProcessor(response) : response);
  return response;
}

function getResponseFromCache(requestCache, requestHash) {
  return Promise.resolve(requestCache.get(requestHash));
}


async function parseResponse(response, fallback, useErrorWrapper = false) {

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
    console.warn(`Not recognized content-type: ${response.headers.get("content-type")}`);
    result = response;
  }

  if (response.ok) {
    return result;
  }

  else if (fallback) {
    return fallback;
  }

  else {
    if (useErrorWrapper) {
      throw {
        response: result,
        status: response.status,
        statusText: response.statusText,
      };
    } else {
      throw result;
    }
  }
}

function handleError(requestCleanup) {
  return error => {
    requestCleanup();
    throw error;
  };
}

function encodeBody(body, headers = {}) {
  const contentType = headers["content-type"] || headers["Content-Type"];

  if (contentType === "application/json") {
    return JSON.stringify(body);
  }

  else if (contentType === "text/plain") {
    return JSON.stringify(body);
  }

  else if (contentType === "application/x-www-form-urlencoded" && isObject(body)) {
    return new URLSearchParams(body);
  }

  else {
    return isObject(body) ? objectToFormData(body) : JSON.stringify(body);
  }
}

export function objectToFormData(body) {
  const formData = new FormData();
  Object.keys(body).forEach(name => {
    const data = isBasicType(body[name]) ? body[name] : JSON.stringify(body[name]);
    formData.append(name, data);
  });
  return formData;
}


function isBasicType(value) {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}
