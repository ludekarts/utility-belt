// import { version } from "../package.json";

// Version
export const version_utb = 0;//version;

// General.
export * from "./utilities/general.js";
export { default as deepCopy } from "./utilities/deep-copy.js";
export { default as copyText } from "./utilities/clipboard.js";
export { default as fuzzySearch } from "./utilities/fuzzy-search.js";
export { default as deepOverride } from "./utilities/deep-override.js";

// Schema.
export { schemaTypes, checkSchema } from "./utilities/schema-types.js";

// Request.
export * from "./utilities/request.js";

// URL Query.
export * from "./utilities/query.js";

// Arrays.
export * from "./utilities/arrays.js";

// Forms.
export * from "./utilities/forms.js";

// Messaging.
export { default as PubSub } from "./utilities/pubsub.js";

// Event handling.
export * from "./utilities/events.js";

// Hashing.
export * from "./utilities/hashing.js";

// Delay events.
export * from "./utilities/delay-events.js";

// Strings.
export * from "./utilities/strings.js";

// State management.
export * from "./utilities/minirdx.js";
export { default as loopstack } from "./utilities/loopstack.js";
export { default as createHistory } from "./utilities/history.js";

// DOM Helpers.
export * from "./utilities/cmp.js";
export * from "./utilities/template.js";
export * from "./utilities/component.js";
export * from "./utilities/dom-helpers.js";
export * from "./utilities/dom-manipulations.js";
export { default as highlight } from "./utilities/highlight.js";
export { default as importHtml } from "./utilities/import-html.js";
export { default as createElement } from "./utilities/create-element.js";
export { default as includeScriptTag } from "./utilities/include-script.js";
