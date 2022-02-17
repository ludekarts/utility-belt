import { loop, nodeListToArray } from "./arrays.js";
import { placeStrBetween } from "./strings.js";

const elements = elementsStore();
const elementsRefs = new WeakMap();

export function html(oneTimeMarkup, ...oneTimeInserts) {
  const isOneTimeTemplate = oneTimeMarkup !== undefined && Boolean(oneTimeMarkup.raw);

  if (isOneTimeTemplate) {
    const { element } = createTemplate(oneTimeMarkup, escapeStringsInArray(oneTimeInserts));
    return element;
  }

  return function (markup, ...inserts) {
    const key = oneTimeMarkup;

    // Bail if no key or the key is invalid.
    if (key === undefined || key === null || key === true || key === false) {
      throw new Error(`HTML Template Error: html() helper requires unique ID if called as function. Got ${key}`);
    }

    // Update elements.
    if (elements.has(key)) {
      const { element, elementBindings } = elements.get(key);
      updateComponent(elementBindings, escapeStringsInArray(inserts));
      return element;
    }

    // Create new element.
    if (!elements.has(key)) {
      const { element, elementBindings } = createTemplate(markup, escapeStringsInArray(inserts));
      const refs = getReferences(element);
      elements.set(key, { element, elementBindings });
      refs && elementsRefs.set(element, refs);
      return element;
    }

  };
}

// Get node references. This will skip the insert nodes, since they alreay have external referenes.
html.refs = function (element) {
  if (element instanceof HTMLElement) {
    return elementsRefs.get(element) || {};
  }
  throw new Error("HTML Template Error: refs() helper should be called with an HTMLElement");
}

// Removes element and all its references.
// When provided null key then all detached elemnts will be removed.
html.destroy = function (key) {
  if (key === null) {
    elements.cleanup();
  } else {
    const { element } = elements.get(key);
    elementsRefs.delete(element);
    element.remove();
    return elements.remove(key);
  }
}


export function debugElementsStore() {
  elements.trace();
  console.log("Elements references:", elementsRefs);
}

export function derivableState(prevState, newState) {
  return newState !== undefined
    ? typeof newState === "function"
      ? newState(prevState)
      : newState
    : prevState;
}


// ---- Helpers ----------------

// Creates HTMLElement and it's data bindings.
function createTemplate(markup, inserts) {
  const elementBindings = [];
  const wrapper = document.createElement("div");

  // Combine HTML markup and add placeholders for external inputs.
  const componentHtml = markup.reduce((acc, part, index) => {
    let value = inserts[index];
    let html = acc += part;
    let binding = { value, index };

    if (isAttribute(html)) {
      const splitIndex = html.lastIndexOf("<");
      const head = html.slice(0, splitIndex);
      const element = html.slice(splitIndex); // Markup of element with current attribute.

      if (element.includes("data-hook")) {
        // Update data-hook attribute.
        html = head + element.replace(/data-hook="(.+?)"/, (_, refs) => `data-hook="${refs} ${index}"`);
      } else {
        // Create new data-hook attribute.
        html = head + placeStrBetween(element, ` data-hook="${index}"`, element.indexOf(" "));
      }

      // Detect boolean attribute.
      if (/ \?.+="$/.test(element)) {
        const sliceIndex = html.lastIndexOf("?");
        binding.bool = html.slice(sliceIndex + 1, html.lastIndexOf("="));
        html = html.slice(0, sliceIndex) + html.slice(sliceIndex + 1);
        value = "";
      } else {
        // Process value for non-boolean attributes.
        value = `%#${index}#%`;
      }
    } else if (isDomNode(value)) {
      // HTML Elements
      value = `<i data-hook="${index}" data-hte="true"></i>`;
    } else if (Array.isArray(value)) {
      // Array of nodes.
      value = `<i data-hook="${index}" data-lst="true"></i>`;
    } else if (isNumberOrString(value)) {
      // Numbers & Strings.
      value = `<i data-hook="${index}" data-ref="true"></i>`;
    } else {
      value = "";
    }

    elementBindings.push(binding);

    return html + (value || "");
  }, "");

  // HTML template to DOM elements.
  wrapper.insertAdjacentHTML("beforeend", componentHtml);

  // Map external inputs to nodes and attibutes.
  loop(
    nodeListToArray(wrapper.querySelectorAll("[data-hook]")),
    hook => {
      loop(hook.dataset.hook.split(" "), index => {
        const currentElement = elementBindings[index];

        if (hook.dataset.ref) {
          // Insert textNode for simplet text.
          currentElement.type = "text";
          currentElement.ref = document.createTextNode(currentElement.value);
          hook.parentNode.replaceChild(currentElement.ref, hook);
        } else if (hook.dataset.hte) {
          // HTML Elements.
          currentElement.type = "node";
          hook.parentNode.replaceChild(currentElement.value, hook);
        } else if (hook.dataset.lst) {
          // NodeList.
          const parent = hook.parentNode;
          currentElement.type = "list";
          currentElement.parent = parent;
          insertNodeList(currentElement.value, hook, parent);
        } else {
          currentElement.ref = hook;
          currentElement.type = "attribute";

          // Handle non-boolean attributes.
          if (!currentElement.bool) {
            // Only Number and string in attinutes.
            if (isNumberOrString(currentElement.value)) {
              const attribute = getAttribute(index, hook);
              currentElement.attribute = attribute;
              hook.setAttribute(
                attribute.name,
                attribute.template.replace(new RegExp(`%#${index}#%`), currentElement.value),
              );
            } else {
              throw new Error(`Only String and Numbers can be passedt to the attributes, got: "${typeof currentElement.value}" at "${index}" value.`);
            }
          } else {
            !!currentElement.value
              ? hook.setAttribute(currentElement.bool, currentElement.bool)
              : hook.removeAttribute(currentElement.bool);
          }
        }
        hook.removeAttribute("data-hook");
      });
    });

  // // Strip wrapper node if not needed.
  const element = stripWrapper(wrapper);

  return {
    element,
    elementBindings,
  };
}

// Updates values in DOM nodes.
function updateComponent(elementsBindings, inserts) {
  loop(inserts, (insert, index) => {
    if (insert !== elementsBindings[index].value) {
      updateReference(elementsBindings[index], insert);
    }
  });
}

// Pull out and cleanup "ref" hooks.
function getReferences(element) {
  const refs = {};
  const refsElements = nodeListToArray(element.querySelectorAll("[ref]"));
  loop(
    refsElements,
    refNode => {
      const refName = refNode.getAttribute("ref");
      refs[refName] = refNode;
      refNode.removeAttribute("ref");
    }
  );
  return refsElements.length ? Object.freeze(refs) : undefined;
}

// Manages elements storage.
function elementsStore() {

  const hardStore = new Map();
  const weakStore = new WeakMap();

  function isHardKey(key) {
    if (key === null || key === undefined)
      throw new Error("Key cannot be null or undefined");
    return typeof key === "string"
      || typeof key === "number"
      || typeof key === "symbol";
  }

  function has(key) {
    return isHardKey(key) ? hardStore.has(key) : weakStore.has(key);
  }

  function get(key) {
    return isHardKey(key) ? hardStore.get(key) : weakStore.get(key);
  }

  function set(key, value) {
    return isHardKey(key) ? hardStore.set(key, value) : weakStore.set(key, value);
  }

  function remove(key) {
    return isHardKey(key) ? hardStore.delete(key) : weakStore.delete(key);
  }

  function cleanup() {
    for (const [key, value] of hardStore) {
      if (!value.element.parentNode) {
        elementsRefs.delete(value.element);
        hardStore.delete(key);
      }
    }
  }

  function trace() {
    console.log("HardStore:\n", hardStore); // String-as-key.
    console.log("WeakStore:\n", weakStore); // Object-as-key.
  }

  return Object.freeze({
    set,
    has,
    get,
    trace,
    remove,
    cleanup,
  });
}

function escapeStringsInArray(array) {
  return array.map(i => typeof i === "string" ? escapeHtml(i) : i);
}

// Updates values of an element and it's references.
function updateReference(element, newValue) {
  if (!element) return;

  // Update attributes.
  if (element.type === "attribute") {
    if (element.bool) {
      !!newValue
        ? element.ref.setAttribute(element.bool, element.bool)
        : element.ref.removeAttribute(element.bool);
    } else {
      if (isNumberOrString(newValue)) {
        element.ref.setAttribute(
          element.attribute.name,
          element.attribute.template.replace(new RegExp(`%#${element.index}#%`), newValue)
        );
      } else {
        throw new Error(`Only String and Numbers can be passed to the attributes, got: "${typeof newValue}" at "${element.index}" value.`);
      }
    }
    // Update text values.
  } else if (element.type === "text") {
    if (isNumberOrString(newValue)) {
      element.ref.textContent = newValue;
    } else if (isDomNode(newValue)) {
      element.type = "node";
      element.ref.parentNode.replaceChild(newValue, element.ref);
    } else if (Array.isArray(newValue)) {
      const parent = element.ref.parentNode;
      element.type = "list";
      element.parent = parent;
      insertNodeList(newValue, element.ref, parent);
    }
    // Update DOM nodes.
  } else if (element.type === "node") {
    if (isNumberOrString(newValue)) {
      const textNode = document.createTextNode(newValue);
      element.type = "text";
      element.ref = textNode;
      element.value.parentNode.replaceChild(textNode, element.value);
    } else if (isDomNode(newValue)) {
      element.value.parentNode.replaceChild(newValue, element.value);
    } else if (Array.isArray(newValue)) {
      const parent = element.value.parentNode;
      element.type = "list";
      element.parent = parent;
      insertNodeList(newValue, element.value, parent);
    }
    // Update Nodes List.
  } else if (element.type === "list") {
    if (isNumberOrString(newValue)) {
      const textNode = document.createTextNode(newValue);
      element.type = "text";
      element.ref = textNode;
      element.parent.insertBefore(textNode, element.value[0]);
      loop(element.value, node => node.remove());
      element.parent = undefined;
    } else if (isDomNode(newValue)) {
      element.type = "node";
      element.parent.insertBefore(newValue, element.value[0]);
      loop(element.value, node => node.remove());
      element.parent = undefined;
    } else if (Array.isArray(newValue)) {

      // Delete removed nodes.
      let notRemoved = [];

      loop(element.value, node => {
        newValue.includes(node)
          ? notRemoved.push(node)
          : node.remove();
      });

      // Update elements list.
      element.value = notRemoved;

      // Append new children (skip existing).
      loop(newValue, (newNode, index) => {
        const oldNode = element.value[index];
        if (oldNode !== newNode) {
          oldNode === undefined
            ? element.parent.appendChild(newNode) // Add new node.
            : oldNode.parentNode.replaceChild(newNode, oldNode); // Replace node.            
        }
      });
    }
  }
  element.value = newValue;
}

// Check if current provessing value in HTML is for attribute.
function isAttribute(html) {
  return html.lastIndexOf("<") > html.lastIndexOf(">");
}

// Allow Strings and Numbers.
function isNumberOrString(value) {
  return value !== undefined && (typeof value === "number" || typeof value === "string");
}

function isDomNode(node) {
  return node instanceof HTMLElement || node instanceof Text;
}

function insertNodeList(nodeList, pointer, parent) {
  loop(nodeList, entry => {
    if (isDomNode(entry)) {
      parent.insertBefore(entry, pointer);
    }
  });
  pointer.remove();
}

// Remove element wrapper if not needed.
function stripWrapper(wrapper) {
  return wrapper.children.length === 1
    ? wrapper.children[0]
    : wrapper;
}

// Pull out attribute's template and name for given index.
function getAttribute(index, node) {
  const attribute = Array.prototype.slice.call(node.attributes).find(
    attr => new RegExp(`%#${index}#%`).test(attr.value)
  );
  return {
    name: attribute.name,
    template: attribute.value,
  };
}

// Escaepe HTML symbols.
export function escapeHtml(s) {
  const reEscape = /[&<>'"]/g;
  const oEscape = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    "\"": "&quot;",
  };
  return s.replace(reEscape, m => oEscape[m]);
}

// Unescaepe HTML symbols.
export function unEscapeHtml(s) {
  const reUnescape = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g;
  const oUnescape = {
    '&amp;': '&',
    '&#38;': '&',
    '&lt;': '<',
    '&#60;': '<',
    '&gt;': '>',
    '&#62;': '>',
    '&apos;': "'",
    '&#39;': "'",
    '&quot;': '"',
    '&#34;': '"'
  };
  return s.replace(reUnescape, m => oUnescape[m]);
}