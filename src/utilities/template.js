import { loop, nodeListToArray } from "./arrays.js";
import { placeStrBetween } from "./strings.js";


const elements = elementsStore();
const elementsRefs = new WeakMap();

// Clean up element (by default) every 5 minutes.
let terminateElementsIntervel = 300_000;
let terminateTimre = setInterval(elements.cleanup, terminateElementsIntervel);


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

html.__setTerminateInterval = function (time) {
  if (!Boolean(time)) {
    return terminateElementsIntervel;
  } else {
    clearInterval(terminateTimre);
    terminateElementsIntervel = time;
    terminateTimre = setInterval(elements.cleanup, terminateElementsIntervel);
  }
}

export function debugElementsStore() {
  elements.trace();
  console.log("Elements references:", elementsRefs);
  console.log("Terminate Interval:", html.__setTerminateInterval());
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

    // Detect attributes.
    if (isAttribute(html)) {
      const splitIndex = html.lastIndexOf("<");
      const head = html.slice(0, splitIndex);
      const element = html.slice(splitIndex); // Markup of element with current attribute.

      // Update data-hook attribute.
      if (element.includes("data-hook")) {
        html = head + element.replace(/data-hook="(.+?)"/, (_, refs) => `data-hook="${refs} ${index}"`);
      }

      // Create new data-hook attribute.
      else {
        html = head + placeStrBetween(element, ` data-hook="${index}"`, element.indexOf(" "));
      }

      // Detect boolean attribute.
      if (/ \?.+="$/.test(element)) {
        const sliceIndex = html.lastIndexOf("?");
        binding.bool = html.slice(sliceIndex + 1, html.lastIndexOf("="));
        html = html.slice(0, sliceIndex) + html.slice(sliceIndex + 1);
        value = "";
      }

      // Process value for non-boolean attributes.
      else {
        value = `%#${index}#%`;
      }
    }

    // Detect HTML Elements.
    else if (isDomNode(value)) {
      value = `<i data-hook="${index}" data-hte="true"></i>`;
    }

    // Detect Array of Nodes.
    else if (Array.isArray(value)) {
      value = `<i data-hook="${index}" data-lst="true"></i>`;
    }

    // Detect Numbers & Strings.
    else if (isNumberOrString(value)) {
      value = `<i data-hook="${index}" data-ref="true"></i>`;
    }

    // Clamp other types into empty string.
    else {
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

        // Insert TextNode for Strings & Numbers.
        if (hook.dataset.ref) {
          currentElement.type = "text";
          currentElement.ref = document.createTextNode(currentElement.value);
          hook.parentNode.replaceChild(currentElement.ref, hook);
        }

        // HTML Elements.
        else if (hook.dataset.hte) {
          currentElement.type = "node";
          hook.parentNode.replaceChild(currentElement.value, hook);
        }

        // NodeList.
        else if (hook.dataset.lst) {
          const parent = hook.parentNode;
          currentElement.type = "list";
          currentElement.parent = parent;
          insertNodeList(currentElement.value, hook, parent);
        }

        // Attributes.
        else {
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
            }

            // Throw if value type is incorrect.
            else {
              throw new Error(`Only String and Numbers can be passedt to the attributes, got: "${typeof currentElement.value}" at "${index}" value.`);
            }
          }

          else {
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
  loop(inserts, (insert, index) =>
    insert !== elementsBindings[index].value && updateReference(elementsBindings[index], insert)
  );
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

  const store = new Map();

  function allowKey(key) {
    if (key === null || key === undefined)
      throw new Error("Key cannot be null or undefined");
    return key;
  }

  function has(key) {
    return store.has(allowKey(key));
  }

  function get(key) {
    return store.get(allowKey(key));
  }

  function set(key, value) {
    return store.set(allowKey(key), value);
  }

  function remove(key) {
    return store.delete(allowKey(key));
  }

  function cleanup() {
    for (const [key, value] of store) {
      // Remove only detached nodes.
      if (!document.body.contains(value.element)) {
        elementsRefs.delete(value.element);
        store.delete(key);
      }
    }
  }

  function trace() {
    console.log("store:\n", store);
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

  // Update attribute.
  if (element.type === "attribute") {

    // Update Boolean attribute.
    if (element.bool) {
      !!newValue
        ? element.ref.setAttribute(element.bool, element.bool)
        : element.ref.removeAttribute(element.bool);
    }

    // Update attributes of Numbers and Strings.
    else if (isNumberOrString(newValue)) {
      element.ref.setAttribute(
        element.attribute.name,
        element.attribute.template.replace(new RegExp(`%#${element.index}#%`), newValue)
      );
    }

    // Throw if invalid value type.
    else {
      throw new Error(`Only String and Numbers can be passed to the attributes, got: "${typeof newValue}" at value of index: "${element.index}".`);
    }
  }

  // Update TextNode.
  else if (element.type === "text") {

    // Update TextNode to -> TextNode (Strings || Numbers).
    if (isNumberOrString(newValue)) {
      element.ref.textContent = newValue;
    }

    // Update TextNode to -> Single DOM Node.
    else if (isDomNode(newValue)) {
      element.type = "node";
      element.ref.parentNode.replaceChild(newValue, element.ref);
    }

    // Update TextNode to -> Array of DOM Nodes.
    else if (Array.isArray(newValue)) {
      const parent = element.ref.parentNode;
      element.type = "list";
      element.parent = parent;
      insertNodeList(newValue, element.ref, parent);
    }

  }

  // Update Single DOM Node.
  else if (element.type === "node") {

    // Update Single DOM Node to -> TextNode (Strings || Numbers).
    if (isNumberOrString(newValue)) {
      const textNode = document.createTextNode(newValue);
      element.type = "text";
      element.ref = textNode;
      element.value.parentNode.replaceChild(textNode, element.value);
    }

    // Update Single DOM Node to -> DOM Node.
    else if (isDomNode(newValue)) {
      element.value.parentNode.replaceChild(newValue, element.value);
    }

    // Update Single DOM Node to -> Array of DOM Nodes.
    else if (Array.isArray(newValue)) {
      const parent = element.value.parentNode;
      element.type = "list";
      element.parent = parent;
      insertNodeList(newValue, element.value, parent);
    }

  }

  // Update Nodes List.
  else if (element.type === "list") {

    // Update Array of DOM Nodes to -> TextNode (Strings || Numbers).
    if (isNumberOrString(newValue)) {
      const textNode = document.createTextNode(newValue);
      element.type = "text";
      element.ref = textNode;
      element.parent.insertBefore(textNode, element.value[0]);
      loop(element.value, node => node.remove());
      element.parent = undefined;
    }

    // Update Array of Nodes to -> Single DOM Node.
    else if (isDomNode(newValue)) {
      element.type = "node";
      element.parent.insertBefore(newValue, element.value[0]);
      loop(element.value, node => node.remove());
      element.parent = undefined;
    }

    // Update Array of DOM Nodes to -> Array of DOM Nodes.
    else if (Array.isArray(newValue)) {

      /*        
        Implement 4 basic update actions to update DOM tree.
      
        - ADD:      when node is the new one.
        - SKIP:     when node matches old position.
        - MOVE:     when node position changed.
        - REVMOE:   when node does not esist.
      */

      // Remove all nodes that does not exist in newValue array.
      loop(element.value, node => !newValue.includes(node) && node.remove());

      // Update remaining nodes.
      loop(newValue, (newNode, index) => {
        const oldIndex = element.value.indexOf(newNode);

        // Add (append new node).
        if (oldIndex === -1) {
          addNodeAtIndex(index, newNode, element.parent);
        }

        // Move (node does not match old position).
        else if (element.value[index] !== newNode) {
          addNodeAtIndex(index, newNode, element.parent)
        }

        // Skip (new node matches its old position).
        else if (element.value[index] === newNode) {
          /* Do nothing*/
        }

      });

    }
  }
  element.value = newValue;
}

// Simplify adding nodes ad given index.
function addNodeAtIndex(index, node, parent) {
  node !== parent.children[index]
    ? index === 0
      ? parent.children.length === 0
        ? parent.append(node)
        : parent.children[0].before(node)
      : parent.children[index - 1].after(node)
    : null;
}

// Check if current provessing value in HTML is for attribute.
function isAttribute(html) {
  return html.lastIndexOf("<") > html.lastIndexOf(">");
}

// Allow Strings and Numbers.
function isNumberOrString(value) {
  return value !== undefined && (typeof value === "number" || typeof value === "string");
}

// Verify if given @node is instance of a Text or HTMLElement.
function isDomNode(node) {
  return node instanceof HTMLElement || node instanceof Text;
}

// Insert all nodes from the @nodeList into @parent element starting from @pointer element.
function insertNodeList(nodeList, pointer, parent) {
  loop(nodeList, node => isDomNode(node) && parent.insertBefore(node, pointer));
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
