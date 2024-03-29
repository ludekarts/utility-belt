import { isObject } from "./general.js";

/*
  Configuration options:
  headers: {};                   // Request headers.
  method: "GET";                 // GET, POST, PUT, DELETE, etc.
  redirect: "follow";            // manual, follow, error
  mode: "no-cors";               // no-cors, cors, same-origin
  credentials: "omit";           // include, same-origin, omit
  cache: false;                  // default, no-cache, reload, force-cache, only-if-cached
  referrerPolicy: "no-referrer"; // no-referrer, no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  responseProcessor: [],         // Array of processor functions
  requestHash: "",
  fallback: false,
  cacheRequests: false,
  useErrorWrapper: false,
  doNotParseResponse: false,
*/

const requestAllowProps = [
  // "headers",           // Special case for procesing.
  "mode",
  "body",
  "cache",
  "method",
  "redirect",
  "credentials",
  "referrerPolicy",
];

const nativeAllowProps = [
  // "responseProcessor", // Special case for procesing.
  "fallback",
  "requestHash",
  "cacheRequests",
  "useErrorWrapper",
  "doNotParseResponse",
];

export class RequestConfig {
  constructor(config) {

    this.native = {};
    this.headers = {};
    this.requestConfig = {};
    this.responseProcessor = [];

    if (isObject(config)) {
      for (const key in config) {
        if (config.hasOwnProperty(key) && config[key] !== undefined) {
          this.update(key, config[key]);
        }
      }
      Object.freeze(this.native);
      Object.freeze(this.headers);
      Object.freeze(this.requestConfig);
      Object.freeze(this.responseProcessor);
    }

    else if (config !== undefined) {
      throw new Error("Config argument should be Undefuned or an Object");
    }
  };

  #updateResponseProcessor(target, sourceValue) {
    if (typeof sourceValue === "function") {
      target.responseProcessor = [sourceValue];
    } else if (Array.isArray(sourceValue)) {
      target.responseProcessor = sourceValue;
    } else {
      throw new Error("ResponseProcessor should be Undefined. In other case it should return a Function or an Array");
    }
  };

  #updateHeaders(target, sourceValue) {
    if (typeof sourceValue === "function") {
      target.headers = sourceValue({ ...target.headers });
    } else if (isObject(sourceValue)) {
      target.headers = { ...sourceValue };
    } else {
      throw new Error("Headers property should be an Object");
    }
  };

  update(key, value) {

    if (key === "responseProcessor") {
      this.#updateResponseProcessor(this, value);
    }

    else if (key === "headers") {
      this.#updateHeaders(this, value);
    }

    else if (requestAllowProps.includes(key)) {
      this.requestConfig[key] = value;
    }

    else if (nativeAllowProps.includes(key)) {
      this.native[key] = value;
    }

  };

  merge(source) {

    if (!source) {
      return this;
    } else if (!(source instanceof RequestConfig)) {
      throw new Error("Configuration object should be instace of RequestConfig");
    }

    return new RequestConfig({
      ...this.requestConfig,
      ...source.requestConfig,
      headers: {
        ...this.headers,
        ...(source.headers || {}),
      },
      ...this.native,
      ...source.native,
      responseProcessor: [
        ...this.responseProcessor,
        ...(source.responseProcessor || []),
      ],
    });
  }
};


export function createRequest(config) {

  if (config && !(config instanceof RequestConfig)) {
    throw new Error("Configuration object should be instace of RequestConfig");
  }

  // Container for all pending requests.
  const requestQueue = new Map();

  // Container for all cached requests.
  const requestCache = new Map();

  // Global configuration.
  const globalConfiguration = config || new RequestConfig();


  // Default request.
  function request(url, config) {

    let { native, requestConfig, headers, responseProcessor } = globalConfiguration.merge(config);

    // Set proper request body.
    if (requestConfig.body) {

      if (requestConfig.method.toLowerCase() === "get") {
        const { body, ...rqConfig } = requestConfig;
        url += typeof body === "string" ? `?${body}` : `?${objectToUrlString(body)}`;
        requestConfig = rqConfig;
      }
      else {
        requestConfig = {
          ...requestConfig,
          body: encodeBody(requestConfig.body, headers)
        };
      }
    }

    const requestHash = `${url}${native.requestHash || ""}`;
    const cachedResponse = native.cacheRequests && requestCache.has(requestHash)

    if (cachedResponse) {
      return getResponseFromCache(requestCache, requestHash);
    }

    const controller = new AbortController();
    const { signal } = controller;

    const requestCleanup = response => {
      requestQueue.delete(fetchPromise);
      return response;
    };

    const finalRequestCofig = { ...requestConfig, headers, signal };

    const fetchPromise = fetch(url, finalRequestCofig)
      // Remove from requests queue.
      .then(requestCleanup)
      // Parse response.
      .then(response => !native.doNotParseResponse ? parseResponse(response, native.fallback, native.useErrorWrapper) : response)
      // Cache & Process request.
      .then(response => native.cacheRequests
        ? cacheResponse(response, requestHash, requestCache, responseProcessor)
        : responseProcessor
          ? responseProcessor.reduce((acc, processor) => processor(acc), response)
          : response
      )
      // Remove from requests queue on failure.
      .catch(handleError(requestCleanup));


    // Add request to the queue for cancelation.
    !cachedResponse && requestQueue.set(fetchPromise, () => controller.abort());

    return fetchPromise;
  }


  // --------------------------
  // ---- GET -----------------
  // --------------------------

  function get(url, body) {
    const requestConfig = body instanceof RequestConfig
      ? body.merge(new RequestConfig({ method: "GET" }))
      : Boolean(body)
        ? new RequestConfig({ method: "GET", body })
        : new RequestConfig({ method: "GET" });
    return request(url, requestConfig);
  }


  // --------------------------
  // ---- POST ----------------
  // --------------------------

  function post(url, body) {
    const requestConfig = body instanceof RequestConfig
      ? body.merge(new RequestConfig({ method: "POST" }))
      : Boolean(body)
        ? new RequestConfig({ method: "POST", body })
        : new RequestConfig({ method: "POST" });
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
        globalConfiguration.update(key, config[key]);
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


// ---- helpers ----------------

function cacheResponse(response, requestHash, cache, responseProcessor) {
  const processedResponse = Boolean(responseProcessor) ? responseProcessor.reduce((acc, processor) => processor(acc), response) : response;
  cache.set(requestHash, processedResponse);
  return processedResponse;
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

  if (!body) return undefined;

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
    return isObject(body) ? objectToRequestBody(body) : JSON.stringify(body);
  }
}


export function objectToRequestBody(body) {
  const searchParams = new URLSearchParams();
  Object.keys(body).forEach(name => {
    const data = isBasicType(body[name]) ? body[name] : JSON.stringify(body[name]);
    searchParams.append(name, data);
  });
  return searchParams;
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


function objectToUrlString(json) {
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

function sliceEndAnd(value) {
  return value.replace(/&$/g, "");
}

function notAllowed(value) {
  return value === null
    || value === undefined
    || typeof value === "symbol"
    || typeof value === "function";
}

function isBasicType(value) {
  return typeof value === "string"
    || typeof value === "number"
    || typeof value === "boolean";
}
