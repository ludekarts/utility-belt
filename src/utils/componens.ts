import { loop, reduce, removeByInstance } from "./arrays.ts";
import { insertStrAtIndex } from "./strings.js";

/*
  📝 TODO :
  Enable caching partials with ID similary to what Repeaters do for elements.
  This will allow for usecase as follow:

  <div>
    <span>
      ${ isOn ? html("on")`<span>🟢</span>` : html("off")`<span>🔴</span>` }
    </span>
    <button onclick="${toggle}">TOGGLE</button>
  </div>

  In above example partials with ID will be CREATED ONCE and reused on render.
  Currently we can leverage reusability only with one partial e.g.:

  <div>
    <span>
      ${html("abacus")`<span>🧮 ${count}</span>`}
    </span>
    <button onclick="${updateCount}">UPDATE</button>
  </div>

*/

// ----  TYPES -------------------------

type RefsList = Readonly<{ [key: string]: HTMLElement }>;

interface DynamicInterface {
  d: {
    refs: RefsList;
    cleanup: (callback?: () => void) => void;
    update: (state: any, ...rest: any[]) => DynamicElement;
  };
}

// type TemplateFunction = <T>(state: T) => DynamicElement;
type DynamicElement = HTMLElement & DynamicInterface;

type MarkupObject = { markup: string[]; values: any[]; id?: string };
type RenderFunction = (state: any, ...rest: any[]) => MarkupObject;

type AttibuteName =
  | keyof HTMLElement
  | "value"
  | "href"
  | "$ref"
  | "$key"
  | "$items"
  | "$props";

type Attribute = {
  name: AttibuteName; // Attribute name.
  template: string; // Attribute template to update.
  isBoolean: boolean; // Flag for attribute either regular or boolean.
};

type AttributeList = { [key: string]: Attribute };

type BindingType =
  | "text"
  | "node"
  | "list"
  | "partial"
  | "repeater" // Ref. of this binding is a repeater container,
  | "attribute" // Value of this binding is an attribute of the element,
  | "attribute:bool" // Value of this binding is a boolean attribute (disbled, checked, etc.),
  | "attribute:html" // Value of this binding is an innerHTML of the element,
  | "attribute:callback" // Value of this binding is an event callback function,
  | "attribute:repeaterKey" // Value of this binding is a function that retrieves uinque key for repeater's elements (for caching & reusing elements),
  | "attribute:repeaterItems" // Value of this binding is a reference to the array of items for the repeater to render,
  | "attribute:repeaterProps"; // Value of this binding is a reference to the props for the repeater to render.

type Binding = {
  value: any; // Current value of given binding.
  index: number; // Index of binding within template.
  isStatic: boolean; // Flag that marks binding for update (TRUE mean no updates).
  type: BindingType | null;
  ref:
    | HTMLElement[]
    | HTMLElement
    | Text
    | null /* Reference to DOM node holding given value:
                                    - for attributes node with given attribute,
                                    - for lists parent node.*/;
  container: {
    ref: HTMLElement; // Reference to the node's parent element.
    childIndex: number; // Child-node-index of rendered node within this container.
  } | null;
  repeater: {
    update: Function; // Update function used to generate a new array of nodes to display in repeater.
    sourceIndex: number; // Index of binding containing items for the repeater.
    propsIndex?: number; // Index of binding containing props for the repeater.
  } | null;
};
type ComponentProps = {
  getState: () => void;
  getRefs: () => RefsList | null;
  getArgs: (index: number) => any;
  onMount: (callback: () => () => void) => void;
  onUpdate: (callback: () => () => void) => void;
};

type ComponentFunction = (props: ComponentProps) => RenderFunction;

// ----  API ---------------------------

export function html(markup: TemplateStringsArray, ...values: any[]) {
  // Run as generic template.
  if (markup && Boolean(markup.raw)) {
    return Object.freeze({ markup: markup.raw, values });
  }

  // Run as temtale with ID.
  else if (typeof markup === "string" && values.length === 0) {
    const id = markup;
    return function (keyedMarkup: TemplateStringsArray, ...keyedValuse: any[]) {
      if (keyedMarkup && Boolean(keyedMarkup.raw)) {
        return Object.freeze({
          markup: keyedMarkup.raw,
          values: keyedValuse,
          id,
        });
      }
      throw new Error(
        `UTBComponentError: Invalid usage of html helper. Try html("id")\`\` instead.`
      );
    };
  }
  throw new Error(
    `UTBComponentError: Invalid usage of html helper. Try html\`\` or html("id")\`\` instead.`
  );
}

export function component<T>(componentFn: ComponentFunction) {
  let element: DynamicElement | undefined;
  let initRender = true;
  let restArgs: any[] = [];
  let prevState: T | undefined;
  let props: ComponentProps | null = null;
  let renderFn: RenderFunction | undefined;
  let clearOnMount: (() => void) | undefined;
  let onMountHandler: (() => () => void) | undefined;
  let onUpdateHandler:
    | ((newState: any, oldState: any, ...restArgs: any[]) => void)
    | undefined;

  let render = (state: T, ...rest: any[]) => {
    let finalState =
      typeof state === "function" ? state(prevState, ...rest) : state;

    if (initRender) {
      props = {
        getArgs(index) {
          return typeof index === "number" ? restArgs[index] : restArgs;
        },
        getState() {
          return prevState;
        },
        getRefs() {
          return element
            ? element.d?.refs
              ? { root: element, ...element.d.refs }
              : { root: element }
            : null;
        },
        onMount(callback) {
          onMountHandler = callback;
        },
        onUpdate(callback) {
          onUpdateHandler = callback;
        },
      };

      renderFn = componentFn(props);
      initRender = false;
    }

    if (rest.length > 0) {
      restArgs = rest;
    }

    // Create new dynamic element.
    if (!element && renderFn) {
      prevState = finalState;
      element = createDynamicElement(renderFn, finalState, ...restArgs);
      clearOnMount = onMountHandler?.();
      element.d.cleanup(() => {
        clearOnMount?.();
        props = null;
        restArgs = [];
        initRender = true;
        element =
          prevState =
          renderFn =
          onMountHandler =
          onUpdateHandler =
            undefined;
      });
    }

    // Re-render with previouse State.
    else if (element && finalState === undefined) {
      const upState = onUpdateHandler?.(prevState, prevState, ...restArgs);
      element.d.update(
        upState !== undefined ? upState : prevState,
        ...restArgs
      );
    }

    // Update only when State changes.
    else if (element && prevState !== finalState) {
      prevState = finalState;
      const upState = onUpdateHandler?.(finalState, prevState, ...restArgs);
      element.d.update(
        upState !== undefined ? upState : finalState,
        ...restArgs
      );
    }

    return element;
  };

  return render;
}

// ---- STATE SLICE CACHE --------------

/**
 * StateSliceCache allows for using slice of a global state as initial state for another component preventing
 * from overriding of this slice of a state when parent component updated global state.
 *
 * @example
 * See docs example code for State Slice Cache.
 */

interface StateCache<T> {
  (state: T): T | undefined;
  remove(state: any): void;
}

const stateSliceCache: any[] = [];

export const st: StateCache<any> = function <T>(state: T): T | undefined {
  if (!stateSliceCache.includes(state)) {
    stateSliceCache.push(state);
    return state;
  }
  return undefined;
} as StateCache<any>;

st.remove = function (state: any) {
  const index = stateSliceCache.indexOf(state);
  index > -1 && stateSliceCache.splice(index, 1);
};

// ---- CORE ---------------------------

function createDynamicElement(
  renderFn: RenderFunction,
  initState: any,
  ...rest: any[]
) {
  const { markup, values } = renderFn(initState, ...rest);
  if (!markup || !values) {
    throw new Error(
      "UTBComponentError: Invalid render function. Expected: (state) => html`...`."
    );
  }
  return dynamicElement(markup, values, renderFn);
}

// Creates a new DynamicElement that can be updated with render function.
function dynamicElement(
  markup: string[],
  values: any[],
  renderFn?: RenderFunction
) {
  const { element, bindings, attributes } = elementFromTemplate(markup, values);
  (element as any).d = Object.freeze({
    refs: getReferences(element),
    cleanup: createCleanupFn(bindings),
    update: updateDynamicElement(element, bindings, attributes, renderFn),
  });
  return element as DynamicElement;
}

// Create new HTML element from given MarkupObject (markup & values).
function elementFromTemplate(markup: string[], values: any[] = []) {
  let attributes: AttributeList = {};

  const bindings: Binding[] = [];
  const wrapper = document.createElement("div");

  // Combine HTML markup and add placeholders for external inputs.
  const componentHtml = reduce(
    Array.from(markup),
    (acc, part, index, isLast) => {
      let value = values[index];
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
          placeholder = `<hr data-hook-index="${index}" data-hook-type="text"/>`;
        }

        // Detect Numbers & Strings.
        else if (isNumberOrString(value)) {
          placeholder = `<hr data-hook-index="${index}" data-hook-type="text"/>`;
        }

        // Detect HTML Elements.
        else if (isDomNode(value)) {
          placeholder = `<hr data-hook-index="${index}" data-hook-type="node"/>`;
        }

        // Detect Array of Nodes.
        else if (Array.isArray(value)) {
          placeholder = `<hr data-hook-index="${index}" data-hook-type="list"/>`;
        }

        // Detect Partial Templates.
        else if (isMarkupObject(value)) {
          placeholder = `<hr data-hook-index="${index}" data-hook-type="partial"/>`;
        }

        // Detect repeater render function.
        else if (isRepeaterFunction(value, html)) {
          placeholder = `<hr data-hook-index="${index}" data-hook-type="repeater"/>`;
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
  // preInsertProcessing() runs additional cleanup & setup tasks before creating initial DOM nodes (HOOKED version)
  // that will be used to map external values into the template.
  wrapper.insertAdjacentHTML(
    "beforeend",
    preInsertProcessing(componentHtml, bindings)
  );

  // Map data-hook-index elements and attributes into their external values.
  const dataHooks: HTMLElement[] = Array.from(
    wrapper.querySelectorAll("[data-hook-index]")
  );

  // Complete bindings configuration (assign node references and containers).
  loop(dataHooks, (hook) => {
    const type = hook.dataset.hookType;

    const reperaterMarkers = {
      hasItems: false,
      hasProps: false,
    };

    // Attributes.
    if (type === undefined) {
      const hookAttributes = getAllAttributes(hook);
      const bindingIndexes = Object.keys(hookAttributes);

      loop(bindingIndexes, (index) => {
        const binding = bindings[Number(index)];

        binding.ref = hook;
        binding.container = createContainer(hook);

        const attribute = hookAttributes[index];

        // console.log(binding, attribute);

        // Handle boolean attributes.
        if (attribute.isBoolean) {
          binding.type = "attribute:bool";

          hook.removeAttribute(`${attribute.name}?`);

          Boolean(binding.value)
            ? hook.setAttribute(attribute.name, attribute.name)
            : hook.removeAttribute(attribute.name);
        }

        // Handle special case for repeater attirbutes $key, $items or $props.
        else if (isRepeaterAttribute(attribute.name, binding.value)) {
          // Mark as repeater Key, block for updates and cleanup.
          if (attribute.name === "$key") {
            binding.isStatic = true;
            binding.type = "attribute:repeaterKey";
            hook.removeAttribute(attribute.name);
          }

          // Mark as repeater Items and cleanup.
          if (attribute.name === "$items") {
            reperaterMarkers.hasItems = true;
            binding.type = "attribute:repeaterItems";
            hook.removeAttribute(attribute.name);
          }

          // Mark as repeater Items and cleanup.
          if (attribute.name === "$props") {
            reperaterMarkers.hasProps = true;
            // Make sure that $props value is fresh when $items are updated.
            if (reperaterMarkers.hasItems) {
              throw new Error(
                `UTBComponentError: Repeater $props must be defined before $items.`
              );
            }
            binding.type = "attribute:repeaterProps";
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

        // Hendle defaultValue attributes.
        else if (isDefaultValueAttribute(attribute.name, binding.value)) {
          hook.removeAttribute(attribute.name);
          hookAttributes[index].name = "value";
          binding.type = "attribute";
        }

        // Hendle interpolated href attributes.
        else if (isIntHrefAttribute(attribute.name, binding.value)) {
          hook.removeAttribute(attribute.name);
          hookAttributes[index].name = "href";
          binding.type = "attribute";
          updateAttributesTemplate(hook, attribute, bindings);
        }

        // Handle non-boolean attributes.
        else if (isValidAttributeValue(binding.value)) {
          binding.type = "attribute";
          updateAttributesTemplate(hook, attribute, bindings);
        } else {
          throw new Error(
            `UTBComponentError: Only String, Numbers, Undefined or False can be passed as attributes. Got: "${typeof binding.value}" at "${index}" value.`
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
      else if (type === "partial") {
        binding.type = "partial";
        binding.ref = dynamicElement(
          (binding.value as MarkupObject).markup,
          (binding.value as MarkupObject).values
        );
        binding.container = createContainer(hook);
        binding.container.ref.replaceChild(binding.ref, hook);
      }

      // Repeaters.
      else if (type === "repeater") {
        binding.type = "repeater";
        binding.isStatic = true;
        binding.ref = hook.parentNode as HTMLElement;
        binding.container = createContainer(hook);

        const renderFn = binding.value;
        const { items, itemsIndex, keySelector, props, propsIndex } =
          findRepeaterPropertiesInBindings(hook, bindings);
        const { elements, updateRepeater } = createRepeater(
          renderFn,
          items,
          keySelector,
          props
        );

        binding.value = elements;

        bindings[itemsIndex].repeater = {
          update: updateRepeater,
          sourceIndex: binding.index,
          propsIndex,
        };

        insetrNodesBefore(binding.value, hook);
      }
    }

    hook.removeAttribute("data-hook-index");
  });

  // Strip wrapper node if not needed.
  const element = stripWrapper(wrapper) as HTMLElement;

  return {
    element,
    bindings,
    attributes,
  };
}

// Updates values in DynamicElement.
function updateDynamicElement(
  element: HTMLElement,
  bindings: Binding[],
  attributes: AttributeList,
  renderFn?: RenderFunction
) {
  return (state: any, ...rest: any[]) => {
    const values = renderFn ? renderFn(state, ...rest).values : state;
    if (!values)
      throw new Error(
        "UTBComponentError: Cannot update element. Invalid input"
      );
    loop(values, updateElementValues(bindings, attributes));
    return element;
  };
}

// Runs only through the values that need to be updated.
function updateElementValues(bindings: Binding[], attibutes: AttributeList) {
  return (value: any, index: number) => {
    return (
      Boolean(bindings[index].isStatic) === false &&
      value !== bindings[index].value &&
      updateReference(index, bindings, attibutes, value)
    );
  };
}

// Updates values of an element and it's references.
function updateReference(
  index: number,
  bindings: Binding[],
  attributes: AttributeList,
  newValue: any
) {
  const binding = bindings[index];

  // console.log(
  //   `Update:\n${JSON.stringify(binding, null, 2)}\n`,
  //   "New value:",
  //   newValue
  // );

  if (!binding) {
    throw new Error(`UTBComponentError: Missing binding at index: "${index}".`);
  }

  if (!binding.ref || !binding.container) {
    throw new Error(
      `UTBComponentError: Missing references on binding: "${index}".`
    );
  }

  // Update Boolean Attributes.
  if (binding.type === "attribute:bool") {
    const attribute = attributes[binding.index];
    const refElement = binding.ref as HTMLElement;

    Boolean(newValue)
      ? refElement.setAttribute(attribute.name, attribute.name)
      : refElement.removeAttribute(attribute.name);

    binding.value = newValue;
  }

  // Update Repeater $props.
  if (binding.type === "attribute:repeaterProps") {
    // NOTE: We keep this value fresh however it change does not trigger element updates.
    binding.value = newValue;
  }

  // Update Repeater $items.
  if (binding.type === "attribute:repeaterItems") {
    binding.value = newValue;

    if (binding.repeater) {
      const { sourceIndex, propsIndex, update } = binding.repeater;
      const repeaterValue = update(
        newValue,
        typeof propsIndex === "number" ? bindings[propsIndex].value : undefined
      );
      updateArrayOfNodes(bindings[sourceIndex], repeaterValue);
      bindings[sourceIndex].value = repeaterValue;
    } else {
      throw new Error(`UTBComponentError: Repeater items binding is missing.`);
    }
  }

  // Update element callbacks.
  else if (binding.type === "attribute:callback") {
    const attribute = attributes[binding.index];
    (binding as any).ref[attribute.name] = newValue;
    binding.value = newValue;
  }

  // Update innerHtml.
  else if (binding.type === "attribute:html") {
    (binding.ref as HTMLElement).innerHTML = newValue || "";
    binding.value = newValue;
  }

  // Update regular attributes.
  else if (binding.type === "attribute") {
    if (isValidAttributeValue(newValue)) {
      // Update value in bindings early on so it can be used in updateAttributes Template() fn on the next line.
      // This simplifies logic of updateAttributesTemplate().
      binding.value = newValue;
      updateAttributesTemplate(
        binding.ref as HTMLElement,
        attributes[binding.index],
        bindings
      );
    } else {
      throw new Error(
        `UTBComponentError: Only String, Numbers, Undefined or False can be passed as attributes. Got: "${typeof newValue}" at value of index: "${
          binding.index
        }".`
      );
    }
  }

  // Update TextNode.
  else if (binding.type === "text") {
    // TextNode to -> Empty String (undefined).
    if (isEmpty(newValue)) {
      (binding.ref as Text).textContent = "";
    }

    // TextNode to -> TextNode (Strings || Numbers).
    else if (isNumberOrString(newValue)) {
      (binding.ref as Text).textContent = newValue;
    }

    // TextNode to -> Single DOM Node.
    else if (isDomNode(newValue)) {
      binding.type = "node";
      binding.container.ref.replaceChild(newValue, binding.ref as Text);
      binding.ref = newValue;
    }

    // TextNode to -> Partial.
    else if (isMarkupObject(newValue)) {
      const partialNode = dynamicElement(
        (newValue as MarkupObject).markup,
        (newValue as MarkupObject).values
      );
      binding.type = "partial";
      binding.container.ref.replaceChild(partialNode, binding.ref as Text);
      binding.ref = partialNode;
    }

    // TextNode to -> Array of DOM Nodes.
    else if (Array.isArray(newValue)) {
      insetrNodesBefore(newValue, binding.ref as Text);
      binding.type = "list";
      binding.ref = newValue as HTMLElement[];
    }

    // Update current binding value.
    binding.value = newValue;
  }

  // Update Single DOM Node.
  else if (binding.type === "node") {
    // Run children cleanup.
    if (isDynamicElement(binding.ref)) {
      (binding.ref as DynamicElement).d.cleanup();
    }

    // Single DOM Node to -> Empty TextNode.
    if (isEmpty(newValue)) {
      const textNode = document.createTextNode("");
      binding.container.ref.replaceChild(textNode, binding.ref as HTMLElement);
      binding.type = "text";
      binding.ref = textNode;
    }

    // Single DOM Node to -> TextNode (Strings || Numbers).
    else if (isNumberOrString(newValue)) {
      const textNode = document.createTextNode(newValue);
      binding.container.ref.replaceChild(textNode, binding.ref as HTMLElement);
      binding.type = "text";
      binding.ref = textNode;
    }

    // Single DOM Node to -> DOM Node.
    else if (isDomNode(newValue)) {
      binding.container.ref.replaceChild(newValue, binding.ref as HTMLElement);
      binding.ref = newValue;
    }

    // Single DOM Node to -> Partial.
    else if (isMarkupObject(newValue)) {
      const partialNode = dynamicElement(
        (newValue as MarkupObject).markup,
        (newValue as MarkupObject).values
      );
      binding.container.ref.replaceChild(
        partialNode,
        binding.ref as HTMLElement
      );
      binding.type = "partial";
      binding.ref = partialNode;
    }

    // Single DOM Node to -> Array of DOM Nodes.
    else if (Array.isArray(newValue)) {
      insetrNodesBefore(newValue, binding.ref as HTMLElement);
      binding.type = "list";
      binding.ref = newValue;
    }

    // Update current binding value.
    binding.value = newValue;
  }

  // Update Nodes List.
  else if (binding.type === "list") {
    // Array of DOM Nodes to -> Empty TextNode.
    if (isEmpty(newValue)) {
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
    else if (isMarkupObject(newValue)) {
      const partialNode = dynamicElement(
        (newValue as MarkupObject).markup,
        (newValue as MarkupObject).values
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
    if (isEmpty(newValue)) {
      const textNode = document.createTextNode("");
      binding.container.ref.replaceChild(
        textNode,
        binding.ref as DynamicElement
      );
      binding.type = "text";
      binding.ref = textNode;
    }

    // Partial -> TextNode (Strings || Numbers).
    else if (isNumberOrString(newValue)) {
      const textNode = document.createTextNode(newValue);
      binding.container.ref.replaceChild(
        textNode,
        binding.ref as DynamicElement
      );
      binding.type = "text";
      binding.ref = textNode;
    }

    // Partial -> DOM Node.
    else if (isDomNode(newValue)) {
      binding.container.ref.replaceChild(
        newValue,
        binding.ref as DynamicElement
      );
      binding.type = "node";
      binding.ref = newValue;
    }

    // Partial -> Partial.
    else if (isMarkupObject(newValue)) {
      // Partial -> Partial with same ID.
      if (isSameDymaicId(binding.value, newValue)) {
        (binding.ref as DynamicElement).d.update(
          (newValue as MarkupObject).values
        );
      }

      // Partial -> Partial with different ID.
      else {
        const partialNode = dynamicElement(
          (newValue as MarkupObject).markup,
          (newValue as MarkupObject).values
        );
        binding.container.ref.replaceChild(
          partialNode,
          binding.ref as DynamicElement
        );
        binding.type = "partial";
        binding.ref = partialNode;
      }
    }

    // Partial -> Array of DOM Nodes.
    else if (Array.isArray(newValue)) {
      insetrNodesBefore(newValue, binding.ref as DynamicElement);
      binding.type = "list";
      binding.ref = newValue;
    }

    // Update current binding value.
    binding.value = newValue;
  }
}

function preInsertProcessing(componentHtml: string, bindings: Binding[]) {
  type Processor = (html: string, bindings: Binding[]) => string;
  const processors: Processor[] = [
    // rewireValueAttributes() alow for setting default value for input elements without causing error when parsing
    // HTML template into DOM elements. Since some inputs allows only for specific values (e.g. Number, Date string, etc.)
    // attribute temaplate-string used for dynamic interpolation (%#0#%) is invalid.
    // Therefore we set it as static value and re-bind it during first update.
    rewireValueAttributes,
    // rewireHrefAttributes() allows to set href attribute with interpolated values without causing fetch error when parsing
    // HTML template into DOM elements. This step is required due to fact that interpolated href is always invalid
    // during BUILD_PHASE since it contains interpolation string (%#0#%).
    rewireHrefAttributes,
  ];

  return processors.reduce(
    (acc, processor) => processor(acc, bindings),
    componentHtml
  );
}

// Creates cleanup function that runs through all dynamic elements and run their cleanup functions.
function createCleanupFn(bindings: Binding[]) {
  type CleanupFnunction = (() => void) | undefined;
  let cleanupCallback: CleanupFnunction;
  return (cleanupSetup?: CleanupFnunction) => {
    if (typeof cleanupSetup === "function") {
      cleanupCallback = cleanupSetup;
    } else {
      cleanupCallback?.();
      bindings.forEach((binding) => {
        if (binding.type === "node" && binding.value?.d?.cleanup) {
          binding.value.d.cleanup();
        }
      });
      cleanupCallback = undefined;
    }
  };
}

// ---- REPEATERS -----------------

type RepeaterKeySelector = (item: any) => string;
type RepaetrPool = { [key: string]: HTMLElement | DynamicElement };

const repeatersPool: RepaetrPool[] = [];

// Clean up repeaters elements (by default) every 5 minutes.
let terminateElementsIntervel = 300_000;
let terminateTimre = setInterval(cleanupRepeaters, terminateElementsIntervel);

function createRepeater(
  renderFn: RenderFunction,
  collection: any[],
  keySelector: RepeaterKeySelector,
  props: any
) {
  repeatersPool.push({});

  const repeaterIndex = repeatersPool.length - 1;

  const elements = collection.map((item, index) => {
    const element = renderFn(
      item,
      props !== undefined ? props : index,
      props !== undefined ? index : undefined
    );

    if (isMarkupObject(element)) {
      const partialNode = dynamicElement(
        element.markup,
        element.values,
        renderFn
      );
      repeatersPool[repeaterIndex][keySelector(item)] = partialNode;
      return partialNode;
    } else if (element instanceof HTMLElement) {
      repeatersPool[repeaterIndex][keySelector(item)] = element;
      return element;
    } else {
      throw new Error(
        "UTBComponentError: Invalid element type in repeater. Only HTMLElement or Partial can be used in repeater."
      );
    }
  });

  const updateRepeater = (collection: any[], props: any) => {
    return collection.map((item, index) => {
      let element = repeatersPool[repeaterIndex][keySelector(item)];

      if (!element) {
        const node = renderFn(
          item,
          props !== undefined ? props : index,
          props !== undefined ? index : undefined
        );

        if (node instanceof HTMLElement) {
          element = repeatersPool[repeaterIndex][keySelector(item)] = node;
        } else if (isMarkupObject(node)) {
          element = repeatersPool[repeaterIndex][keySelector(item)] =
            dynamicElement(node.markup, node.values, renderFn);
        }
        return element;
      }

      return isDynamicElement(element)
        ? (element as DynamicElement).d.update(
            item,
            props !== undefined ? props : index,
            props !== undefined ? index : undefined
          )
        : element;
    });
  };

  return {
    elements,
    updateRepeater,
  };
}

export function utbc_setTerminateInterval(time?: number) {
  if (time === undefined) {
    return terminateElementsIntervel;
  } else if (time === 0) {
    clearInterval(terminateTimre);
  } else {
    clearInterval(terminateTimre);
    terminateElementsIntervel = time;
    terminateTimre = setInterval(cleanupRepeaters, terminateElementsIntervel);
  }
}

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

// Mark dynamic attibute in element.
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

// Add more dynamic attibutes for element.
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

        if (attributeBinding.name.endsWith("?")) {
          attributeBinding.name = attributeBinding.name.slice(
            0,
            -1
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

// Update template for dynamic attributes.
function updateAttributesTemplate(
  node: HTMLElement,
  attribute: Attribute,
  bindings: Binding[]
) {
  const attributeValue = attribute.template.replace(
    /%#(\d+)#%/g,
    (_, index) => {
      const { value } = bindings[Number(index)];
      return value === undefined || value === false
        ? ""
        : escapeHtml(String(value));
    }
  );

  node.setAttribute(attribute.name, attributeValue);

  // Inputs and textareas does set value prop when updating attribute with "setAttribute".
  if (attribute.name === "value") {
    (node as HTMLInputElement).value = attributeValue;
  }
}

// Set default value for input elements & provide additional data-hook.
function rewireValueAttributes(html: string, bindings: Binding[]) {
  return html.replace(/ value="%#(\d+)#%"/g, (_, index) => {
    const value = bindings[Number(index)].value;
    return ` value="${value}" data-hook-dv="%#${index}#%"`;
  });
}

// Replace href attribute with additional data-hook to allow dynamic URL interpolation.
function rewireHrefAttributes(html: string, _bindings: Binding[]) {
  return html.replace(/ href="(.+%#\d+#%.+?)"/g, (_, template) => {
    return ` data-hook-hf="${template}"`;
  });
}

/*
    Implements 4 basic actions to update DOM tree.
    - ADD:      when node is the new one.
    - SKIP:     when node matches old position.
    - MOVE:     when node position changed.
    - REVMOE:   when node does not exist in new structure.
  */
function updateArrayOfNodes(binding: Binding, newValue: any[]) {
  type ArrayNode = HTMLElement | Text;
  let markForDeletion: Array<ArrayNode> = [];

  // Remove all nodes that does not exist in newValue array.
  loop(binding.value, (node, index) => {
    if (binding.container) {
      const childIndex = binding.container.childIndex + index;
      if (
        (isDomNode(node as ArrayNode) && !newValue.includes(node)) ||
        isMarkupObject(node)
      ) {
        binding.value = removeByInstance(binding.value, node);
        markForDeletion.push(
          binding.container.ref.childNodes[childIndex] as ArrayNode
        );
      }
    }
  });

  // Update remaining nodes.
  loop(newValue, (newNode, index) => {
    if (binding.container) {
      // Offset index value with container.childIndex in case list is not only item in the element.
      const insertIndex = binding.container.childIndex + index;

      // Check for new node.
      const isNewNode = binding.value.indexOf(newNode) === -1;

      // Add (node does not exist -> append new node).
      if (isNewNode) {
        isMarkupObject(newNode)
          ? insertNodeAtIndex(
              insertIndex,
              dynamicElement(
                (newNode as MarkupObject).markup,
                (newNode as MarkupObject).values
              ),
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
    } else {
      throw new Error(
        `UTBComponentError: Cannot update nodes. Missing container reference.`
      );
    }
  });

  // Remove marked nodes.
  loop(markForDeletion, (node) => {
    isDynamicElement(node) && (node as DynamicElement).d.cleanup();
    node.remove();
  });
}

// Finds repeater properties in bindings - allow mappinig repeater to proper values.
function findRepeaterPropertiesInBindings(
  hook: HTMLElement,
  bindings: Binding[]
) {
  // Current Binding Index - 1;
  let index = Number(hook.dataset.hookIndex) - 1;
  let itemsIndex = 0;
  let propsIndex;
  let keySelector;
  let props;
  let items;

  while (index > -1) {
    if (bindings[index].type === "attribute:repeaterItems") {
      items = bindings[index].value;
      itemsIndex = index;
    }

    if (bindings[index].type === "attribute:repeaterKey") {
      keySelector = bindings[index].value;
    }

    if (bindings[index].type === "attribute:repeaterProps") {
      props = bindings[index].value;
      propsIndex = index;
    }

    index--;
  }

  return {
    items,
    props,
    propsIndex,
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
  nodes: Array<HTMLElement | Text | MarkupObject>,
  pointer: HTMLElement | Text
) {
  loop(nodes, (node) => {
    isDomNode(node)
      ? pointer.before(node)
      : isMarkupObject(node)
      ? pointer.before(
          dynamicElement(
            (node as MarkupObject).markup,
            (node as MarkupObject).values
          )
        )
      : null;
  });
  pointer.remove();
}

// Simplify adding nodes at given index.
function insertNodeAtIndex(
  index: number,
  node: HTMLElement | Text,
  parent: HTMLElement
) {
  node !== parent.childNodes[index]
    ? index === 0
      ? parent.childNodes.length === 0
        ? parent.append(node)
        : parent.childNodes[0].before(node)
      : parent.childNodes[index - 1].after(node)
    : null;
}

// Remove only direct nodes of the container element.
function removeNodes(nodes: DynamicElement[], container: HTMLElement) {
  loop(nodes, (node) => {
    if (node.parentNode === container) {
      node.d?.cleanup();
      node.remove();
    }
  });
}

// Pull out and cleanup "ref" hooks.
function getReferences(element: HTMLElement) {
  const refs: { [key: string]: HTMLElement } = {};
  const refsElements: HTMLElement[] = Array.from(
    element.querySelectorAll("[\\$ref]")
  );

  loop(refsElements, (refNode) => {
    const refName = refNode.getAttribute("$ref");
    if (refName) {
      refs[refName] = refNode;
      refNode.removeAttribute("$ref");
    }
  });

  return Object.freeze(refs);
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
function isDomNode(node: any) {
  return node instanceof HTMLElement || node instanceof Text;
}

// Verify if given @node is a template partial.
function isMarkupObject(node: any) {
  return Boolean(
    node.hasOwnProperty("markup") &&
      node.hasOwnProperty("values") &&
      Array.isArray(node.values) &&
      Array.isArray(node.markup)
  );
}

// Verify if given @partials have same ID.
function isSameDymaicId(partialA: MarkupObject, partialB: MarkupObject) {
  return partialA.id && partialB.id && partialA.id === partialB.id;
}

// Verify if given @node is a DynamicElement.
function isDynamicElement(node: any) {
  return node.d !== undefined;
}

// Verify if value is valid for repeater attribute.
function isRepeaterAttribute(name: string, value: Function) {
  return (
    (name === "$key" && typeof value === "function") ||
    (name === "$items" && Array.isArray(value)) ||
    (name === "$props" && typeof value !== "function")
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

// Verify if value is an input's defaultValue.
function isDefaultValueAttribute(name: string, value: any) {
  return name === "data-hook-dv" && isValidAttributeValue(value);
}

// Verify if attribute is a interpolated href.
function isIntHrefAttribute(name: string, value: any) {
  return name === "data-hook-hf" && isValidAttributeValue(value);
}
