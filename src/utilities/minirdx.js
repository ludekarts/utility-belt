import PubSub from "./pubsub.js";

// Inspired by Redux, a mini library for managing global state.
// by @ludekarts 02.2022

/*

  [📓 DESC]:
  Creates reducer with chaining API instead go switch staments.

  [💡 HINT]:
  When used with "addReducer" or "defineReducer" providing @initailState will override
  property pointed by the selector with given initialState.
  If you want to preserve existing state object structure DO NOT pass any initialState to the creator.

  [⚙️ USAGE]:

  import { createReducer } from "minirdx";
  . . .

  const inistState = {
    name: "John",
  };

  const myReducer = createReducer(inistState)
    .on("change-name", (state, action) => ({ ..state, name: action.payload }))
    .on("add-age", (state, action) => ({ ..state, age: action.payload }))
    .done();

*/

export function createReducer(initState) {
  const api = {};
  const actions = new Map();

  api.on = (action, reducer) => {
    if (actions.has(action)) {
      throw new Error(`Action name "${action}" already exist`);
    }

    if (typeof action !== "string") {
      throw new Error(`Action name should be a string`);
    }

    if (typeof reducer !== "function") {
      throw new Error(`Action reducer should be a function`);
    }

    actions.set(action, reducer);
    return api;
  };

  api.done = function () {
    return function reducer(state = initState, action, globalState) {

      if (!action) {
        throw new Error("Action is required to run a reducer");
      }

      return actions.has(action.type)
        ? globalState
          ? actions.get(action.type)(state, action, globalState)
          : actions.get(action.type)(state, action)
        : state;
    }
  }

  return api;
}


/*

  [📓 DESC]:
  Creates store object that handles all action and data.

  [⚙️ USAGE]:

  import { createStore, createReducer, action } from "minirdx";
  . . .


  const inistState = {
    name: "John",
  };

  const mainReducer = createReducer(initState)
    .on("change-name", (state, action) => ({ ..state, name: action.payload }))
    .done();

  const store = createStore(mainReducer);

  store.subscribe(console.log); // Print out whole state.

  store.dispatch(action("change-name", "Annie"));

  // Alternatively without action helper.
  store.dispatch("change-name", "Annie");

*/

export function createStore(reducer) {
  let state;
  let listeners = [];
  let reducers = [reducer];
  let actionListeners = PubSub();

  if (!reducer) {
    throw new Error("MiniRDXError: The Main Reducer is required to create a store");
  }

  // Provides a way to get current state value out of sibscribe callback.
  function getState() {
    return state;
  }

  // Subscribes @callback to state chabges and returns teardown/unsubscribe fn.
  function subscribe(callback) {
    !listeners.includes(callback) && listeners.push(callback);
    return function unsubscribe() {
      listeners = listeners.filter(l => l !== callback);
    }
  }



  // Base on given @action triggers all reducers to perform state update, then notifies all listeners with new state.
  function dispatch(actionType, payload) {

    const action = isActionObject(actionType) ? actionType : { type: actionType, payload };
    state = dispatchCore(action, state);

    // Do not send state notifications when internal actions are dispatched.
    isExternalAction(action) &&
      listeners.forEach(listener => listener(state));
  }


  // Dispatches multiple actions in given order, however only last action triggers Store update.
  dispatch.batch = function batchDispatch(...args) {

    state = args.reduce((newState, [actionType, payload]) => {
      const action = isActionObject(actionType) ? actionType : { type: actionType, payload };
      return dispatchCore(action, newState);
    }, state);

    listeners.forEach(listener => listener(state));
  }


  // Core dispatch functionality.
  function dispatchCore(action, oldState) {

    // Update state.
    const finalState = reducers.reduce((newState, reducer) => {
      // Handles defineReducer logic.
      if (typeof reducer.setter === "function") {
        const intermediateState = reducer(newState, action);

        // When you wan to update global state from local reducer.
        if (typeof intermediateState === "function") {
          return intermediateState(newState);
        }

        else {
          reducer.setter(newState, intermediateState);
          return newState;
        }
      }
      return reducer(newState, action);
    }, oldState);

    // PubSub on update notification.
    // ⚠️ NOTICE: ⚠️
    // This event is async and can't be used to sync actions. It exist only for notification purpose.
    setTimeout(() => {
      actionListeners.dispatch(action.type, {
        state: finalState,
        action: action.type,
        payload: action.payload,
      });
    }, 0);

    return finalState;
  }


  /*

    [📓 DESC]:
    Allows user to add reducer after "mainReducer" is defined.
    Works same as "addReducer" but in this case you need to add  manually.

    [⚙️ USAGE]:

    import { createStore, createReducer } from "minirdx";
    . . .

     const initState = {
      currentUser: 0,
      users: [],
      some: {
        deep: {
          settings: "no settings",
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

    store.defineReducer(
      deepReducer,                                          // Reducer.
      (state) => state.some.deep.settings,                  // Getter.
      (state, value) => state.some.deep.settings = value,   // Setter.
    );

    [💡 HINT]:
    Method "defineReducer" could be used when the preformance might be an issue.
    - PROS: Better perfomance than "addReducer".Allows for more complicated state queries like nested arrays e.g.: state => state.list[2][3].name;
    - CONS: Requires to manualy supply getter() and setter() fns.

    [💡 HINT]:
    Remmember that when defining new reducer you may want to initialize it with an initial state.
    However keep in mind that if global state already have an instance under where your reducer's getter() points,
    then the initial state WILL NOT be applied. You may still update the state after an action is dispatched but
    the state pushed to your defined reducer will be one from global state e.g.

    const initState = {
      hello: "world",
      some: {
        deep: {
          value: "🦖",
        },
      },
    };

    const foodState = {
      food: "🍌",
    };

    const mainReducer = createReducer(initState).done();
    const store = createStore(mainReducer);
    const deepReducer = createReducer(foodState)
      .on("add-food", (state, action) => {
        state.food = action.payload;
        return state;
      })
      .done();

    const getter = (state) => state.some;
    const setter = (state, value) => state.some = value;

    store.defineReducer(deepReducer, getter, setter);
    console.log(store.getState());

    // >>
    // {
    //   hello: "world",
    //   some: {
    //     deep: {
    //       value: "🦖"
    //     }
    // }

    store.dispatch(action("add-food", "🍇"));
    console.log(store.getState());

    // >>
    // {
    //   hello: "world",
    //   some: {
    //     deep: {
    //       value: "🦖"
    //     },
    //     food: "🍇"
    // }


    [💡 HINT]:
    Working with multiple defined reducers remmember to keep in mind what part of the global state you're modifying.
    It is very easy to override some state high up in the tree for example in one value just by returning this value
    from the reducer e.g.:

    const globalState = {
      hello: "world",
      some: {
        deep: {
          value: "🦖"
        }
      }
    }

    . . .

    const getter = (state) => state.some;
    const setter = (state, value) => state.some = value;

    const deepReducer = createReducer()
      .on("update", (state, action) => "👾") // 👈 ❌ Part of the state this reducer is handling will be replaced by the invader.
      .done();

    store.defineReducer(deepReducer, getter, setter);
    store.dispatch(action("update"));

    console.log(store.getState());

    // >>
    // {
    //   hello: "world",
    //   some: "👾"
    // }

  */

  function defineReducer(reducer, getter, setter) {
    const definedReducer = (state, action) => reducer(getter(state), action, state);
    definedReducer.setter = setter;
    reducers.push(definedReducer);
    dispatch("defineReducer:true");
  }


  // Tap to dispatch call and action
  function on(actionName, callback) {
    actionListeners.on(actionName, callback);
    return function destroy() {
      actionListeners.off(actionName, callback);
    }
  }

  // setupAction -> initialize reducers.
  dispatch("initialize:true");

  return { getState, subscribe, dispatch, defineReducer, on };
}


// ---- Helpers ----------------

function isActionObject(object) {
  return typeof object === "object" && object.hasOwnProperty("type") && object.hasOwnProperty("payload");
}

function isExternalAction(action) {
  return action.type !== "initialize:true" && action.type !== "defineReducer:true";
}


// USAGE:
/*
  import { createSelector } from "minirdx";
  . . .

  const state = {
    settings: {
      cookies: true
    }
  };

  . . .

  const { getter, setter } = createSelector("settings.cookies");
  store.defineReducer(reducer, getter, setter);

*/

export function createSelector(selector) {
  const parts = selector.split(".");

  const getter = state =>
    parts.reduce((acc, part) => /\w+\[\d+\]/.test(part)
      ? getArrayProp(acc, part)
      : acc[part],
      state);

  const setter = (state, value) => {
    const lastElement = parts.length - 1;
    parts.reduce((acc, part, index) => {
      if (index === lastElement) {
        if (/\w+\[\d+\]/.test(part)) {
          setArrayProp(acc, part, value);
        } else {
          acc[part] = value;
        }
      }
      return /\w+\[\d+\]/.test(part)
        ? getArrayProp(acc, part)
        : acc[part];
    }, state);
  };

  return { getter, setter };
}

function getArrayProp(source, prop) {
  const bracketIndex = prop.indexOf("[");
  const name = prop.slice(0, bracketIndex);
  const index = Number(prop.slice(bracketIndex + 1, prop.length - 1));
  return source[name][index];
}

function setArrayProp(source, prop, value) {
  const bracketIndex = prop.indexOf("[");
  const name = prop.slice(0, bracketIndex);
  const index = Number(prop.slice(bracketIndex + 1, prop.length - 1));
  source[name][index] = value;
}

/*

  [📓 DESC]:
  Action Creator - creates action object in standardize format.

  [⚙️ USAGE]:

  import { action } from "minirdx";
  . . .

  store.dispatch(action("change-name", "Annie"));

*/

export const action = (type, payload) => ({ type, payload });

