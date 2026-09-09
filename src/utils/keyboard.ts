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
      preventDefault = false,
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
