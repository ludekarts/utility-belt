/**
 *
 * Creates action handler that reacts to "data-utb-action" attibute.
 * It calls proper callback fn according to the action name.
 *
 * @example
 *
 * HTML:
 * <button class="menu-item" data-utb-action="action-name">My Action</button>
 *
 * JS:
 * document.querySelector("#menu-bar").onclick = catchAction()
 *  .addAction("action-name", ({action, event, dataset}) => {})
 *  .addAction("action-name-2", ({action, event, dataset}) => {})
 *  .addDefaultAction(({action, event, dataset}) => {})           // Callback runs only if no other action matches.
 *  .done(({action, event, dataset}) => {});                      // Callback runs on each interaction with matching selector.
 *
 */

type Action = {
  event: Event;
  action: string;
  dataset: DOMStringMap;
};

type ActionCallback = (action: Action) => void;

export function catchAction() {
  const selector = "*[data-utb-action]";
  let actions = new Map();
  let defaultAction: ActionCallback;

  const api = Object.freeze({
    addAction(name: string, callback: ActionCallback) {
      if (!actions.has(name)) {
        actions.set(name, callback);
      } else {
        throw new Error(`Action "${name}" already exist.`);
      }
      return api;
    },

    addDefaultAction(callback: ActionCallback) {
      defaultAction = callback;
      return api;
    },

    done(doneCallback: ActionCallback) {
      return (event: MouseEvent) => {
        const target = event.target as HTMLElement;

        if (target.matches(selector)) {
          const action = target.dataset.utbAction!;
          const fn = actions.get(action);
          const actionObject: Action = {
            event,
            action,
            dataset: target.dataset,
          };
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

/**
 * Creates handlers for keyboard events. It recognizes keyboard key by "event.code" value.
 * So for example pressing "Z" key should be setup by useing "KeyZ" string as a key.
 *
 * @example
 *
 * document.querySelector("input").onkeydown = keyboard(onlyMyInput)
 *   .key("Ctrl+Z", customUndo, true)                        // String notation.
 *   .key({ key: "Z", shift: true, ctrl: true }, clearInput) // Object notation.
 *   .done();
 *
 * function onlyMyInput(event) {
 *  return evnet.target.id = "my-input";
 * }
 *
 * function customUndo(event) {
 *  event.preventDefault();
 *  ...
 * }
 *
 * function clearInput(event) {
 *  event.preventDefault();
 *  event.target.value = "";
 * }
 *
 * NOTE:
 *
 * Key signature: Key+Shift+Ctrl+Alt e.g.:
 *    Enter key          --> "Enter"
 *    Enter + Shift key  --> "Enter+Shift"
 *    Special key + key  --> "Shift+Ctrl+W" === "Shift+Ctrl+KeyW" === "W+Shift+Ctrl"
 *
 */

type KeyConfig =
  | string
  | {
      key: string;
      shift?: boolean;
      ctrl?: boolean;
      alt?: boolean;
      meta?: boolean;
    };

export function keyboard(filterFn?: (event: KeyboardEvent) => boolean) {
  let keyCombos = new Map();

  function executeEventCallback(keyHash: string, event: KeyboardEvent) {
    if (keyCombos.has(keyHash)) {
      const [callback, preventDefault] = keyCombos.get(keyHash);
      preventDefault && event.preventDefault();
      callback(event);
    }
  }

  const api = Object.freeze({
    key(
      config: KeyConfig,
      callback: (event: KeyboardEvent) => void,
      preventDefault = false
    ) {
      const keyHash = parseConfig(config);
      keyCombos.set(keyHash, [callback, preventDefault]);
      return api;
    },

    done(defaultCallback: (event: KeyboardEvent) => void) {
      return (event: KeyboardEvent) => {
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

export function parseConfig(config: KeyConfig): string {
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

function notActionKey(key: string) {
  return key !== "Shift" && key !== "Ctrl" && key !== "Alt" && key !== "Meta";
}

/**
 * Allows to catch events on the given root element and register handlers for specific actions.
 *
 * @example
 *
 * JS:
 *
 * // Attach click and double click event handlers to the document body.
 * const handlers = catchEvents(document.body, "click", "dblclick", ...);
 * ...
 *
 * // Registering handlers for give actions.
 * handlers.add("actionAname", event => {...});
 * handlers.add("dbClickAction", event => {...});
 * ...
 *
 * // Imperative handler call
 * handlers.callHandler("actionAname");
 *
 * HTML:
 * <button data-click="clickAction">OK</button>
 * <button data-dblclick="dbClickAction">OK</button>
 *
 */

export function catchEvents(root: HTMLElement, ...events: string[]) {
  const registerHandlers = new Map();

  const globalCallback = (eventName: string) => (event: Event) => {
    const target = event.target as HTMLElement;
    if (target.dataset[eventName]) {
      const callback = registerHandlers.get(target.dataset[eventName]);
      callback?.(event);
    }
  };

  events.forEach((eventName) => {
    root.addEventListener(eventName, globalCallback(eventName));
  });

  const addHandler = (
    handlerName: string,
    callback: (event: Event) => void
  ) => {
    !registerHandlers.has(handlerName) &&
      registerHandlers.set(handlerName, callback);
  };

  const runRegisterHandler = (name: String, event?: Event) => {
    registerHandlers.get(name)?.(event);
  };

  return Object.freeze({
    add: addHandler,
    callHandler: runRegisterHandler,
  });
}

/**
 * Create EventListener with destroy function at return.
 *
 * @example
 *
 * const removeHandler = createEventHandler(
 *  document.querySelector("#send"),
 *  "click",
 *  () => console.log("button clicked"),
 *  false
 * );
 *
 * removeHandler();
 *
 */

export function createEventHandler(
  element: HTMLElement,
  eventName: string,
  callback: (event: Event) => void,
  useCapture = false
) {
  element.addEventListener(eventName, callback, useCapture);
  return () => element.removeEventListener(eventName, callback, useCapture);
}
