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

  let dispatch = store?.dispatch;

  return function cmp(componentFn, reducerConfig) {

    let element;
    let prevState;
    let restArgs = [];
    let onEffectHandler;
    let removeEffectHandler;
    let renderFn = componentFn({
      dispatch,
      getArgs: () => restArgs,
      getState: () => prevState,
      getRefs: () => element?.d?.refs,
      effect: callback => onEffectHandler = callback,
    });

    if (store && reducerConfig) {
      if (reducerConfig.hasOwnProperty("actions")) {
        store.extendReducer(createReducerFromConfig(reducerConfig), reducerConfig.store);
      }

      else {
        throw new Error("ComponentError: reducerConfig should have actions key");
      }
    }

    let render = (state, ...rest) => {

      if (rest.length > 0) {
        restArgs = rest;
      }

      // Create new dynamic element.
      if (!element) {
        prevState = state;
        element = dynamicElement(renderFn, state, ...restArgs);
        removeEffectHandler = onEffectHandler?.({ element, refs: element.d.refs, args: restArgs });
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
      removeEffectHandler?.();
      element.remove();
      element = undefined;
      restArgs = undefined;
      prevState = undefined;
    };

    render.trash = () => {
      render.unmount();
      render = undefined;
      renderFn = undefined;
      onEffectHandler = undefined;
      removeEffectHandler = undefined;
    }

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

