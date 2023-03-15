import { dynamicElement } from "./template.js";
import { isObject } from "./general.js";


// Helpers that improves working with UTB's template suite.
// It produces a Component function that returns dynamicElement.
// Fn can be called with @state param to update underlying component.
// Component helper also provides a way to preform initialization logic
// as well as internal state and updates.


/* USAGE:

  import { component, html, cmp } from "@ludekarts/utility-belt";


  ---- BASIC ----------------

  const user = {
    name: "John",
  };

  const Greeting = component(
    props => {

      const { element, state } = props;

      state.set(prevState => ({...prevState, phrase: "Hello" }));

      element.onclick = event => {
        event.target.matches("button")
          && state.set(prevState => ({...prevState, phrase: "Goodbye" }));
      };

    },

    state => html`
      <div>
        <h1>${state.phrase} ${state.name}</h1>
        <button>Say googbye</button>
      </div>
    `
  );


  document.body.append(Greeting(user));

  ⚠️ NOTICE: ⚠️
  When hooking to global state remember that global state is always prioritize over internal state, means
  all changes made locally to properties of global state will be overridden when global state updates.


  ---- W/ CLEANUP ----------------

  ⚠️ NOTICE: ⚠️
  Components created by this helper does not provides features like e.g.: moun or unmount hooks.
  This is domain of full fledge frameworks and requires trackign moun state of all generated elemnts through
  the enitire lifecycle of application.
  Howewer it provides a way to perform cleanup on demend such as removing timers or event handlers.
  For that use "onCleanup()" helper and later on, call "element.cleanup()" before disposing the component element.


  const Timer = component(
    props => {
      const { state, onCleanup } = props;

      state.set(() => 0);

      const timerRef = setInterval(() => {
        state.set(s => s + 1);
        console.log("tick");
      }, 1000);

      onCleanup(() => {
        clearInterval(timerRef);
      });

    },
    state => html`
      <div>
        <h4>Timer</h4>
        <strong>${state}</strong>
      </div>
    `
  );

  const timer = Timer();

  document.body.append(timer);

  setTimeout(() => {
    timer.cleanup();
    timer.remove();
  }, 5000);



  ---- SIMPLE COMPOENNET ----------------

  let time = 0;

  const GlobalTimer = cmp(
    state => html`
      <div>
        <h4>Timer</h4>
        <strong>${state}</strong>
      </div>
    `
  );

  setInterval(() => {
    GlobalTimer(time++);
  }, 1000);

  document.body.append(GlobalTimer(time));

*/

export function component(staticFn, renderFn, selectorFn) {
  let element;
  let stateProvider;

  if (isFunctionOrNone(staticFn) && isFunctionOrNone(renderFn) && isFunctionOrNone(selectorFn)) {
    throw new Error("Component: mismatch in arguments")
  }

  let render = (...props) => {

    const [state, ...rest] = props;

    if (!element) {
      const initState = typeof selectorFn === "function" ? selectorFn(state) : state;
      element = dynamicElement(renderFn, initState);
      stateProvider = createStateProvider(initState, element);
      staticFn({
        element,
        state: stateProvider,
        onCleanup: callback => element.cleanup = callback,
      }, ...rest);

    }

    else if (element.update && state !== undefined) {
      const newState = typeof selectorFn === "function" ? selectorFn(state) : state;
      element.update(stateProvider._update(newState));
    }

    return element;
  }

  render.destroy = () => {
    element = undefined;
    stateProvider = undefined;
  };

  return render;
}


// Sipmlified version of component without static logic.
export function cmp(renderFn, selectorFn) {
  let element;

  if (isFunctionOrNone(renderFn) && isFunctionOrNone(selectorFn)) {
    throw new Error("Component: mismatch in arguments")
  }

  let render = state => {

    if (!element) {
      const initState = typeof selectorFn === "function" ? selectorFn(state) : state;
      element = dynamicElement(renderFn, initState);
    }

    else if (element.update && state !== undefined) {
      const newState = typeof selectorFn === "function" ? selectorFn(state) : state;
      element.update(newState);
    }

    return element;
  }

  render.destroy = () => {
    element = undefined;
  };

  return render;
}


function isFunctionOrNone(fn) {
  typeof fn === "function" || fn === undefined;
}


function createStateProvider(initState, element) {
  let state = initState;
  return Object.freeze({
    get() {
      return state;
    },

    set(updateStateFn) {
      if (typeof updateStateFn !== "function")
        throw new Error(`state.set() can be obly called with function: prevState => newState`);
      state = updateStateFn(state)
      typeof element.update === "function" && element.update(state);
    },

    _update(value) {
      if (state !== value) {
        if (isObject(value)) {
          state = { ...state, ...value };
        }
        else {
          state = value;
        }
      }
      return state;
    }

  });
}
