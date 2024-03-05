import { dynamicElement } from "./template.js";
import { createStore, createReducer, createSelector } from "./minirdx.js";

export const component = componentCreator();

export function createAppContext(initailState = {}) {

  const mainReducer = createReducer(initailState).done();
  const store = createStore(mainReducer);
  const cmp = componentCreator(store);

  const component = (componentFn, reducerConfig) => {
    const renderFn = cmp(componentFn, reducerConfig);
    if (reducerConfig && typeof reducerConfig.store === "string") {
      const { getter } = createSelector(reducerConfig.store);
      return (state, ...args) => renderFn(getter(state), ...args);
    }
    else {
      return (state, ...args) => renderFn(state, ...args);
    }
  };

  const renderApp = (root, appRenderFn) => {
    if (typeof root === "string" || root instanceof HTMLElement) {
      const rootNode = root instanceof HTMLElement ? root : document.querySelector(root);
      store.subscribe(state => appRenderFn({ ...state }));
      rootNode.appendChild(appRenderFn(store.getState()));
    }
    else {
      throw new Error("CreateAppContextError: root selector should ba a \"string\" or \"HTMLElement\"");
    }
  }

  return Object.freeze({
    component,
    renderApp,
    dispatch: store.dispatch,
    subscribe: store.subscribe,
  });
}


function componentCreator(store) {
  return function (componentFn, reducerConfig) {

    if (store && reducerConfig) {
      if (reducerConfig.hasOwnProperty("actions")) {
        store.extendReducer(createReducerFromConfig(reducerConfig), reducerConfig.store);
      }
      else {
        throw new Error("ComponentError: reducerConfig should have \"actions\" key");
      }
    }

    let element;
    let renderFn;
    let prevState;
    let props = {};
    let restArgs = [];
    let clearEffect;
    let clearActions;
    let effectHandler;
    let initRender = true;

    let render = (state, ...rest) => {

      let finalState = typeof state === "function" ? state(prevState, ...rest) : state;

      if (initRender) {
        props.getArgs = () => restArgs;
        props.getState = () => prevState;
        props.getRefs = () => element?.d?.refs ? { root: element, ...element.d.refs } : { root: element };
        props.effect = callback => effectHandler = callback;

        if (store) {
          let cah = createActionHandler(store);
          props.dispatch = store.dispatch;
          props.onAction = cah.onAction;
          clearActions = cah.clearActions;
        }

        renderFn = componentFn(props);
        initRender = false;
      }

      if (rest.length > 0) {
        restArgs = rest;
      }

      // Create new dynamic element.
      if (!element) {
        prevState = finalState;
        element = dynamicElement(renderFn, finalState, ...restArgs);
        clearEffect = effectHandler?.();
        element.d.cleanup(() => {
          // Cleanup.
          clearEffect?.();
          clearActions?.();
          element = renderFn = prevState = effectHandler = undefined;

          // Reset.
          props = {};
          restArgs = [];
          initRender = true;
        });
      }

      // Re-render with previouse State.
      else if (finalState === undefined) {
        element.d.update(prevState, ...restArgs);
      }

      // Update only when State changes.
      else if (prevState !== finalState) {
        prevState = finalState;
        element.d.update(finalState, ...restArgs);
      }

      return element;
    };

    return render;

  }
}


// Heler to turn reducer-config into proper reducer function.
function createReducerFromConfig(config) {
  const reducer = Object.keys(config.actions).reduce((acc, action) => {
    return acc.on(action, config.actions[action]);
  }, createReducer(config.state));

  return reducer.done();
}


function createActionHandler(store) {

  let handlers;
  let unsubscribe;

  function onAction(actionName, handler) {

    // Setup handlers.
    if (handlers === undefined) {
      handlers = new Map();
      unsubscribe = store.subscribe((state, action) => {
        handlers?.get(action.type)?.(state, action.payload);
      });
    }

    if (handlers.has(actionName)) {
      throw new Error(`ComponentError: onAction handler "${actionName}" already exists`);
    }

    handlers.set(actionName, handler);
  };

  function clearActions() {
    handlers = undefined;
    unsubscribe?.();
  }

  return {
    onAction,
    clearActions,
  };
}
