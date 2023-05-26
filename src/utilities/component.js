import { dynamicElement } from "./template.js";
import { isPromise } from "./general.js";

export function component(cmpFn) {
  let element;
  let prevState;
  let createValue;

  function render(state, ...children) {

    if (state instanceof HTMLElement) {
      children.unshift(state);
      state = undefined;
    }

    if (!createValue) {
      createValue = createInternalStateManager(render);
    }

    // Create new dynamic element.
    if (!element) {
      // console.log("create");
      element = dynamicElement(cmpFn, { state, children, createValue });
      prevState = state;
    }

    // Re-render with previouse state.
    else if (state === undefined) {
      // console.log("re-render");
      element.update({ state: prevState, children, createValue });
    }

    // Update only for state change.
    else if (prevState !== state) {
      // console.log("update");
      element.update({ state, children, createValue });
      prevState = state;
    }

    return element;
  }

  // Cleanup.

  render.cleanup = function () {
    element.remove();
    element.refs = null;
    element.update = null;
    element = null;
    prevState = null;
    createValue = null;
  }

  return render;
}

function createInternalStateManager(render) {
  let states = new Map();
  let values = [];

  return (key, initValue) => {

    if (states.has(key)) {
      return states.get(key);
    }

    else {

      if (typeof initValue === "function") {
        const unwrapedValue = initValue();

        if (isPromise(unwrapedValue)) {
          values.push(undefined);

          let index = values.length - 1;

          unwrapedValue
            .then(value => {
              values[index] = value;
              render();
            })
            .catch(error => {
              values[index] = error;
              render();
            });
        }
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

        function setValue(v) {
          values[index] = typeof v === "function" ? v(values[index]) : v;
          render();
        }

      ];

      states.set(key, getset);
      return getset;
    }
  };
}

