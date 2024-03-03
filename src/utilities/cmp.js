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
    let clearActions;
    let effectHandler;
    let initRender = true;

    let render = (state, ...rest) => {

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
        prevState = state;
        element = dynamicElement(renderFn, state, ...restArgs);
        clearEffect = effectHandler?.();

        let rm = element.remove;
        element.remove = () => {

          // Cleanup.
          clearEffect?.();
          clearActions?.();
          rm.call(element);
          rm = element = renderFn = prevState = effectHandler = undefined;

          // Reset.
          props = {};
          restArgs = [];
          initRender = true;
        }
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

  return {
    onAction,
    clearActions,
  };
}
