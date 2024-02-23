import { uid } from "./general.js";
import { dynamicElement } from "./template.js";
import { createStore, createReducer } from "./minirdx.js";

export const cmp = componentCreator();

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
    dispatch: store.dispatch,
    subscribe: store.subscribe,
  });
}


function componentCreator(store) {
  return function cmp(componentFn, reducerConfig) {

    if (store && reducerConfig) {
      if (reducerConfig.hasOwnProperty("actions")) {
        store.extendReducer(createReducerFromConfig(reducerConfig), reducerConfig.store);
      }
      else {
        throw new Error("ComponentError: reducerConfig should have actions key");
      }
    }

    let element;
    let renderFn;
    let prevState;
    let props = {};
    let restArgs = [];
    let clearEffect;
    let effectHandler;
    let firstRender = true;
    let render = (state, ...rest) => {

      if (firstRender) {
        props.getArgs = () => restArgs;
        props.getState = () => prevState;
        props.getRefs = () => element?.d?.refs ? { root: element, ...element.d.refs } : { root: element };
        props.effect = callback => effectHandler = callback;

        if (store) {
          props.dispatch = store.dispatch;
          props.onAction = createActionHandler(store);
        }

        renderFn = componentFn(props);
        firstRender = false;
      }

      if (rest.length > 0) {
        restArgs = rest;
      }

      // Create new dynamic element.
      if (!element) {
        prevState = state;
        element = dynamicElement(renderFn, state, ...restArgs);
        clearEffect = effectHandler?.({ element, refs: element.d.refs, args: restArgs });
      }

      // Re-render with previouse State.
      else if (state === undefined) {
        element.d.update(prevState, ...restArgs);
      }

      // Update only when State changes.
      else if (prevState !== state) {
        prevState = state;
        element.d.update(state, ...restArgs);
      }

      return element;
    };

    render.unmount = () => {
      element.remove();
      element = undefined;
      renderFn = undefined;
      prevState = undefined;
      clearEffect = undefined;
      effectHandler = undefined;
      firstRender = true;
      restArgs = [];
      props = {};
    };

    return render;

  }
}

/*



    let render = (state, ...rest) => {

      if (rest.length > 0) {
        restArgs = rest;
      }

      // Create new dynamic element.
      if (!element) {
        prevState = state;
        element = dynamicElement(renderFn, state, ...restArgs);
        clearEffect = effectHandler?.({ element, refs: element.d.refs, args: restArgs });
      }

      // Re-render with previouse State.
      else if (state === undefined) {
        element.d.update(prevState, ...restArgs);
      }

      // Update only when State changes.
      else if (prevState !== state) {
        prevState = state;
        element.d.update(state, ...restArgs);
      }

      return element;
    };

    render.unmount = () => {
      clearEffect?.();
      element.remove();
      element = undefined;
      restArgs = undefined;
      prevState = undefined;
      clearActionsCallbacks?.();
    };

    render.trash = () => {
      render.unmount();
      props = undefined;
      render = undefined;
      renderFn = undefined;
      effectHandler = undefined;
      clearEffect = undefined;
    }

    return render;
  }
*/


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
        handlers.get(action.type)?.(state, action.payload);
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

  return onAction;
}
