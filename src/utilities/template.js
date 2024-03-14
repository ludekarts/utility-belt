import { loop, reduce, nodeListToArray, removeByInstance } from "./arrays.js";
import { placeStrBetween } from "./strings.js";

/*
  [💡 HINT]:
  When using partials inside template, make sure to use extended version of html helper (with ID):

    html("id")`<span>Hello</span>`;

  This will allow for partials to be reused and updated properly e.g.:

    function render(count) {
      return html`
        <div>
          <span>Hello ${count}</span>
          ${html("id")`<span>World</span>`}
        </div>
      `;
    }

    const element = dynamicElement(render, 0);
    element.d.update(1);
    element.d.update(2);
    element.d.update(3);

  In Above example partial (with ID) will be created only once and only updated later on.

  [TODO 📝]:
  Enable cacheing partials with ID similary to the Repeaters.
*/

export function html(markup, ...inserts) {
  if (markup && Boolean(markup.raw)) {
    return { markup: markup.raw, inserts };
  } else if (typeof markup === "string") {
    const id = markup;
    return function (keyedMarkup, ...keyedInserts) {
      if (keyedMarkup && Boolean(keyedMarkup.raw)) {
        return { markup: keyedMarkup.raw, inserts: keyedInserts, id };
      }
      throw new Error(
        'HtmlHelperError: Invalid usage of html helper. Try html("id")`` instead.'
      );
    };
  }
  throw new Error(
    'HtmlHelperError: Invalid usage of html helper. Try html`` or html("id")`` instead.'
  );
}

export function dynamicElement(renderFn, initState, ...rest) {
  const { markup, inserts, id } = renderFn(initState, ...rest);
  const { element, bindings, attributes } = createTemplate(markup, inserts);
  element.d = Object.freeze({
    refs: getReferences(element),
    cleanup: createCleanupFn(bindings),
    update: updateComponent(element, bindings, attributes, renderFn),
  });

  return element;
}

// ---- REPEATERS ----------------

const repeatersPool = [];

// Clean up repeaters elements (by default) every 5 minutes.
let terminateElementsIntervel = 300_000;
let terminateTimre = setInterval(cleanupRepeaters, terminateElementsIntervel);

function createRepeater(renderFn, collection, keySelector) {
  repeatersPool.push({});

  const repeaterIndex = repeatersPool.length - 1;

  const elements = collection.map((item) => {
    const element = renderFn(item);

    if (isPartialTemplate(element)) {
      const partialNode = createPartialElement(
        element.markup,
        element.inserts,
        renderFn
      );
      repeatersPool[repeaterIndex][keySelector(item)] = partialNode;
      return partialNode;
    } else if (element instanceof HTMLElement) {
      repeatersPool[repeaterIndex][keySelector(item)] = element;
      return element;
    } else {
      throw new Error(
        "RepeaterError: Invalid element type. Only HTMLElement or Partial can be used in repeater."
      );
    }
  });

  const updateRepeater = (collection) => {
    return collection.map((item) => {
      let element = repeatersPool[repeaterIndex][keySelector(item)];

      if (!element) {
        const node = renderFn(item);
        element = repeatersPool[repeaterIndex][keySelector(item)] =
          isPartialTemplate(node)
            ? createPartialElement(node.markup, node.inserts, renderFn)
            : node;
        return element;
      }

      return element?.d?.update ? element.d.update(item) : element;
    });
  };

  return {
    elements,
    updateRepeater,
  };
}

dynamicElement.__setTerminateInterval = function (time) {
  if (time === undefined) {
    return terminateElementsIntervel;
  } else if (time === 0) {
    clearInterval(terminateTimre);
  } else {
    clearInterval(terminateTimre);
    terminateElementsIntervel = time;
    terminateTimre = setInterval(cleanupRepeaters, terminateElementsIntervel);
  }
};

function cleanupRepeaters() {
  for (let i = 0; i < repeatersPool.length; i++) {
    const cache = repeatersPool[i];

    Object.keys(cache).forEach((key) => {
      if (!document.contains(cache[key])) {
        delete cache[key];
      }
    });
  }
}

// ---- Templates Core ----------------

// Creates HTMLElement and it's data bindings.
function createTemplate(markup, inserts) {
  let attributes = {};

  const bindings = [];
  const wrapper = document.createElement("div");
  const escapedInserts = escapeStringsInArray(inserts);

  /*

  Binding Object Spec.:

  {
    value:              current value of given binding,
    index:              index of binding within template,
    static:             flag that marks binding for update (TRUE mean no updates).
    type:               type of given entry: [
                            "text",
                            "node",
                            "list",
                            "partial",
                            "repeater",
                            "attribute",
                            "attribute:bool",
                            "attribute:callback",
                            "attribute:repeaterKey",    // flags value of current binding as function that retrieves uinque key for repeater's elements (for caching & reusing elements),
                            "attribute:repeaterItems",  // flags value of current binding as reference to the array of items for the repeater to render,
                        ],
    ref:                reference to DOM node holding given value:
                         - for attributes node with given attribute;
                         - for lists parent node,

    container: {
      ref:              reference to the node's parent element,
      childIndex:       child-node-index of rendered node within this container,
    },

    repeater?: {
      update:           update function used to generate a new array of nodes to display in repeater,
      sourceIndex:      index of binding containing items for the repeater,
    },
  }


  Attribute Object Spec.:

  {
    name:             attribute name,
    bool:             flag for attribute either regular or boolean,
    template?:        attribute template to update,
  }

  **/

  // Combine HTML markup and add placeholders for external inputs.
  const componentHtml = reduce(
    Array.from(markup),
    (acc, part, index, isLast) => {
      let value = escapedInserts[index];
      let html = (acc += part);

      // Last element of markup array does not generate placeholder so we do not process it,
      // only append produced HTML at the end.
      if (!isLast) {
        // Create binding object for each external input.
        bindings.push({
          value,
          index,
          static: false,
        });

        let placeholder;

        // Detect attributes.
        if (isAttribute(html)) {
          const { head, element } = sliceHtml(html);

          html = !element.includes("data-hook-index")
            ? addHookIndexAttribute(head, element, index) // Keep track of attributes placeholders.
            : updateHookIndexAttribute(head, element, index); // Multiple attributes in one element

          placeholder = `%#${index}#%`;
        }

        // Allow for undefined values - treat them as empty strings.
        else if (isAsEmpty(value)) {
          placeholder = `<i data-hook-index="${index}" data-hook-type="text"></i>`;
        }

        // Detect Numbers & Strings.
        else if (isNumberOrString(value)) {
          placeholder = `<i data-hook-index="${index}" data-hook-type="text"></i>`;
        }

        // Detect HTML Elements.
        else if (isDomNode(value)) {
          placeholder = `<i data-hook-index="${index}" data-hook-type="node"></i>`;
        }

        // Detect Array of Nodes.
        else if (Array.isArray(value)) {
          placeholder = `<i data-hook-index="${index}" data-hook-type="list"></i>`;
        }

        // Detect partial HTML
        else if (isPartialTemplate(value)) {
          placeholder = `<i data-hook-index="${index}" data-hook-type="partial"></i>`;
        }

        // Detect repeater render function.
        else if (isRepeaterFunction(value, html)) {
          placeholder = `<i data-hook-index="${index}" data-hook-type="repeater"></i>`;
        }

        // Clamp other types into empty string - skip them.
        else {
          placeholder = "";
        }

        return html + placeholder;
      }

      return html;
    },
    ""
  );

  // Parese HTML template into DOM elements.
  wrapper.insertAdjacentHTML("beforeend", componentHtml);

  // Map data-hook-index elements and attributes into their external inputs .
  const dataHooks = nodeListToArray(
    wrapper.querySelectorAll("[data-hook-index]")
  );

  // Complete bindings configuration (assign proper types, node references and containers).
  loop(dataHooks, (hook) => {
    const type = hook.dataset.hookType;

    // Attributes.
    if (type === undefined) {
      const localAttributes = getAllAttributes(hook);

      loop(Object.keys(localAttributes), (index) => {
        const binding = bindings[index];

        binding.ref = hook;
        binding.container = createContainer(hook);

        const attribute = localAttributes[index];

        // Handle boolean attributes.
        if (attribute.bool) {
          binding.type = "attribute:bool";

          hook.removeAttribute(`?${attribute.name}`);

          Boolean(binding.value)
            ? hook.setAttribute(attribute.name, attribute.name)
            : hook.removeAttribute(attribute.name);
        }

        // Handle special case for repeaters attirbutes $key and $items.
        else if (isRepeaterAttribute(attribute.name, binding.value)) {
          // Mark as repeater Key, block for updates and cleanup.
          if (attribute.name === "$key") {
            binding.static = true;
            binding.type = "attribute:repeaterKey";
            hook.removeAttribute(attribute.name);
          }

          // Mark as repeater Items and cleanup.
          if (attribute.name === "$items") {
            binding.type = "attribute:repeaterItems";
            hook.removeAttribute(attribute.name);
          }

          delete localAttributes[index];
        }

        // Handle callback attributes.
        else if (isCallbackAttribute(attribute.name, binding.value)) {
          binding.type = "attribute:callback";

          // Clenup.
          hook.removeAttribute(attribute.name);

          // Connect callback with reference element.
          hook[attribute.name] = binding.value;
        }

        // Handle non-boolean attributes.
        else if (isValidAttributeValue(binding.value)) {
          binding.type = "attribute";
          updateAttributesTempate(hook, attribute, bindings);
        } else {
          throw new Error(
            `Only String, Numbers, Undefined or False can be passed as attributes. Got: "${typeof value}" at "${index}" value.`
          );
        }
      });

      // Store local attributes.
      attributes = { ...attributes, ...localAttributes };
    }

    // Nodes.
    else {
      const bindingIndex = Number(hook.dataset.hookIndex);
      const binding = bindings[bindingIndex];

      // Insert TextNode for Strings, Numbers & Undefined.
      if (type === "text") {
        binding.type = "text";
        binding.ref = document.createTextNode(
          isAsEmpty(binding.value) ? "" : binding.value
        );
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

      // Partials.
      else if (type === "partial") {
        binding.type = "partial";
        binding.ref = createPartialElement(
          binding.value.markup,
          binding.value.inserts
        );
        binding.container = createContainer(hook);
        binding.container.ref.replaceChild(binding.ref, hook);
      }

      // Repeaters.
      else if (type === "repeater") {
        binding.type = "repeater";
        binding.static = true;
        binding.ref = hook.parentNode;
        binding.container = createContainer(hook);

        const renderFn = binding.value;
        const { items, itemsIndex, keySelector } =
          findRepeaterPropertiesInBindings(hook, bindings);
        const { elements, updateRepeater } = createRepeater(
          renderFn,
          items,
          keySelector
        );
        binding.value = elements;

        bindings[itemsIndex].repeater = {
          updateFn: updateRepeater,
          updateIndex: binding.index,
        };

        insetrNodesBefore(binding.value, hook);
      }
    }

    hook.removeAttribute("data-hook-index");
  });

  // Strip wrapper node if not needed.
  const element = stripWrapper(wrapper);

  return {
    element,
    bindings,
    attributes,
  };
}

function createPartialElement(markup, inserts, renderFn) {
  const { element, bindings, attributes } = createTemplate(markup, inserts);
  element.d = Object.freeze({
    refs: getReferences(element),
    cleanup: createCleanupFn(bindings),
    update: updateComponent(element, bindings, attributes, renderFn),
  });
  return element;
}

// Creates cleanup function that runs through all dynamic elements and run their cleanup functions.
function createCleanupFn(bindings) {
  let cleanupCallback;
  return (cleanupSetup) => {
    if (typeof cleanupSetup === "function") {
      cleanupCallback = cleanupSetup;
    } else {
      cleanupCallback?.();
      bindings.forEach((binding) => binding.ref.d?.cleanup());
      cleanupCallback = undefined;
    }
  };
}

// Updates values in DOM nodes.
function updateComponent(element, bindings, attributes, renderFn) {
  return (state, ...rest) => {
    const inserts = renderFn ? renderFn(state, ...rest).inserts : state;
    if (!inserts) throw new Error("Cannot update component. Invalid input");
    const escapedInserts = escapeStringsInArray(inserts);
    loop(escapedInserts, updateChangedValues(bindings, attributes));
    return element;
  };
}

// Updates values of an element and it's references.
function updateReference(index, bindings, attributes, newValue) {
  const binding = bindings[index];

  // console.log("Update:", binding);

  if (!binding) return;

  // Update Boolean Attributes.
  if (binding.type === "attribute:bool") {
    const attribute = attributes[binding.index];

    Boolean(newValue)
      ? binding.ref.setAttribute(attribute.name, attribute.name)
      : binding.ref.removeAttribute(attribute.name);

    binding.value = newValue;
  }

  // Update Repeater $items.
  if (binding.type === "attribute:repeaterItems") {
    binding.value = newValue;
    const { updateFn, updateIndex } = binding.repeater;
    const repeaterValue = updateFn(newValue);
    updateArrayOfNodes(bindings[updateIndex], repeaterValue);
    bindings[updateIndex].value = repeaterValue;
  } else if (binding.type === "attribute:callback") {
    const attribute = attributes[binding.index];
    binding.ref[attribute.name] = newValue;
    binding.value = newValue;
  }

  // Update Attributes.
  else if (binding.type === "attribute") {
    if (isValidAttributeValue(newValue)) {
      // Update value in bindings early on so it can be use in updateAttributesTempate() fn on the next line.
      // This simplifies logic of updateAttributesTempate().
      binding.value = newValue;
      updateAttributesTempate(binding.ref, attributes[binding.index], bindings);
    } else {
      throw new Error(
        `Only String, Numbers, Undefined or False can be passed as attributes. Got: "${typeof newValue}" at value of index: "${
          binding.index
        }".`
      );
    }
  }

  // Update TextNode.
  else if (binding.type === "text") {
    // TextNode to -> Empty String (undefined).
    if (isAsEmpty(newValue)) {
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

    // TextNode to -> Partial.
    else if (isPartialTemplate(newValue)) {
      const partialNode = createPartialElement(
        newValue.markup,
        newValue.inserts
      );
      binding.type = "partial";
      binding.container.ref.replaceChild(partialNode, binding.ref);
      binding.ref = partialNode;
    }

    // TextNode to -> Array of DOM Nodes.
    else if (Array.isArray(newValue)) {
      insetrNodesBefore(newValue, binding.ref);
      binding.type = "list";
      binding.ref = newValue;
    }

    // Update current binding value.
    binding.value = newValue;
  }

  // Update Single DOM Node.
  else if (binding.type === "node") {
    // Run children cleanup.
    binding.ref.d?.cleanup();

    // Single DOM Node to -> Empty TextNode.
    if (isAsEmpty(newValue)) {
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
      binding.ref = newValue;
    }

    // Single DOM Node to -> Partial.
    else if (isPartialTemplate(newValue)) {
      const partialNode = createPartialElement(
        newValue.markup,
        newValue.inserts
      );
      binding.container.ref.replaceChild(partialNode, binding.ref);
      binding.type = "partial";
      binding.ref = partialNode;
    }

    // Single DOM Node to -> Array of DOM Nodes.
    else if (Array.isArray(newValue)) {
      insetrNodesBefore(newValue, binding.ref);
      binding.type = "list";
      binding.ref = newValue;
    }

    // Update current binding value.
    binding.value = newValue;
  }

  // Update Nodes List.
  else if (binding.type === "list") {
    // Array of DOM Nodes to -> Empty TextNode.
    if (isAsEmpty(newValue)) {
      const textNode = document.createTextNode("");
      insertNodeAtIndex(
        binding.container.childIndex,
        textNode,
        binding.container.ref
      );
      removeNodes(binding.value, binding.container.ref);
      binding.type = "text";
      binding.ref = textNode;
    }

    // Array of DOM Nodes to -> TextNode (Strings || Numbers).
    else if (isNumberOrString(newValue)) {
      const textNode = document.createTextNode(newValue);
      insertNodeAtIndex(
        binding.container.childIndex,
        textNode,
        binding.container.ref
      );
      removeNodes(binding.value, binding.container.ref);
      binding.type = "text";
      binding.ref = textNode;
    }

    // Array of Nodes to -> Single DOM Node.
    else if (isDomNode(newValue)) {
      insertNodeAtIndex(
        binding.container.childIndex,
        newValue,
        binding.container.ref
      );
      removeNodes(binding.value, binding.container.ref);
      binding.type = "node";
      binding.ref = newValue;
    }

    // Array of Nodes to -> Partial.
    else if (isPartialTemplate(newValue)) {
      const partialNode = createPartialElement(
        newValue.markup,
        newValue.inserts
      );
      insertNodeAtIndex(
        binding.container.childIndex,
        partialNode,
        binding.container.ref
      );
      removeNodes(binding.value, binding.container.ref);
      binding.type = "partial";
      binding.ref = partialNode;
    }

    // Array of DOM Nodes to -> Array of DOM Nodes.
    else if (Array.isArray(newValue)) {
      updateArrayOfNodes(binding, newValue);
    }

    // Update current binding value.
    binding.value = newValue;
  }

  // Update Partials.
  else if (binding.type === "partial") {
    // Partial -> Empty TextNode.
    if (isAsEmpty(newValue)) {
      const textNode = document.createTextNode("");
      binding.container.ref.replaceChild(textNode, binding.ref);
      binding.type = "text";
      binding.ref = textNode;
    }

    // Partial -> TextNode (Strings || Numbers).
    else if (isNumberOrString(newValue)) {
      const textNode = document.createTextNode(newValue);
      binding.container.ref.replaceChild(textNode, binding.ref);
      binding.type = "text";
      binding.ref = textNode;
    }

    // Partial -> DOM Node.
    else if (isDomNode(newValue)) {
      binding.container.ref.replaceChild(newValue, binding.ref);
      binding.type = "node";
      binding.ref = newValue;
    }

    // Partial -> Partial.
    else if (isPartialTemplate(newValue)) {
      // Partial -> Partial with same ID.
      if (isSameDymaicId(binding.value, newValue)) {
        binding.ref.d.update(newValue.inserts);
      }

      // Partial -> Partial with different ID.
      else {
        const partialNode = createPartialElement(
          newValue.markup,
          newValue.inserts
        );
        binding.container.ref.replaceChild(partialNode, binding.ref);
        binding.type = "partial";
        binding.ref = partialNode;
      }
    }

    // Partial -> Array of DOM Nodes.
    else if (Array.isArray(newValue)) {
      insetrNodesBefore(newValue, binding.ref);
      binding.type = "list";
      binding.ref = newValue;
    }

    // Update current binding value.
    binding.value = newValue;
  }
}

// ---- Helpers ----------------

function updateChangedValues(bindings, attibutes) {
  return (insert, index) => {
    return (
      Boolean(bindings[index].static) === false &&
      insert !== bindings[index].value &&
      updateReference(index, bindings, attibutes, insert)
    );
  };
}

// Pull out and cleanup "ref" hooks.
function getReferences(element) {
  const refs = {};
  const refsElements = nodeListToArray(element.querySelectorAll("[\\$ref]"));

  loop(refsElements, (refNode) => {
    const refName = refNode.getAttribute("$ref");
    refs[refName] = refNode;
    refNode.removeAttribute("$ref");
  });

  return Object.freeze(refs);
}

function updateArrayOfNodes(binding, newValue) {
  /*
    Implements 4 basic actions to update DOM tree.

    - ADD:      when node is the new one.
    - SKIP:     when node matches old position.
    - MOVE:     when node position changed.
    - REVMOE:   when node does not exist in new structure.
  */

  let markForDeletion = [];

  // Remove all nodes that does not exist in newValue array.
  loop(binding.value, (node, index) => {
    const childIndex = binding.container.childIndex + index;
    if (
      (isDomNode(node) && !newValue.includes(node)) ||
      isPartialTemplate(node)
    ) {
      binding.value = removeByInstance(binding.value, node);
      markForDeletion.push(binding.container.ref.childNodes[childIndex]);
    }
  });

  // Update remaining nodes.
  loop(newValue, (newNode, index) => {
    // Offset index value with container.childIndex in case list is not only item in the element.
    const insertIndex = binding.container.childIndex + index;

    // Check for new node.
    const isNewNode = binding.value.indexOf(newNode) === -1;

    // Add (node does not exist -> append new node).
    if (isNewNode) {
      isPartialTemplate(newNode)
        ? insertNodeAtIndex(
            insertIndex,
            createPartialElement(newNode.markup, newNode.inserts),
            binding.container.ref
          )
        : insertNodeAtIndex(insertIndex, newNode, binding.container.ref);
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

  // Remove marked nodes.
  loop(markForDeletion, (node) => {
    node.d?.cleanup();
    node.remove();
  });
}

function findRepeaterPropertiesInBindings(hook, bindings) {
  // Current Binding Index - 1;
  let index = Number(hook.dataset.hookIndex) - 1;
  let keySelector;
  let itemsIndex;
  let items;

  while (index > -1) {
    if (bindings[index].type === "attribute:repeaterItems") {
      items = bindings[index].value;
      itemsIndex = index;
    }

    if (bindings[index].type === "attribute:repeaterKey") {
      keySelector = bindings[index].value;
      break;
    }

    index--;
  }

  return {
    items,
    itemsIndex,
    keySelector,
  };
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
  const attributeValue = attribute.template.replace(
    /%#(\d+)#%/g,
    (_, index) => {
      const { value } = bindings[Number(index)];
      return value === undefined || value === false ? "" : value;
    }
  );

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

// Check if current provessing value in HTML is for attribute.
function isAsEmpty(value) {
  return value === undefined || value === false;
}

// Verify if value is valid for attribute.
function isValidAttributeValue(value) {
  return (
    value === undefined ||
    value === false ||
    typeof value === "number" ||
    typeof value === "string"
  );
}

// Verify if value is valid for repeater attribute.
function isRepeaterAttribute(name, value) {
  return (
    (name === "$key" && typeof value === "function") ||
    (name === "$items" && Array.isArray(value))
  );
}

// Verify attribute is a callback.
function isCallbackAttribute(name, value) {
  return name.startsWith("on") && typeof value === "function";
}

// Allow Strings and Numbers.
function isNumberOrString(value) {
  return typeof value === "number" || typeof value === "string";
}

// Verify if given @value is repeater render function.
function isRepeaterFunction(value, html) {
  const lastNodeHtml = html.slice(html.lastIndexOf("<"));
  return typeof value === "function" && lastNodeHtml.includes("$items");
}

// Verify if given @node is instance of a Text or HTMLElement.
function isDomNode(node) {
  return node instanceof HTMLElement || node instanceof Text;
}

// Verify if given @node is a template partial.
function isPartialTemplate(node) {
  return (
    node.hasOwnProperty("markup") &&
    node.hasOwnProperty("inserts") &&
    Array.isArray(node.inserts) &&
    Array.isArray(node.markup)
  );
}

// Verify if given @partials have same ID.
function isSameDymaicId(partialA, partialB) {
  return partialA.id && partialB.id && partialA.id === partialB.id;
}

function sliceHtml(html) {
  const splitIndex = html.lastIndexOf("<");
  const head = html.slice(0, splitIndex);
  const element = html.slice(splitIndex); // Markup of the element with current attribute.
  return { head, element };
}

function addHookIndexAttribute(head, element, index) {
  return (
    head +
    placeStrBetween(
      element,
      ` data-hook-index="${index}"`,
      element.indexOf(" ")
    )
  );
}

function updateHookIndexAttribute(head, element, index) {
  return (
    head +
    element.replace(
      /data-hook-index="(.+?)"/,
      (_, refs) => `data-hook-index="${refs} ${index}"`
    )
  );
}

function createContainer(node) {
  return {
    ref: node.parentNode,
    childIndex: getNodeIndex(node),
  };
}

function getNodeIndex(node) {
  let index = 0;
  while ((node = node.previousSibling) !== null) index++;
  return index;
}

// Insert only DOM nodes, Text nodes, and Partials.
function insetrNodesBefore(nodes, pointer) {
  loop(nodes, (node) => {
    isDomNode(node)
      ? pointer.before(node)
      : isPartialTemplate(node)
      ? pointer.before(createPartialElement(node.markup, node.inserts))
      : null;
  });
  pointer.remove();
}

// Remove only direct nodes of the container element.
function removeNodes(nodes, container) {
  loop(nodes, (node) => {
    if (node.parentNode === container) {
      node.d?.cleanup();
      node.remove();
    }
  });
}

// Remove element wrapper if not needed.
function stripWrapper(wrapper) {
  return wrapper.children.length === 1 ? wrapper.children[0] : wrapper;
}

// Pull out all attribute's of given @node that contains template in their value and map them onto index-object.
// Each key in index-object represents the "binding.index" to be matched during renders and updates.
function getAllAttributes(node) {
  return Array.from(node.attributes).reduce((acc, attr) => {
    if (new RegExp("%#\\d+#%", "g").test(attr.value)) {
      // match[1] is reference to the first capturing group of the RegExp.
      const foundIndexes = Array.from(
        attr.value.matchAll(new RegExp("%#(\\d+)#%", "g"))
      ).map((match) => match[1]);

      const attributeBinding = {
        name: attr.name,
        template: attr.value,
      };

      // Mark boolean attributes.
      if (attributeBinding.name.indexOf("?") === 0) {
        attributeBinding.name = attributeBinding.name.slice(1);
        attributeBinding.bool = true;
      }

      for (const index of foundIndexes) {
        acc[index] = attributeBinding;
      }
    }

    return acc;
  }, {});
}

function escapeStringsInArray(array) {
  return array.map((i) => (typeof i === "string" ? escapeHtml(i) : i));
}

// Escaepe HTML symbols.
export function escapeHtml(s) {
  const reEscape = /[&<>'"]/g;
  const oEscape = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  };
  return s.replace(reEscape, (m) => oEscape[m]);
}

// Unescaepe HTML symbols.
export function unEscapeHtml(s) {
  const reUnescape = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g;
  const oUnescape = {
    "&amp;": "&",
    "&#38;": "&",
    "&lt;": "<",
    "&#60;": "<",
    "&gt;": ">",
    "&#62;": ">",
    "&apos;": "'",
    "&#39;": "'",
    "&quot;": '"',
    "&#34;": '"',
  };
  return s.replace(reUnescape, (m) => oUnescape[m]);
}
