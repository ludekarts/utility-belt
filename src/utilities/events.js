// DESC:
//
// Creates an action handler that reacts to (by default on) buttons with "data-action" attibute.
// It calls proper callback fn according to the action name.
//
// USAGE:
//
// >> HTML:
// <button class="menu-item" data-action="action-name">My Action</button>
//
// >> JS:
//
// import { catchAction } from "@ludekarts/utility-belt";
// . . .
//
// document.querySelector("#menu-bar").onclick = catchAction("button.menu-item")
//  .addAction("action-name", ({action, event, dataset}) => {})
//  .addAction("action-name-2", ({action, event, dataset}) => {})
//  .addDefaultAction(({action, event, dataset}) => {/* Callback runs only if no other action matches */})
//  .done(({action, event, dataset}) => {/* Callback runs on each interaction with matching selector */});
//

export function catchAction(selector = "button[data-action]") {
  let actions = new Map();
  let defaultAction;

  const api = Object.freeze({
    addAction(name, callback) {
      if (!actions.has(name)) {
        actions.set(name, callback);
      } else {
        throw new Erron(`Action "${name}" already exist.`);
      }
      return api;
    },

    addDefaultAction(callback) {
      defaultAction = callback;
      return api;
    },

    done(doneCallback) {
      return (event) => {
        if (event.target.matches(selector)) {
          const { action } = event.target.dataset;
          const fn = actions.get(action);
          const actionObject = { action, event, dataset: event.target.dataset };
          typeof fn === "function"
            ? fn(actionObject)
            : defaultAction
            ? defaultAction(actionObject)
            : undefined;
          typeof doneCallback === "function" && doneCallback(actionObject);
        }
      };
    },
  });

  return api;
}

// DESC:
//
// Creates handlers for keyboard events.
// It recognizes keyboard key by "event.code" value, so pressing "Z" key should be setup by set "KeyZ" as key.
//
// USAGE:
//
// import { keyboard } from "@ludekarts/utility-belt";
// . . .
//
// document.querySelector("input").onkeydown = keyboard(onlyMyInput)
//    .key("Ctrl+Z", customUndo, true)                        // String notation.
//    .key({ key: "Z", shift: true, ctrl: true }, clearInput) // Object notation.
//    .done();
//
// function onlyMyInput(event) {
//    return evnet.target.id = "my-input";
// }
//
// function customUndo(event) {
//    event.preventDefault();
//    . . .
// }
//
// function clearInput(event) {
//    event.preventDefault();
//    event.target.value = "";
// }
//
// NOTE:
//
// Key signature: Key+Shift+Ctrl+Alt e.g.:
//    Enter key          --> "Enter"
//    Enter + Shift key  --> "Enter+Shift"
//    Special key + key  --> "Shift+Ctrl+W" === "Shift+Ctrl+KeyW" === "W+Shift+Ctrl"
//
export function keyboard(filterFn) {
  let keyCombos = new Map();

  function executeEventCallback(keyHash, event) {
    if (keyCombos.has(keyHash)) {
      const [callback, preventDefault] = keyCombos.get(keyHash);
      preventDefault && event.preventDefault();
      callback(event);
    }
  }

  const api = Object.freeze({
    key(config, callback, preventDefault = false) {
      const keyHash = parseConfig(config);
      keyCombos.set(keyHash, [callback, preventDefault]);
      return api;
    },

    done(defaultCallback) {
      return (event) => {
        const keyHash = parseConfig({
          key: event.code,
          alt: event.altKey,
          ctrl: event.ctrlKey,
          meta: event.metaKey,
          shift: event.shiftKey,
        });

        if (filterFn) {
          if (filterFn(event)) {
            executeEventCallback(keyHash, event);
            defaultCallback?.(event);
          }
        } else {
          executeEventCallback(keyHash, event);
          defaultCallback?.(event);
        }
      };
    },
  });

  return api;
}

export function parseConfig(config) {
  let keyHash;

  if (typeof config === "string") {
    const keys = config.split("+");
    const key = keys
      .filter(notActionKey)
      .map((key) => (/^\w$/.test(key) ? `Key${key}` : key));
    if (key.length > 1) {
      throw new Error("KeyboardHelperError: Too many keys in config");
    }
    keyHash =
      key[0] +
      (keys.includes("Shift") ? "+Shift" : "") +
      (keys.includes("Ctrl") ? "+Ctrl" : "") +
      (keys.includes("Alt") ? "+Alt" : "") +
      (keys.includes("Meta") ? "+Meta" : "");
  } else if (typeof config === "object") {
    const { shift, ctrl, alt, meta, key } = config;
    keyHash =
      key +
      (Boolean(shift) ? "+Shift" : "") +
      (Boolean(ctrl) ? "+Ctrl" : "") +
      (Boolean(alt) ? "+Alt" : "") +
      (Boolean(meta) ? "+Meta" : "");
  } else {
    throw new Error("KeyboardHelperError: Invalid event config");
  }

  return keyHash;
}

function notActionKey(key) {
  return key !== "Shift" && key !== "Ctrl" && key !== "Alt" && key !== "Meta";
}

// USAGE:
//
// in JS:
//
// import { catchEvents } from "@ludekarts/utility-belt";
// ...
// const handlers = catchEvents(document.body, "click", "dblclick", ...);
// ...
// handlers.add("actionAname", event => {
//   ...
// });
//
// ...
// handlers.callHandler("name", {});
//
// in HTML:
//
// <button data-click="actionAname">OK</button>

export function catchEvents(root, ...events) {
  const registerHandlers = {};

  const globalCallback = (eventName) => (event) => {
    if (event.target.dataset[eventName]) {
      const callback = registerHandlers[event.target.dataset[eventName]];
      callback && callback(event);
    }
  };

  events.forEach((eventName) => {
    root.addEventListener(eventName, globalCallback(eventName));
    // console.log(`Added ${eventName} event handler`);
  });

  const addHandler = (handlerName, callback) => {
    if (!registerHandlers[handlerName]) {
      registerHandlers[handlerName] = callback;
    }
  };

  const runRegisterHandler = (name, event) => {
    registerHandlers[name](event);
  };

  return Object.freeze({
    add: addHandler,
    callHandler: runRegisterHandler,
  });
}

// Create EventListener with destroy function at return statement.
export function createEventHandler(
  element,
  eventName,
  callback,
  useCapture = false
) {
  element.addEventListener(eventName, callback, useCapture);
  return () => element.removeEventListener(eventName, callback, useCapture);
}
