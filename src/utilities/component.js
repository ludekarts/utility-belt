import { uid } from "./general.js";
import { dynamicElement } from "./template.js";
import { createStore, createReducer } from "./minirdx.js";

/*

  [🧩 METHOD]:
  createAppContext(initailState);

  [📓 DESC]:
  Creates main App context with internal shared state.

  [⚙️ USAGE]:

  import { createAppContext } from "@ludekarts/utility-belt";
  . . .

  export const { app, component } = createAppContext({ title: "My app" });


  -----------------------------------------------------

  [🧩 METHOD]:
  app(componentFn, reducerConfig);

  [📓 DESC]:
  Generates App element that can be rendered to the DOM.

  [⚙️ USAGE]:

  import { app } from "./myAppContext.js";
  import { html } from "@ludekarts/utility-belt";

  const reducer = {

    state: {
      someGlobalValue: "hi!",
    },

    actions: {
      "UPDATE_GLOBAL_VALUE": (state, value) => {
        return { ...state, someGlobalValue: value };
      },
    },
  };

  const App = app(({ state, dispatch }) => {

    const updateGloablValue = () => {
      dispatch("UPDATE_GLOBAL_VALUE", "hello!");
    };

    return html`
      <div>
        <h1>{state.title}</h1>
        <span>${state.someGlobalValue}</span>
        <button click="${updateGloablValue}">Change Global Value</button>
      </div>
    `;

  }, reducer);

  document.body.appendChild(App);


  -----------------------------------------------------

  [🧩 METHOD]:
  component(componentFn, reducerConfig);

  [📓 DESC]:
  Cretaes component connected to App global state.

  [⚙️ USAGE]:

  import { component } from "./myAppContext.js";
  import { html } from "@ludekarts/utility-belt";

  const counterReducer = {
      store: "counter",

      state: 0,

      actions: {
        "INCREMENT": (state) => {
          return state + 1;
        },

        "DECREMENT": (state) => {
          return state + 1;
        },
      },
    };
  };

  export const Counter = component(({ state, dispatch }) => {
    return html`
      <div>
        <span>${state}</span>
        <button onclick="${() => dispatch("INCREMENT")}">+</button>
        <button onclick="${() => dispatch("DECREMENT")}">-</button>
      </div>
    `;
  }, counterReducer);

  . . .

  in App component:
  . . .

  return html`
    <div>
      <h1>{state.title}</h1>
      <span>${state.someGlobalValue}</span>
      <button click="${updateGloablValue}">Change Global Value</button>
      ${Counter(state.counter)}
    </div>
  `;


  // -----------------------------------------------------

  [💡 HINT]:
  When creating components in componentFn() you have acces to couple utilitites (state, dispatch, effect, refs):

  component(({state, dispatch, effect, refs }) => {
    return html`...`;
  }, reducerConfig);

  - state:    Global state (or slice of global state) passed to the component function as an argument e.g.:
              ```Counter(state.counter);```
  - dispatch: Dispatch function that can be used to dispatch actions to the global state.
  - effect:   A function that can be used to create effects that will be run when when any of the dependencies changes e.g.:
              ```effect("myEffectUniqueName", () => {}, dep1, dep2, dep3);```
  - refs:     A function that returns refs to DOM elements referenced in template e.g.:
              ```refs().counter.innerHTML```

*/

export function createAppContext(initailState = {}) {
  const initEvent = `@initialize_${uid("--short")}`;
  const mainReducer = createReducer(initailState)
    .on(initEvent, (state, initailState) => ({ ...state, ...initailState }))
    .done();
  const store = createStore(mainReducer);
  const component = componentCreator(store);

  const app = (componentFn, reducerConfig = {}) => {
    const { state, actions } = reducerConfig;

    // Initialize state based on App state.
    state && store.dispatch(initEvent, state);

    const AppComponent = component(componentFn, actions ? { actions } : undefined);

    // Force App re-render on every state change.
    store.subscribe(state => AppComponent({ ...state }));

    return AppComponent(store.getState());
  }

  return Object.freeze({
    app,
    component,
  });
}


/*

  [DOCS 📋]:

  const reducerConfig = {
    store?: "selector.of.value.in.stroe",
    state?: "initail state",
    actions: {
      "ACTION_NAME": (oldState, actionPayloaa) => newState,
    }
  }

*/


function componentCreator(store) {
  let dispatch = store.dispatch;

  return function component(componentFn, reducerConfig) {

    let element;
    let prevState;

    let refs;
    let effect;
    let effects = new Map();

    if (reducerConfig) {
      if (reducerConfig.hasOwnProperty("actions")) {
        store.extendReducer(createReducerFromConfig(reducerConfig), reducerConfig.store);
      }

      else {
        throw new Error("ComponentError: reducerConfig should have actions key");
      }
    }

    function render(state) {

      // Create new dynamic element.
      if (!element) {
        refs = () => element?.d?.refs;
        effect = cerateEffectsStore(effects, element);
        element = dynamicElement(componentFn, { state, dispatch, effect, refs });
        runEffects(effects);
        prevState = state;
      }

      // Re-render with previouse State.
      else if (state === undefined) {
        element.d.update({ state: prevState, dispatch, effect, refs });
      }

      // Update only when State changes.
      else if (prevState !== state) {
        element.d.update({ state, dispatch, effect, refs });
        prevState = state;
      }

      return element;
    }

    render.destroy = () => {
      effects.forEach(({ teardown }) => teardown?.());
      element.remove();
      refs = undefined;
      effect = undefined;
      effect = undefined;
      element = undefined;
      dispatch = undefined;
      prevState = undefined;
    };

    return render;
  }
}


function cerateEffectsStore(effects) {

  return (name, callback, ...deps) => {
    // Add new effect. This will only register effect to be called (with runEffects()) when the element is created.
    if (!effects.has(name)) {
      effects.set(name, { deps, callback });
    }

    // Update effects (on re-render).
    else {
      const effect = effects.get(name);
      if (mismatchDeps(deps, effect.deps)) {
        effect.teardown?.();
        effects.set(name, { deps });
        const teardown = callback();
        effects.set(name, { deps, teardown });
      }
    }
  }
}

// Runs effects after element is created.
function runEffects(effects) {
  for (const [name, { callback, deps }] of effects.entries()) {
    const teardown = callback();
    effects.set(name, { teardown, deps });
  }
}

// Compare dependency arrays.
function mismatchDeps(depsA, depsB) {
  return depsA.length === depsB.length ? depsA.some((d, i) => d !== depsB[i]) : true;
}

// Heler to turn reducer-config into proper reducer function.
function createReducerFromConfig(config) {
  const reducer = Object.keys(config.actions).reduce((acc, action) => {
    return acc.on(action, config.actions[action]);
  }, createReducer(config.state));

  return reducer.done();
}

