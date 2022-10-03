import { loop, reduce, nodeListToArray } from "./arrays.js";
import { placeStrBetween } from "./strings.js";


export function html(markup, ...inserts) {
  const notTemplateString = markup === undefined || !Boolean(markup.raw);
  if (notTemplateString)
    throw new Error("html helper should be used as a tagFunction");
  return { markup: markup.raw, inserts };
}

export function dynamicElement(renderFn, initState) {
  const { markup, inserts } = renderFn(initState);
  const { element, bindings, attributes } = createTemplate(markup, inserts);
  element.update = updateComponent(element, bindings, attributes, renderFn);
  element.refs = getReferences(element);
  return element;
}


// ---- REPEATERS ----------------

const repeatersPool = [];

// Clean up repeaters elements (by default) every 5 minutes.
let terminateElementsIntervel = 300_000;
let terminateTimre = setInterval(cleanupRepeaters, terminateElementsIntervel);

export function createRepeater(instanceCount = 1) {
  return new Array(instanceCount).fill(true).map(() => {
    repeatersPool.push(null);
    return initializeRepeater(repeatersPool.length - 1);
  });
}

function initializeRepeater(index) {
  return function repeater(renderFn, collection, idSelector) {

    if (typeof idSelector === "function") {

      if (!repeatersPool[index]) {
        repeatersPool[index] = {};
        const elements = collection.map(item => {
          const element = renderFn(item);
          repeatersPool[index][idSelector(item)] = element;
          return element;
        });

        return elements;
      }

      else {
        const elements = collection.map(item => {
          let element = repeatersPool[index][idSelector(item)];

          if (!element) {
            element = repeatersPool[index][idSelector(item)] = renderFn(item);
            return element;
          }

          return element.update(item);
        });

        return elements;
      }

    }

    else {

      if (!repeatersPool[index]) {
        const elements = collection.map(renderFn);
        repeatersPool[index] = elements;
        return elements;
      }

      else {
        const elements = collection.map((item, index) => {
          return repeatersPool[index][index] ? repeatersPool[index][index].update(item) : renderFn(item);
        });

        if (elements.length > repeatersPool[index].length) {
          repeatersPool[index] = elements;
        }

        return elements;
      }
    }
  }

}

createRepeater.__setTerminateInterval = function (time) {
  if (time === undefined) {
    return terminateElementsIntervel;
  }

  else if (time === 0) {
    clearInterval(terminateTimre);
  }

  else {
    clearInterval(terminateTimre);
    terminateElementsIntervel = time;
    terminateTimre = setInterval(cleanupRepeaters, terminateElementsIntervel);
  }
}

function cleanupRepeaters() {

  for (let i = 0; i < repeatersPool.length; i++) {
    const cache = repeatersPool[i];

    if (cache) {

      // Is Array.
      if (Array.isArray(cache)) {
        for (let j = 0; j < cache.length; j++) {
          if (!document.contains(array[j])) {
            cache.splice(j, 0);
          }
        }
      }

      // Is HashMap.
      else {
        Object.keys(cache).forEach(key => {
          if (!document.contains(cache[key])) {
            delete cache[key];
          }
        });
      }
    }
  }
}


// ---- Templates Core ----------------

// Creates HTMLElement and it's data bindings.
function createTemplate(markup, inserts) {
  let attributes = {};

  const bindings = [];
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
    //   type:          type of given entry: [ "text", "node", "list", "attribute". "bool:attribute" ],
    //   ref:           reference to node holding given value; for attributes node with given attribute; for lists parent node,
    //   container:     {
    //     ref:         reference to the parent container,
    //     index:       index on wchih the dynamic node is rendered,
    //   },
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
        const element = html.slice(splitIndex); // Markup of the element with current attribute.

        // Create new data-hk to keep track of attributes placeholders.
        if (!element.includes("data-hk")) {
          html = head + placeStrBetween(element, ` data-hk="${index}"`, element.indexOf(" "));
        }

        // Update data-hk attribute (multiple attributes in one element).
        else {
          html = head + element.replace(/data-hk="(.+?)"/, (_, refs) => `data-hk="${refs} ${index}"`);
        }

        placeholder = `%#${index}#%`;

      }

      // Allow for undefined values (treat them as an empty strings).
      else if (value === undefined) {
        placeholder = `<i data-hk="${index}" data-typ3="text"></i>`;
      }

      // Detect Numbers & Strings.
      else if (isNumberOrString(value)) {
        placeholder = `<i data-hk="${index}" data-typ3="text"></i>`;
      }

      // Detect HTML Elements.
      else if (isDomNode(value)) {
        placeholder = `<i data-hk="${index}" data-typ3="node"></i>`;
      }

      // Detect Array of Nodes.
      else if (Array.isArray(value)) {
        placeholder = `<i data-hk="${index}" data-typ3="list"></i>`;
      }

      // Clamp other types into empty string (just skip them).
      else {
        placeholder = "";
      }

      bindings.push(binding);
      return html + placeholder;

    }

    return html;

  }, "");


  // Parese HTML template into DOM elements.
  wrapper.insertAdjacentHTML("beforeend", componentHtml);

  // Map data-hk elements and attributes into their external inputs + complete bindings configuration.
  const dataHooks = nodeListToArray(wrapper.querySelectorAll("[data-hk]"));

  loop(dataHooks, hook => {
    const type = hook.dataset.typ3;


    // Attributes.
    if (type === undefined) {

      const localAttributes = getAllAttributes(hook);

      // Set Boolean attributes.

      Object.keys(localAttributes).forEach(index => {
        const { value } = bindings[index];
        const attribute = localAttributes[index];

        bindings[index].ref = hook;
        bindings[index].container = createContainer(hook);

        // Handle boolean attributes.
        if (attribute.bool) {
          bindings[index].type = "bool:attribute";

          hook.removeAttribute(`?${attribute.name}`);

          value
            ? hook.setAttribute(attribute.name, attribute.name)
            : hook.removeAttribute(attribute.name);
        }

        // Handle non-boolean attributes.
        else if (isValidAttributeValue(value)) {
          bindings[index].type = "attribute";
          updateAttributesTempate(hook, attribute, bindings);
        }

        else {
          throw new Error(`Only String, Numbers, Undefined or False can be passed as attributes. Got: "${typeof value}" at "${index}" value.`);
        }

      });

      // Store local attributes.
      attributes = { ...attributes, ...localAttributes };
    }

    // Nodes.
    else {

      const binding = bindings[Number(hook.dataset.hk)];

      // Insert TextNode for Strings, Numbers & Undefined.
      if (type === "text") {
        binding.type = "text";
        binding.ref = document.createTextNode(binding.value || "");
        binding.container = createContainer(hook);
        binding.container.ref.replaceChild(binding.ref, hook);
      }

      // HTML Elements.
      else if (type === "node") {
        binding.type = "node";
        binding.ref = binding.value;
        binding.container = createContainer(hook);
        binding.container.ref.replaceChild(binding.ref, hook);
      }

      // NodeList.
      else if (type === "list") {
        binding.type = "list";
        binding.ref = hook.parentNode;
        binding.container = createContainer(hook);
        insetrNodesBefore(binding.value, hook);
      }
    }

    hook.removeAttribute("data-hk");

  });

  // // Strip wrapper node if not needed.
  const element = stripWrapper(wrapper);

  return {
    element,
    bindings,
    attributes,
  };
}

// Updates values in DOM nodes.
function updateComponent(element, bindings, attributes, renderFn) {
  return (state) => {
    const { inserts } = renderFn(state);
    const escapedInserts = escapeStringsInArray(inserts);
    loop(escapedInserts, updateChangedValues(bindings, attributes));
    return element;
  }
}

// Updates values of an element and it's references.
function updateReference(index, bindings, attributes, newValue) {

  const binding = bindings[index];

  if (!binding) return;

  // Update Boolean Attributes.
  if (binding.type === "bool:attribute") {
    const attribute = attributes[binding.index];

    binding.value
      ? binding.ref.setAttribute(attribute.name, attribute.name)
      : binding.ref.removeAttribute(attribute.name);

  }

  // Update Attributes.
  else if (binding.type === "attribute") {

    if (isValidAttributeValue(newValue)) {
      // Update value in bindings early on so it can be use in updateAttributesTempate() fn on the next line.
      // This simplifies logic of updateAttributesTempate().
      binding.value = newValue;
      updateAttributesTempate(binding.ref, attributes[binding.index], bindings);
    }

    else {
      throw new Error(`Only String, Numbers, Undefined or False can be passed as attributes. Got: "${typeof newValue}" at value of index: "${binding.index}".`);
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
      binding.container.ref.replaceChild(newValue, binding.ref);
      binding.ref = newValue;
    }

    // TextNode to -> Array of DOM Nodes.
    else if (Array.isArray(newValue)) {
      insetrNodesBefore(newValue, binding.ref);
      binding.type = "list";
      binding.ref = newValue;
    }

  }

  // Update Single DOM Node.
  else if (binding.type === "node") {

    // Single DOM Node to -> Empty TextNode.
    if (newValue === undefined) {
      const textNode = document.createTextNode("");
      binding.container.ref.replaceChild(textNode, binding.ref);
      binding.type = "text";
      binding.ref = textNode;
    }

    // Single DOM Node to -> TextNode (Strings || Numbers).
    else if (isNumberOrString(newValue)) {
      const textNode = document.createTextNode(newValue);
      binding.container.ref.replaceChild(textNode, binding.ref);
      binding.type = "text";
      binding.ref = textNode;
    }

    // Single DOM Node to -> DOM Node.
    else if (isDomNode(newValue)) {
      binding.container.ref.replaceChild(newValue, binding.ref);
      binding.type = "node";
      binding.ref = newValue;
    }

    // Single DOM Node to -> Array of DOM Nodes.
    else if (Array.isArray(newValue)) {
      insetrNodesBefore(newValue, binding.ref);
      binding.type = "list";
      binding.ref = newValue;
    }

  }

  // Update Nodes List.
  else if (binding.type === "list") {

    // Array of DOM Nodes to -> Empty TextNode.
    if (newValue === undefined) {
      const textNode = document.createTextNode("");
      insertNodeAtIndex(binding.container.index, textNode, binding.container.ref);
      removeNodes(binding.value, binding.container.ref);
      binding.type = "text";
      binding.ref = textNode;
    }

    // Array of DOM Nodes to -> TextNode (Strings || Numbers).
    else if (isNumberOrString(newValue)) {
      const textNode = document.createTextNode(newValue);
      insertNodeAtIndex(binding.container.index, textNode, binding.container.ref);
      removeNodes(binding.value, binding.container.ref);
      binding.type = "text";
      binding.ref = textNode;
    }

    // Array of Nodes to -> Single DOM Node.
    else if (isDomNode(newValue)) {
      insertNodeAtIndex(binding.container.index, newValue, binding.container.ref);
      removeNodes(binding.value, binding.container.ref);
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

        // Offset index value with container.index in case list is not only item in the element.
        const insertIndex = binding.container.index + index;

        // Add (node does not exist -> append new node).
        if (oldIndex === -1) {
          insertNodeAtIndex(insertIndex, newNode, binding.container.ref);
        }

        // Move (node does not match old position).
        else if (binding.value[index] !== newNode) {
          insertNodeAtIndex(insertIndex, newNode, binding.container.ref);
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


// ---- Helpers ----------------

function updateChangedValues(bindings, attibutes) {
  return (insert, index) => insert !== bindings[index].value
    && updateReference(index, bindings, attibutes, insert);
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

  return Object.freeze(refs);
}

// Simplify adding nodes at given index.
function insertNodeAtIndex(index, node, parent) {
  node !== parent.childNodes[index]
    ? index === 0
      ? parent.childNodes.length === 0
        ? parent.append(node)
        : parent.childNodes[0].before(node)
      : parent.childNodes[index - 1].after(node)
    : null;
}

function updateAttributesTempate(node, attribute, bindings) {
  const attributeValue = attribute.template.replace(/%#(\d+)#%/g, (_, index) => {
    const { value } = bindings[Number(index)];
    return (value === undefined || value === false) ? "" : value;
  });

  node.setAttribute(attribute.name, attributeValue);

  // Inputs and textareas does set value prop when updating attribute with "setAttribute".
  if (attribute.name === "value") {
    node.value = attributeValue;
  }
}

// Check if current provessing value in HTML is for attribute.
function isAttribute(html) {
  return html.lastIndexOf("<") > html.lastIndexOf(">");
}

// Verify if value is valid for attribute.
function isValidAttributeValue(value) {
  return value === undefined || value === false || typeof value === "number" || typeof value === "string";
}

// Allow Strings and Numbers.
function isNumberOrString(value) {
  return typeof value === "number" || typeof value === "string";
}

// Verify if given @node is instance of a Text or HTMLElement.
function isDomNode(node) {
  return node instanceof HTMLElement || node instanceof Text;
}

function createContainer(node) {
  return {
    ref: node.parentNode,
    index: getNodeIndex(node),
  };
}

function getNodeIndex(node) {
  let index = 0;
  while ((node = node.previousSibling) !== null) index++;
  return index;
}

function insetrNodesBefore(nodes, pointer) {
  loop(nodes, node => isDomNode(node) && pointer.before(node));
  pointer.remove();
}

// Remove only direct nodes of the container element.
// NOTE: This additional check is required forth case where DOM node is reused elsewhere,
// so we need to avoid removing it from other container.
function removeNodes(nodes, container) {
  loop(nodes, node => node.parentNode === container && node.remove());
}


// Remove element wrapper if not needed.
function stripWrapper(wrapper) {
  return wrapper.children.length === 1
    ? wrapper.children[0]
    : wrapper;
}

// Pull out all attribute's of given @node that contains template in their value and map them onto index-object.
// Each key in index-object represents the "binding.index" to be matched during renders and updates.
function getAllAttributes(node) {
  return Array.prototype.slice.call(node.attributes).reduce((acc, attr) => {

    if (new RegExp("%#\\d+#%", "g").test(attr.value)) {

      // match[1] is reference to the first capturing group of the RegExp.
      const foundIndexes = Array.from(attr.value.matchAll(new RegExp("%#(\\d+)#%", "g"))).map(match => match[1]);

      const attributeBindind = {
        name: attr.name,
        template: attr.value,
      };

      // Mark boolean attributes.
      if (attributeBindind.name.indexOf("?") === 0) {
        attributeBindind.name = attributeBindind.name.slice(1);
        attributeBindind.bool = true;
      }

      for (const index of foundIndexes) {
        acc[index] = attributeBindind;
      }
    }

    return acc;
  }, {});
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
