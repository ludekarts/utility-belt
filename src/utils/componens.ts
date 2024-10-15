import { loop, reduce } from "./arrays.ts";
import { insertStrAtIndex } from "./strings.js";

// ---- Core API ----------------

export function html(markup: TemplateStringsArray, ...values: any[]) {
  if (markup && Boolean(markup.raw)) {
    const { element } = createTemplate(Array.from(markup), values);

    // Implement -> "element.d"
    return element;
  } else {
    throw new Error(
      "UTBTError: Invalid usage of html helper. Try html`` instead."
    );
  }
}

// ---- Create Element ----------------

type BindingType =
  | "text"
  | "node"
  | "list"
  | "dynamic"
  | "repeater"
  | "attribute"
  | "attribute:bool"
  | "attribute:html" // Flags value of current binding as innerHTML of the element,
  | "attribute:callback" // Flags value of current binding as event callback function,
  | "attribute:repeaterKey" // Flags value of current binding as function that retrieves uinque key for repeater's elements (for caching & reusing elements),
  | "attribute:repeaterItems"; // Flags value of current binding as reference to the array of items for the repeater to render,

interface Binding {
  value: any; // Current value of given binding.
  index: number; // Index of binding within template.
  isStatic: boolean; // Flag that marks binding for update (TRUE mean no updates).
  type: BindingType | null;
  ref: HTMLElement | Text | null /* Reference to DOM node holding given value:
                                    - for attributes node with given attribute,
                                    - for lists parent node.*/;
  container: {
    ref: HTMLElement; // Reference to the node's parent element.
    childIndex: number; // Child-node-index of rendered node within this container.
  } | null;
  repeater: {
    update: Function; // Update function used to generate a new array of nodes to display in repeater.
    sourceIndex: number; // Index of binding containing items for the repeater.
  } | null;
}

type AttibuteName = keyof HTMLElement | "value" | "$key" | "$items";

interface Attribute {
  name: AttibuteName; // Attribute name.
  template: string; // Attribute template to update.
  isBoolean: boolean; // Flag for attribute either regular or boolean.
}

function createTemplate(markup: string[], inserts: any[]) {
  let attributes = {};

  const bindings: Binding[] = [];
  const wrapper = document.createElement("div");

  // Combine HTML markup and add placeholders for external inputs.
  const componentHtml = reduce(
    Array.from(markup),
    (acc, part, index, isLast) => {
      let value = inserts[index];
      let html = (acc += part);

      // Last element of markup array does not generate placeholder so we do not process it,
      // but we still need to append it to the final HTML
      if (!isLast) {
        // Create binding object for each external input.

        let binding: Binding = {
          value,
          index,
          ref: null,
          type: null,
          repeater: null,
          container: null,
          isStatic: false,
        };

        let placeholder;

        // Detect attributes.
        if (isAttribute(html)) {
          const { head, element } = sliceHtml(html);

          html = !element.includes("data-hook-index")
            ? addHookIndexAttribute(head, element, index) // Keep track of attributes placeholders.
            : updateHookIndexAttribute(head, element, index); // Multiple attributes in one element.

          placeholder = `%#${index}#%`;
        }

        // Allow for undefined & null values - treat them as empty strings.
        else if (isEmpty(value)) {
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

        // Detect Dynamic Elements HTML
        else if (isDynamicElement(value)) {
          placeholder = `<i data-hook-index="${index}" data-hook-type="dynamic"></i>`;
        }

        // Detect repeater render function.
        else if (isRepeaterFunction(value, html)) {
          placeholder = `<i data-hook-index="${index}" data-hook-type="repeater"></i>`;
        }

        // Clamp other types into empty string - skip them.
        else {
          placeholder = "";
        }

        bindings.push(binding);
        return html + placeholder;
      }

      return html;
    },
    ""
  );

  // Parese HTML template into DOM elements.
  wrapper.insertAdjacentHTML("beforeend", componentHtml);

  // Map data-hook-index elements and attributes into their external values.
  const dataHooks: HTMLElement[] = Array.from(
    wrapper.querySelectorAll("[data-hook-index]")
  );

  // Complete bindings configuration (assign node references and containers).
  loop(dataHooks, (hook) => {
    const type = hook.dataset.hookType;

    // Attributes.
    if (type === undefined) {
      const hookAttributes = getAllAttributes(hook);
      const bindingIndexes = Object.keys(hookAttributes);

      loop(bindingIndexes, (index) => {
        const binding = bindings[Number(index)];

        binding.ref = hook;
        binding.container = createContainer(hook);

        const attribute = hookAttributes[index];

        // Handle boolean attributes.
        if (attribute.isBoolean) {
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
            binding.isStatic = true;
            binding.type = "attribute:repeaterKey";
            hook.removeAttribute(attribute.name);
          }

          // Mark as repeater Items and cleanup.
          if (attribute.name === "$items") {
            binding.type = "attribute:repeaterItems";
            hook.removeAttribute(attribute.name);
          }

          delete hookAttributes[index];
        }

        // Handle callback attributes.
        else if (isCallbackAttribute(attribute.name, binding.value)) {
          binding.type = "attribute:callback";

          // Clenup.
          hook.removeAttribute(attribute.name);

          // Connect callback with reference element.
          (hook as any)[attribute.name] = binding.value;
        }

        // Hendle innerHTML attributes.
        else if (isInnerHtmlAttribute(attribute.name, binding.value)) {
          binding.type = "attribute:html";
          hook.removeAttribute(attribute.name);
          binding.ref.innerHTML = binding.value || "";
        }

        // Handle non-boolean attributes.
        else if (isValidAttributeValue(binding.value)) {
          binding.type = "attribute";
          updateAttributesTempate(hook, attribute, bindings);
        } else {
          throw new Error(
            `Only String, Numbers, Undefined or False can be passed as attributes. Got: "${typeof binding.value}" at "${index}" value.`
          );
        }
      });

      // Store local attributes.
      attributes = { ...attributes, ...hookAttributes };
    }

    // Nodes.
    else {
      const bindingIndex = Number(hook.dataset.hookIndex);
      const binding = bindings[bindingIndex];

      // Insert TextNode for Strings, Numbers & Undefined.
      if (type === "text") {
        binding.type = "text";
        binding.ref = document.createTextNode(
          isEmpty(binding.value) ? "" : binding.value
        );
        binding.container = createContainer(hook);
        binding.container.ref.replaceChild(binding.ref, hook);
      }

      // HTML Elements.
      else if (type === "node") {
        binding.type = "node";
        binding.ref = binding.value as HTMLElement;
        binding.container = createContainer(hook);
        binding.container.ref.replaceChild(binding.ref, hook);
      }

      // NodeList.
      else if (type === "list") {
        binding.type = "list";
        binding.ref = hook.parentNode as HTMLElement;
        binding.container = createContainer(hook);
        insetrNodesBefore(binding.value, hook);
      }

      // Partials.
      // else if (type === "partial") {
      //   binding.type = "partial";
      //   binding.ref = createPartialElement(
      //     binding.value.markup,
      //     binding.value.inserts
      //   );
      //   binding.container = createContainer(hook);
      //   binding.container.ref.replaceChild(binding.ref, hook);
      // }

      // Repeaters.
      // else if (type === "repeater") {
      //   binding.type = "repeater";
      //   binding.isStatic = true;
      //   binding.ref = hook.parentNode as HTMLElement;
      //   binding.container = createContainer(hook);

      //   const renderFn = binding.value;
      //   const { items, itemsIndex, keySelector } =
      //     findRepeaterPropertiesInBindings(hook, bindings);
      //   const { elements, updateRepeater } = createRepeater(
      //     renderFn,
      //     items,
      //     keySelector
      //   );
      //   binding.value = elements;

      //   bindings[itemsIndex].repeater = {
      //     updateFn: updateRepeater,
      //     updateIndex: binding.index,
      //   };

      //   insetrNodesBefore(binding.value, hook);
      // }
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

// ---- Helpers -------------------

// Slice HTML for parsing.
function sliceHtml(html: string) {
  const splitIndex = html.lastIndexOf("<");
  const head = html.slice(0, splitIndex);
  const element = html.slice(splitIndex); // Markup of the element with current attribute.
  return { head, element };
}

// Remove element wrapper if not needed.
function stripWrapper(wrapper: HTMLDivElement) {
  return wrapper.children.length === 1 ? wrapper.children[0] : wrapper;
}

function addHookIndexAttribute(head: string, element: string, index: number) {
  return (
    head +
    insertStrAtIndex(
      element,
      ` data-hook-index="${index}"`,
      element.indexOf(" ")
    )
  );
}

function updateHookIndexAttribute(
  head: string,
  element: string,
  index: number
) {
  return (
    head +
    element.replace(
      /data-hook-index="(.+?)"/,
      (_, refs) => `data-hook-index="${refs} ${index}"`
    )
  );
}

// Pull out all attributes from given @node that contains template in their value. Then map them onto index-object.
// Each key in index-object represents the "binding.index" to be matched during render and update cycle.
function getAllAttributes(node: HTMLElement) {
  return Array.from(node.attributes).reduce(
    (acc: { [key: string]: Attribute }, attr) => {
      if (new RegExp("%#\\d+#%", "g").test(attr.value)) {
        // match[1] is reference to the first capturing group of the RegExp.
        const foundIndexes = Array.from(
          attr.value.matchAll(new RegExp("%#(\\d+)#%", "g"))
        ).map((match) => match[1]);

        const attributeBinding: Attribute = {
          isBoolean: false,
          template: attr.value,
          name: attr.name as AttibuteName,
        };

        // Mark boolean attributes.
        if (attributeBinding.name.indexOf("?") === 0) {
          attributeBinding.name = attributeBinding.name.slice(
            1
          ) as AttibuteName;
          attributeBinding.isBoolean = true;
        }

        for (const index of foundIndexes) {
          acc[index] = attributeBinding;
        }
      }

      return acc;
    },
    {}
  );
}

function updateAttributesTempate(
  node: HTMLElement,
  attribute: Attribute,
  bindings: Binding[]
) {
  const attributeValue = attribute.template.replace(
    /%#(\d+)#%/g,
    (_, index) => {
      const { value } = bindings[Number(index)];
      return value === undefined || value === false ? "" : escapeHtml(value);
    }
  );

  node.setAttribute(attribute.name, attributeValue);

  // Inputs and textareas does set value prop when updating attribute with "setAttribute".
  if (attribute.name === "value") {
    (node as HTMLInputElement).value = attributeValue;
  }
}

// Finds repeater properties in bindings - allow mappinig repeater to proper values.
function findRepeaterPropertiesInBindings(
  hook: HTMLElement,
  bindings: Binding[]
) {
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

function createContainer(node: HTMLElement) {
  return {
    ref: node.parentNode as HTMLElement,
    childIndex: getNodeIndex(node),
  };
}

function getNodeIndex(node: Node | null) {
  let index = 0;
  while (node && (node = node.previousSibling) !== null) index++;
  return index;
}

// Insert only DOM nodes, Text nodes, and Partials.
function insetrNodesBefore(
  nodes: Array<HTMLElement | Text>,
  pointer: HTMLElement | Text
) {
  loop(nodes, (node) => {
    isDomNode(node)
      ? pointer.before(node)
      : // : isPartialTemplate(node)
        // ? pointer.before(createPartialElement(node.markup, node.inserts))
        null;
  });
  pointer.remove();
}

// Escaepe HTML symbols.
export function escapeHtml(s: string) {
  const reEscape = /[&<>'"]/g;
  const oEscape = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  } as const;
  return s.replace(reEscape, (m) => oEscape[m as keyof typeof oEscape]);
}

// Unescaepe HTML symbols.
export function unEscapeHtml(s: string) {
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
  return s.replace(reUnescape, (m) => oUnescape[m as keyof typeof oUnescape]);
}

// ---- Validators ----------------

// Check if current provessing value in HTML is for attribute.
function isAttribute(html: string) {
  return html.lastIndexOf("<") > html.lastIndexOf(">");
}

// Check if current provessing value in HTML is for attribute.
function isEmpty(value: any) {
  return value === undefined || value === false || value === null;
}

// Allow Strings and Numbers.
function isNumberOrString(value: number | string) {
  return typeof value === "number" || typeof value === "string";
}

// Verify if given @value is repeater render function.
function isRepeaterFunction(value: Function, html: string) {
  const lastNodeHtml = html.slice(html.lastIndexOf("<"));
  return typeof value === "function" && lastNodeHtml.includes("$items");
}

// Verify if given @node is instance of a Text or HTMLElement.
function isDomNode(node: HTMLElement | Text) {
  return node instanceof HTMLElement || node instanceof Text;
}

// Verify if given @node is an instance of DynamicElement.
function isDynamicElement(node: HTMLElement) {
  return node.hasOwnProperty("d");
}

// Verify if value is valid for repeater attribute.
function isRepeaterAttribute(name: string, value: Function) {
  return (
    (name === "$key" && typeof value === "function") ||
    (name === "$items" && Array.isArray(value))
  );
}

// Verify attribute is a callback.
function isCallbackAttribute(name: string, value: Function) {
  return name.startsWith("on") && typeof value === "function";
}

// Verify attribute is a innerHTML.
function isInnerHtmlAttribute(name: string, value: string) {
  return (
    name === "$innerhtml" && (typeof value === "string" || value === undefined)
  );
}

// Verify if value is valid for attribute.
function isValidAttributeValue(value?: boolean | string | number) {
  return (
    value === undefined ||
    value === false ||
    typeof value === "number" ||
    typeof value === "string"
  );
}
