import { dynamicElement } from "./template.js";
import { isPromise } from "./general.js";




/*
// USAGE:

  import { component, html } from "@ludekarts/utility-belt";

  const MyComponent = component(props => {

    const { createValue } = props;

    const [helloMessage, setHelloMessage] = createValue("helloMessage", "Hello for the first time");

    const newHelloMessage = () => {
      setHelloMessage(oldState => oldState.replace("first", "next"));
    };

    return html`
      <button onclick="${newHelloMessage}">${helloMessage()}</button>
    `;
  });

  document.body.append(MyComponent());

*/

export function component(cmpFn) {

  let useRef;
  let element;
  let prevState;
  let createValue;

  let onCreate;
  let onCleanupCallback;
  let onCreateCallback;

  function render(state, ...children) {

    if (state instanceof HTMLElement) {
      children.unshift(state);
      state = undefined;
    }

    if (!createValue) {
      createValue = createInternalStateManager(render, children);
    }

    if (!onCreate) {
      onCreate = callback => !onCreateCallback && (onCreateCallback = callback);
    }

    // Create new dynamic element.
    if (!element) {
      // console.log("create");

      useRef = (refName, callback) => element && callback(element.refs[refName]);
      element = dynamicElement(cmpFn, { state, children, createValue, useRef, onCreate });
      onCleanupCallback = onCreateCallback?.(element, element.refs, state);
      prevState = state;
    }

    // Re-render with previouse State.
    else if (state === undefined) {
      // console.log("re-render");
      element.update({ state: prevState, children, createValue, useRef, onCreate });
    }

    // Update only when State changes.
    else if (prevState !== state) {
      // console.log("update");
      element.update({ state, children, createValue, useRef, onCreate });
      prevState = state;
    }

    return element;
  }

  // Cleanup.

  render.cleanup = function () {
    onCleanupCallback?.();

    element.remove();
    element.refs = null;
    element.update = null;
    element = null;

    prevState = null;
    createValue = null;

    onCreate = null;
    onCreateCallback = null;
    onCleanupCallback = null;

    useRef = null;
  }

  return render;
}


// ---- Internal State Manager ----------------

function createInternalStateManager(render, children) {
  let states = new Map();
  let values = [];

  return (key, initValue) => {

    // On re-render.
    if (states.has(key)) {
      return states.get(key);
    }

    // On first render.
    else {

      if (typeof initValue === "function") {
        const unwrapedValue = initValue();

        // Resolve & store promise value.
        if (isPromise(unwrapedValue)) {
          values.push(undefined);

          let index = values.length - 1;

          unwrapedValue
            .then(value => {
              values[index] = value;
              render(undefined, ...children);
            })
            .catch(error => {
              values[index] = error;
              render(undefined, ...children);
            });
        }

        // Store sync value.
        else {
          values.push(unwrapedValue);
        }
      }

      else {
        values.push(initValue);
      }

      let index = values.length - 1;
      let getset = [

        function getValue(defaultValue) {
          return values[index] === undefined && defaultValue !== undefined
            ? defaultValue
            : values[index];
        },

        function setValue(value) {
          values[index] = typeof value === "function" ? value(values[index]) : value;
          render(undefined, ...children);
          return values[index];
        }

      ];

      states.set(key, getset);
      return getset;
    }
  };
}

