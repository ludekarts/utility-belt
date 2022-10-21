export default function createHistory(debugMode = false) {
  let pointer = -1;
  let history = [];
  let api = {};

  // Push new state into current layer.
  api.pushState = function (state) {
    pointer++;

    // Remove remaining furure states when the new state is added after undo.
    if (history.length - 1 > pointer) {
      history.splice(pointer);
    }

    history[pointer] = state;
  };

  api.undo = function () {
    // Keep undo in history min range.
    if (pointer-- < 1) {
      pointer++;
    }
    return history[pointer];
  };

  api.redo = function () {
    // Keep redo in history max range.
    if (pointer++ > history.length - 2) {
      pointer--;
    };
    return history[pointer];
  };

  api.current = function () {
    return history[pointer];
  };

  api.purge = function () {
    pointer = -1;
    history = [];
  };

  if (Boolean(debugMode)) {
    api.debug = function () {
      return {
        history,
        pointer,
      };
    }
  }

  return Object.freeze(api);
}
