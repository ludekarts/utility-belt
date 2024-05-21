// import { version } from "../package.json";

// Version
export const version_utb = "0.7.1-beta.4"; //version;

// General.
export * from "./utilities/general.js";
export * from "./utilities/transform.js";
export { default as deepCopy } from "./utilities/deep-copy.js"; // TODO: Deprecate this - now browser uses window.structuredClone().
export { default as copyText } from "./utilities/clipboard.js";
export { default as fuzzySearch } from "./utilities/fuzzy-search.js";
export { default as deepOverride } from "./utilities/deep-override.js"; // TODO: Deprecate this - can be achieved with transformObject().

// Schema.
export { schemaTypes, checkSchema } from "./utilities/schema-types.js"; // TODO: Deprecate this - almost never used.

// Request.
export * from "./utilities/request.js";
export * from "./utilities/request.legacy.js"; // TODO: Deprecate this - use request.js instead.

// URL Query.
export * from "./utilities/query.js";

// Arrays.
export * from "./utilities/arrays.js"; // TODO: Remove what is already in browser.

// Forms.
export * from "./utilities/forms.js";

// Messaging.
export { default as PubSub } from "./utilities/pubsub.js";

// Event handling.
export * from "./utilities/events.js"; // TODO: Verify usefulness of this.

// Hashing.
export * from "./utilities/hashing.js";

// Delay events.
export * from "./utilities/delay-events.js";

// Strings.
export * from "./utilities/strings.js"; // TODO: Remove what is already in browser.

// State management.
export * from "./utilities/minirdx.js";
export { default as loopstack } from "./utilities/loopstack.js";
export { default as createHistory } from "./utilities/history.js";

// DOM Helpers.
export * from "./utilities/template.js";
export * from "./utilities/component.js";
export * from "./utilities/dom-helpers.js";
export * from "./utilities/dom-manipulations.js";
export { default as highlight } from "./utilities/highlight.js";
export { default as importHtml } from "./utilities/import-html.js";
export { default as createElement } from "./utilities/create-element.js";
export { default as includeScriptTag } from "./utilities/include-script.js";
