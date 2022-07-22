import { loop, reduce, nodeListToArray } from "./arrays.js";
import { placeStrBetween } from "./strings.js";

const elements = elementsStore();
const elementsRefs = new WeakMap();

// Clean up element (by default) every 5 minutes.
let terminateElementsIntervel = 300_000;
let terminateTimre = setInterval(elements.cleanup, terminateElementsIntervel);


export function html(oneTimeMarkup, ...oneTimeInserts) {
  const isOneTimeTemplate = oneTimeMarkup !== undefined && Boolean(oneTimeMarkup.raw);

  if (isOneTimeTemplate) {
    const { element } = createTemplate(oneTimeMarkup, oneTimeInserts);
    return element;
  }

  return function (markup, ...inserts) {
    const key = oneTimeMarkup;

    // Bail if no key or the key is invalid.
    if (key === undefined || key === null || key === true || key === false) {
      throw new Error(`HTML Template Error: html() helper requires unique ID if called as a function. Now got: ${key}`);
    }

    // Update elements.
    if (elements.has(key)) {
      const { element, elementBindings } = elements.get(key);
      updateComponent(elementBindings, inserts);
      return element;
    }

    // Create new element.
    if (!elements.has(key)) {
      const { element, elementBindings } = createTemplate(markup, inserts);
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

// Finds element by it KEY identifier.
html.find = function (key) {
  if (!elements.has(key)) return;
  const { element } = elements.get(key);
  return element;
}

// Removes element and all its references.
// When provided null key then all detached elemnts will be removed.
html.destroy = function (key) {
  if (key && key.all === true) {
    elements.cleanup();
  } else {
    const { element } = elements.get(key);
    elementsRefs.delete(element);
    element.remove();
    return elements.remove(key);
  }
}

html.__setTerminateInterval = function (time) {
  if (time === undefined) {
    return terminateElementsIntervel;
  } else {
    clearInterval(terminateTimre);
    terminateElementsIntervel = time;
    terminateTimre = setInterval(elements.cleanup, terminateElementsIntervel);
  }
}

// ---- Templates Core ----------------

// Creates HTMLElement and it's data bindings.
function createTemplate(markup, inserts) {
  const elementBindings = [];
  const wrapper = document.createElement("div");
  const escapedInserts = escapeStringsInArray(inserts);

  // Combine HTML markup and add placeholders for external inputs.
  const componentHtml = reduce(Array.from(markup), (acc, part, index, isLast) => {
    let value = escapedInserts[index];
    let html = acc += part;
    let binding = { value, index };

    // Binding Object Spec.
    // {
    //   value:         current value of given entry,
    //   index:         index of inset in template,
    //   type:          type of given entry: [ "text", "node", "list", "attribute" ],
    //   ref:           reference to node holding given value; for attributes node with given attribute; for lists parent node,
    //   attribute: {
    //     name:        attribute name,
    //     bool:        flag attribute as boolean: [ true, false ],
    //     template:    attribute template to update,
    //   },
    // }

    // Last element of markup array does not generate placeholder so we do not process it.
    // We only add produced HTML at the end.
    if (!isLast) {

      let placeholder;

      // Detect attributes.
      if (isAttribute(html)) {
        const splitIndex = html.lastIndexOf("<");
        const head = html.slice(0, splitIndex);
        const element = html.slice(splitIndex); // Markup of element with current attribute.


        // Create new data-hook to keep track of attributes placeholders.
        if (!element.includes("data-hook")) {
          html = head + placeStrBetween(element, ` data-hook="${index}"`, element.indexOf(" "));
        }

        // Update data-hook attribute (multiple attributes in one element).
        else {
          html = head + element.replace(/data-hook="(.+?)"/, (_, refs) => `data-hook="${refs} ${index}"`);
        }

        // Detect boolean attributes e.g.: ?disabled="
        if (/ \?.+="$/.test(element)) {
          const sliceIndex = html.lastIndexOf("?");
          binding.attribute = {
            bool: true,
            name: html.slice(sliceIndex + 1, html.lastIndexOf("=")),
          };
          html = html.slice(0, sliceIndex) + html.slice(sliceIndex + 1);
          placeholder = "";
        }

        // Generate placeholder for value in non-boolean attributes.
        else {
          placeholder = `%#${index}#%`;
          binding.attribute = {
            bool: false,
          };
        }
      }

      // Allow for undefined values (treat them as an empty strings).
      else if (value === undefined) {
        placeholder = `<i data-hook="${index}" data-type="text"></i>`;
      }

      // Detect Numbers & Strings.
      else if (isNumberOrString(value)) {
        placeholder = `<i data-hook="${index}" data-type="text"></i>`;
      }

      // Detect HTML Elements.
      else if (isDomNode(value)) {
        placeholder = `<i data-hook="${index}" data-type="node"></i>`;
      }

      // Detect Array of Nodes.
      else if (Array.isArray(value)) {
        placeholder = `<i data-hook="${index}" data-type="list"></i>`;
      }

      // Clamp other types into empty string (just skip them).
      else {
        placeholder = "";
      }

      elementBindings.push(binding);
      return html + placeholder;

    }

    return html;

  }, "");

  // Parese HTML template into DOM elements.
  wrapper.insertAdjacentHTML("beforeend", componentHtml);

  // Map data-hook elements and attributes into their external inputs + complete bindings configuration.
  const dataHooks = nodeListToArray(wrapper.querySelectorAll("[data-hook]"));

  loop(dataHooks, hook => {

    const bindingIndexes = hook.dataset.hook.split(" ");
    loop(bindingIndexes, index => {

      const binding = elementBindings[index];
      const { type } = hook.dataset;

      // Insert TextNode for Strings, Numbers & Undefined.
      if (type === "text") {
        binding.type = "text";
        binding.ref = document.createTextNode(binding.value || "");
        hook.parentNode.replaceChild(binding.ref, hook);
      }

      // HTML Elements.
      else if (type === "node") {
        binding.type = "node";
        binding.ref = binding.value;
        hook.parentNode.replaceChild(binding.ref, hook);
      }

      // NodeList.
      else if (type === "list") {
        binding.type = "list";
        binding.ref = hook.parentNode;
        insetrNodesBefore(binding.value, hook);
      }

      // Attributes.
      else {
        binding.type = "attribute";
        binding.ref = hook;

        const isBooleanAtribute = binding.attribute.bool;
        const hasValue = Boolean(binding.value);

        // Handle boolean attributes.
        if (isBooleanAtribute) {
          hasValue
            ? hook.setAttribute(binding.attribute.name, binding.attribute.name)
            : hook.removeAttribute(binding.attribute.name);
        }

        // Handle non-boolean attributes.
        else if (isNumberOrString(binding.value)) {
          const { name, template } = getAttribute(index, hook);

          binding.attribute.name = name;
          binding.attribute.template = template;

          hook.setAttribute(name, template.replace(new RegExp(`%#${index}#%`), binding.value));
        }

        else {
          throw new Error(`Only String and Numbers can be passedt to the attributes, got: "${typeof binding.value}" at "${index}" value.`);
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
  const escapedInserts = escapeStringsInArray(inserts);
  loop(escapedInserts, updateChangedValues(elementsBindings));
}

// Updates values of an element and it's references.
function updateReference(binding, newValue) {
  if (!binding) return;

  // Update attribute.
  if (binding.type === "attribute") {

    const isBooleanAtribute = binding.attribute.bool;
    const hasValue = Boolean(binding.value);

    // Update boolean attributes.
    if (isBooleanAtribute) {
      hasValue
        ? binding.ref.setAttribute(binding.attribute.name, binding.attribute.name)
        : binding.ref.removeAttribute(binding.attribute);
    }

    // Update attributes of Numbers and Strings.
    else if (isNumberOrString(newValue)) {
      binding.ref.setAttribute(
        binding.attribute.name,
        binding.attribute.template.replace(new RegExp(`%#${binding.index}#%`), newValue)
      );
    }

    else {
      throw new Error(`Only String and Numbers can be passed to the attributes, got: "${typeof newValue}" at value of index: "${binding.index}".`);
    }
  }

  // Update TextNode.
  else if (binding.type === "text") {

    // TextNode to -> Empty String (undefined).
    if (newValue === undefined) {
      binding.ref.textContent = "";
    }

    // TextNode to -> TextNode (Strings || Numbers).
    else if (isNumberOrString(newValue)) {
      binding.ref.textContent = newValue;
    }

    // TextNode to -> Single DOM Node.
    else if (isDomNode(newValue)) {
      binding.type = "node";
      binding.ref.parentNode.replaceChild(newValue, binding.ref);
      binding.ref = newValue;
    }

    // TextNode to -> Array of DOM Nodes.
    else if (Array.isArray(newValue)) {
      const root = binding.ref.parentNode;
      insetrNodesBefore(newValue, binding.ref);
      binding.type = "list";
      binding.ref = root;
    }

  }

  // Update Single DOM Node.
  else if (binding.type === "node") {

    // Single DOM Node to -> Empty TextNode.
    if (newValue === undefined) {
      const textNode = document.createTextNode("");
      binding.ref.parentNode.replaceChild(textNode, binding.ref);
      binding.type = "text";
      binding.ref = textNode;
    }

    // Single DOM Node to -> TextNode (Strings || Numbers).
    else if (isNumberOrString(newValue)) {
      const textNode = document.createTextNode(newValue);
      binding.ref.parentNode.replaceChild(textNode, binding.ref);
      binding.type = "text";
      binding.ref = textNode;
    }

    // Single DOM Node to -> DOM Node.
    else if (isDomNode(newValue)) {
      binding.ref.parentNode.replaceChild(newValue, binding.ref);
      binding.type = "node";
      binding.ref = newValue;
    }

    // Single DOM Node to -> Array of DOM Nodes.
    else if (Array.isArray(newValue)) {
      const root = binding.ref.parentNode;
      insetrNodesBefore(newValue, binding.ref);
      binding.type = "list";
      binding.ref = root;
    }

  }

  // Update Nodes List.
  else if (binding.type === "list") {

    // Array of DOM Nodes to -> Empty TextNode.
    if (newValue === undefined) {
      const textNode = document.createTextNode("");
      binding.ref.insertBefore(textNode, binding.value[0]);
      loop(binding.value, node => node.remove());
      binding.type = "text";
      binding.ref = textNode;
    }

    // Array of DOM Nodes to -> TextNode (Strings || Numbers).
    else if (isNumberOrString(newValue)) {
      const textNode = document.createTextNode(newValue);

      binding.value[0]
        ? binding.ref.insertBefore(textNode, binding.value[0])
        : binding.ref.append(newValue);

      loop(binding.value, node => node.remove());
      binding.type = "text";
      binding.ref = textNode;
    }

    // Array of Nodes to -> Single DOM Node.
    else if (isDomNode(newValue)) {

      binding.value[0]
        ? binding.ref.insertBefore(newValue, binding.value[0])
        : binding.ref.append(newValue);

      loop(binding.value, node => node.remove());
      binding.type = "node";
      binding.ref = newValue;
    }

    // Array of DOM Nodes to -> Array of DOM Nodes.
    else if (Array.isArray(newValue)) {

      /*
        Implement 4 basic update actions to update DOM tree.

        - ADD:      when node is the new one.
        - SKIP:     when node matches old position.
        - MOVE:     when node position changed.
        - REVMOE:   when node does not esist.
      */

      // Remove all nodes that does not exist in newValue array.
      loop(binding.value, node => !newValue.includes(node) && node.remove());

      // Update remaining nodes.
      loop(newValue, (newNode, index) => {
        const oldIndex = binding.value.indexOf(newNode);

        // Add (append new node).
        if (oldIndex === -1) {
          addNodeAtIndex(index, newNode, binding.ref);
        }

        // Move (node does not match old position).
        else if (binding.value[index] !== newNode) {
          addNodeAtIndex(index, newNode, binding.ref);
        }

        // Skip (new node matches its old position).
        else if (binding.value[index] === newNode) {
          /* Do nothing */
        }

      });

    }
  }
  binding.value = newValue;
}


export function debugElementsStore() {
  console.groupCollapsed("Elements registry");
  console.log(elements.dump());
  console.groupEnd();

  console.groupCollapsed("Elements references");
  console.log(elementsRefs);
  console.groupEnd();

  console.groupCollapsed("Terminate Interval");
  console.log(html.__setTerminateInterval());
  console.groupEnd();
}


// ---- Elements Store Factory ----------------


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

  function dump() {
    return store;
  }

  return Object.freeze({
    set,
    has,
    get,
    dump,
    remove,
    cleanup,
  });
}


// ---- Helpers ----------------

function updateChangedValues(elementsBindings) {
  return (insert, index) => insert !== elementsBindings[index].value
    && updateReference(elementsBindings[index], insert);
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

  return refsElements.length
    ? Object.freeze(refs)
    : undefined;
}

// Simplify adding nodes at given index.
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
  return typeof value === "number" || typeof value === "string";
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

function insetrNodesBefore(nodes, pointer) {
  loop(nodes, node => isDomNode(node) && pointer.before(node))
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

function escapeStringsInArray(array) {
  return array.map(i => typeof i === "string" ? escapeHtml(i) : i);
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
