import { placeStrBetween } from "./strings.js"
import { nodeListToArray, loop } from "./arrays.js";
import { insertNodeAfter } from "./dom-manipulations.js";

// Global references store.
const references = (function () {
  const refs = new Map();
  return {
    get(host) {
      if (!host instanceof HTMLElement) {
        throw new Error("getRefs argument error: Helper expects HTMLElement as an argument.");
      }
      return refs.get(host) || {};
    },
    set(host, name, ref) {
      const container = refs.get(host) || {};
      container[name] = ref;
      refs.set(host, container);
    }
  }
}());

export const getRefs = references.get;

/*
  // Clear detachaed references.
  const clearDetached = () => {
    for (const [key, ref] of refs.entries()) {
      if (ref && !document.body.contains(ref)) {
        refs.delete(key);
      }
    }
  };
*/

// ---- Main ----------------

export function createTemplate() {

  // Default, unchangeble template.
  let stringsCache;

  // Holds multiple instances of same template.
  const instances = new Map();

  // Set template cache to prevents from modyfying template between renders.
  const setCache = data => {
    stringsCache = data;
    return stringsCache;
  };

  return (strings, ...inserts) => {

    // Handle call as tag literal.
    if (Array.isArray(strings) && strings.raw) {

      if (!stringsCache) {
        stringsCache = strings;
      }

      if (!instances.has("#_initial_0")) {
        instances.set("#_initial_0", createInstance(stringsCache, setCache));
      }

      return instances.get("#_initial_0")(stringsCache, ...inserts);

      // Handle regular fn call with UID.
    } else if (typeof strings === "string" || typeof strings === "number") {

      if (!instances.has(strings)) {
        instances.set(strings, createInstance(stringsCache, setCache));
      }

      return instances.get(strings);
    }

  };
}

// ---- Core -------------------

function createInstance(stringsCache, setCache) {

  const elementsMap = [];
  const wrapper = document.createElement("div");

  // Cache final response.
  let htmlResult;

  return (strings, ...inserts) => {

    if (!Array.isArray(strings) || !strings.raw) {
      throw new Error("createInstance error");
    }

    if (!stringsCache) {
      stringsCache = setCache(strings);
    }

    // Perform identity checks on re-renders.
    if (elementsMap.length) {
      loop(inserts, (insert, index) => {
        if (insert !== elementsMap[index].value) {
          updateReference(elementsMap[index], insert);
        }
      });
      // Parse HTML to inintial component.
    } else {

      // COmbine HTML markup and add placeholders for external inputs.
      const componentHtml = stringsCache.reduce((acc, part, index) => {
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

        elementsMap.push(binding);

        return html + (value || "");
      }, "");

      // HTML template to DOM elements.
      wrapper.insertAdjacentHTML("beforeend", componentHtml);

      // Map external inputs to nodes and attibutes.
      loop(
        nodeListToArray(wrapper.querySelectorAll("[data-hook]")),
        hook => {
          loop(hook.dataset.hook.split(" "), index => {
            const currentElement = elementsMap[index];

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

      // Strip wrapper node if not needed.
      htmlResult = stripWrapper(wrapper);

      // Get node references. This will skip the insert nodes, since they alreay have external referenes.
      loop(
        nodeListToArray(htmlResult.querySelectorAll("[ref]")),
        ref => {
          references.set(htmlResult, ref.getAttribute("ref"), ref);
          ref.removeAttribute("ref");
        }
      );

    }
    return htmlResult;
  }
}


// ---- Helpers ----------------

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

// On re-render update value's references.
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
        throw new Error(`Only String and Numbers can be passedt to the attributes, got: "${typeof newValue}" at "${element.index}" value.`);
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
          if (oldNode === undefined) {
            // Append node.
            if (element.value[index - 1]) {
              element.value[index] = insertNodeAfter(newNode, element.value[index - 1]);
            } else {
              // In case all items in the list were removed and we need to insert new ones.
              element.parent.appendChild(newNode);
            }
          } else {
            // Replace node.
            oldNode.parentNode.replaceChild(newNode, oldNode);
          }
        }
      });
    }
  }
  element.value = newValue;
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

// Remove element wrapper if not needed.
function stripWrapper(wrapper) {
  return wrapper.children.length === 1
    ? wrapper.children[0]
    : wrapper;
}
