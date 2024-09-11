// Library for state management inspired by Redux & pubsub design pattern.
// by @ludekarts 02.2022

/*

  [🧩 METHOD]:
  createReducer();

  [📓 DESC]:
  Creates reducer with chaining API instead of switch statements.

  [💡 HINT]:
  When used with extendReducer() providing @initailState will override property pointed by the selector with given @initialState.
  If you want to preserve existing state object structure DO NOT pass any initialState to the creator.

  [⚙️ USAGE]:

  import { createReducer } from "@ludekarts/utility-belt";
  . . .

  const inistState = {
    name: "John",
  };

  const myReducer = createReducer(inistState)
    .on("change-name", (state, name) => {
      return { ...state, name };
    })
    .on("add-age", (state, age) => {
      return { ...state, age };
    })
    .done();

*/

export function createReducer(initState) {
  const api = {};
  const actions = new Map();

  api.on = (actionName, actionReducer) => {
    if (actions.has(actionName)) {
      throw new Error(
        `MiniRDXError: Action name "${actionName}" already exist`
      );
    }

    if (typeof actionName !== "string") {
      throw new Error(`MiniRDXError: Action name should be a string`);
    }

    if (typeof actionReducer !== "function") {
      throw new Error(`MiniRDXError: Action reducer should be a function`);
    }

    actions.set(actionName, actionReducer);
    return api;
  };

  api.done = function () {
    return function reducer(state = initState, action) {
      if (!action) {
        throw new Error("MiniRDXError: Action is required to run a reducer");
      }

      return actions.has(action.type)
        ? actions.get(action.type)(
            state,
            ...(Array.isArray(action.payload)
              ? action.payload
              : [action.payload])
          )
        : state;
    };
  };

  return api;
}

/*

  [🧩 METHOD]:
  createStore();

  [📓 DESC]:
  Creates store object that handles all action and delegates state updates to reducers.

  [⚙️ USAGE]:

  import { createStore, createReducer } from "@ludekarts/utility-belt";
  . . .

  const inistState = {
    name: "John",
  };

  const mainReducer = createReducer(initState)
    .on("change-name", (state, name) => {
      return { ...state, name };
    })
    .done();

  const store = createStore(mainReducer);

  store.subscribe(console.log); // Print out whole state.

  store.dispatch("change-name", "Annie"); // { name: "Annie" }

*/

export function createStore(reducer) {
  let state;
  let listeners = [];
  let reducers = [reducer];

  if (!reducer) {
    throw new Error(
      "MiniRDXError: The Main Reducer is required to create a store"
    );
  }

  // Provides a way to get current state value out of sibscribe callback.
  function getState() {
    return state;
  }

  // Subscribes @callback to state chabges and returns teardown/unsubscribe fn.
  function subscribe(callback) {
    !listeners.includes(callback) && listeners.push(callback);
    return function unsubscribe() {
      listeners = listeners.filter((l) => l !== callback);
    };
  }

  // Base on given @action triggers all reducers to perform state update, then notifies all listeners with new state.
  function dispatch(actionType, ...payload) {
    const action = {
      type: actionType,
      payload: payload.length ? payload : undefined,
    };
    state = dispatchCore(action, state);

    // Do not send state notifications when internal actions are dispatched.
    isExternalAction(action) &&
      listeners.forEach((listener) => listener(state, action));
  }

  // Dispatches multiple actions in given order, however only last action triggers Store update.
  dispatch.batch = function batchDispatch(...args) {
    state = args.reduce((newState, [actionType, ...payload]) => {
      const action = {
        type: actionType,
        payload: payload.length ? payload : undefined,
      };
      return dispatchCore(action, newState);
    }, state);

    listeners.forEach((listener) => listener(state, batchArgsToAction(args)));
  };

  // Core dispatch functionality.
  function dispatchCore(action, oldState) {
    // Update state.
    const finalState = reducers.reduce((newState, reducer) => {
      // Handles extendReducer logic.
      if (typeof reducer.setter === "function") {
        let intermediateState;

        // If new reducer was added try to set it's default state.
        // In case new state is undefinded use old state as a default.
        if (reducer.isNew && action.type === "extendReducer:true") {
          delete reducer.isNew;
          intermediateState = reducer(undefined, action);
          if (intermediateState === undefined) {
            intermediateState = reducer(newState, action);
          }
        } else {
          intermediateState = reducer(newState, action);
        }

        // [💡 HINT]:
        // Use fn notation when you wan to access GLOBAL state in LOCAL reducer.
        // In that case you also need to return a full global state.
        if (typeof intermediateState === "function") {
          return intermediateState(newState);
        } else {
          reducer.setter(newState, intermediateState);
          return newState;
        }
      } else {
        return reducer(newState, action);
      }
    }, oldState);

    return finalState;
  }

  /*

    [🧩 METHOD]:
    extendReducer();

    [📓 DESC]:
    Allows user to add reducer after "mainReducer" is defined.

    [⚙️ USAGE]:

    import { createStore, createReducer } from "@ludekarts/utility-belt";
    . . .

     const initState = {
      currentUser: 0,
      users: [],
      some: {
        deep: {
          settings: "no setting",
        },
      },
    };

    const deepState = {
      mode: "dark",
      cookies: false,
    };

    const mainReducer = createReducer(initState).done();
    const store = createStore(mainReducer);

    const deepReducer = createReducer(deepState).done();
    store.extendReducer(deepReducer,"some.deep.settings");

    console.log(store.getState());

    // {
    //   currentUser: 0,
    //   users: [],
    //   some: {
    //     deep: {
    //       settings: {     // 👈 Part of global state replaced with "deepState".
    //         mode: "dark",
    //         cookies: false,
    //       }
    //     },
    //   },
    // }

    [💡 HINT]:
    If you do not provide @initialState for "createReducer(undefined).on(....).done()" then
    reduces will connect to the part of the global state object specified by the selector.
    This way you can modify this part of global state.

  */

  function extendReducer(reducer, selector) {
    if (typeof selector === "string") {
      const { setter, getter } = createSelector(selector);
      const newReducer = (state, action) =>
        reducer(state === undefined ? undefined : getter(state), action);
      newReducer.setter = setter;
      newReducer.isNew = true;
      reducers.push(newReducer);
      dispatch("extendReducer:true");
    }

    // [⚠️ NOTE]:
    // When selector is undefined then reducer will connected to the glonal state,
    // howewer it @initialState will not override the global state.
    else if (selector === undefined) {
      reducers.push(reducer);
      dispatch("extendReducer:true");
    } else {
      throw new Error(
        "MiniRDXError: Reducer's statePath should be a string with dot notation e.g.: 'user.cars[1].name' "
      );
    }
  }

  // setupAction -> initialize reducers.
  dispatch("initialize:true");

  return { getState, subscribe, dispatch, extendReducer };
}

// ---- Helpers ----------------

export function createSelector(selector) {
  if (typeof selector === "string" && /^[\w\[\]\d\.]+$/.test(selector)) {
    return {
      getter: new Function("state", `return state.${selector}`),
      setter: new Function("state", "value", `state.${selector} = value`),
    };
  }

  throw new Error(
    "MiniRDXError: Selector should be a string with dot notation e.g.: 'user.cars[1].name' "
  );
}

function isExternalAction(action) {
  return (
    action.type !== "initialize:true" && action.type !== "extendReducer:true"
  );
}

function batchArgsToAction(args) {
  return args.reduce((acc, [type, payload]) => [...acc, { type, payload }], []);
}
