import { isObject } from "./general.js";

// NOTE:
//
// - fallback: when provided response from all failed requests will be supplied with
//             given fallback value. No erroe will be thrown just warning in the
//             console.
//
// - freepass: allows to pass through response even if it contains error messages.
//             This is usefull when server returns error pages with some additional
//             content e.g. JSON data.

//
// ABORTING REQUESTS:
//
// import request, { abort } from "request";
// ...
//
// const myRequest = request("https://get/data", config);
// abort(myRequest);
//

// Container for all panding requests.
const requestQueue = new Map();

export default function request(url, configuration = {}) {
  const { fallback, freepass = false, ...config } = configuration;

  const controller = new AbortController();
  const { signal } = controller;

  const fetchPromise = fetch(url, { ...config, signal })
    // Remove from requests queue.
    .then(response => {
      requestQueue.delete(fetchPromise);
      return response;
    })
    // Check responde.
    .then(checkResponse(fallback, freepass));

  // Add request to the queue for cancelation.
  requestQueue.set(fetchPromise, () => {
    controller.abort();
  });

  return fetchPromise;
}

// ---- Utilities ----------------

function checkResponse(fallback, freepass) {
  return response => {
    if (response.ok || freepass) return response;

    if (fallback) {
      console.warn(
        `Request rejected: ${response.statusText}. Fallback applied`,
      );
      return fallback;
    }
    throw RequestError(response);
  };
}

function RequestError(response) {
  const error = Error();
  error.code = response.status;
  error.message = response.statusText;
  return error;
}

export function objectToFetchBody(objectBody) {
  // Handle pure FormData.
  if (objectBody instanceof FormData) {
    return {
      body: objectBody,
    };
  }

  // Transform object into FormData
  if (isObject(objectBody)) {
    const body = new FormData();
    Object.keys(objectBody).forEach(name =>
      body.append(name, JSON.stringify(objectBody[name])),
    );
    return body;
  }

  // Pass whatewer objectBody is.
  return objectBody;
}

// ---- Helpers ----------------

// Allows to abort given request.
export function abort(requestToCancel) {
  if (requestQueue.has(requestToCancel)) {
    requestQueue.get(requestToCancel)();
    requestQueue.delete(requestToCancel);
  }
}

// Parses some of the common response types. e.g:
// text/...
// image/...
// application/json
// multipart/form-data
//
export function parseResponse(response) {
  // Get Content Type.
  const contentType = response.headers.get("content-type").split(";")[0];

  // Handle various content types.

  if (/^text\//.test(contentType)) {
    return response.text();
  }

  if (/^image\//.test(contentType)) {
    return response.blob();
  }

  switch (contentType) {
    case "application/json":
      return response.json();
    case "multipart/form-data":
      return response.formData();
    default:
      console.warn(
        `Not recognized content-type: ${response.headers.get("content-type")}`,
      );
      return response;
  }
}
