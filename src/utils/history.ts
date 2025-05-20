/**
 * Creates a history manager for undo/redo functionality.
 */

interface HistoryConfig {
  debug?: boolean;
  size?: number;
}

type HistoryApi<T> = {
  pushState: (state: T) => void;
  undo: () => T | null;
  redo: () => T | null;
  purge: () => void;
  length: () => number;
  current: () => T | null;
  pointerIndex: () => number;
  debug?: () => { history: T[]; pointer: number };
};

export function createHistory<T>(config: HistoryConfig) {
  let pointer = -1;
  let history = [] as T[];
  const api = {} as HistoryApi<T>;
  const IS_DEBUG = config.debug || false;
  const HISTORY_SIZE = config.size || 0;

  /**
   * Push a new state into the history. Removes future states if not at the end.
   * @param {*} state - The state to push.
   */
  api.pushState = function (state) {
    if (state === undefined) return; // Ignore undefined states.
    pointer++;
    if (history.length - 1 > pointer) {
      history.splice(pointer);
    }
    history[pointer] = state;
    if (HISTORY_SIZE && history.length > HISTORY_SIZE) {
      history.shift();
      pointer--;
    }
  };

  /**
   * Undo the last state change.
   * @returns {*} The previous state or null if at the beginning.
   */
  api.undo = function () {
    if (pointer <= 0) {
      pointer = 0;
      return null;
    }
    pointer = Math.max(0, pointer - 1);
    return history[pointer];
  };

  /**
   * Redo the next state change.
   * @returns {*} The next state or null if at the end.
   */
  api.redo = function () {
    if (pointer >= history.length - 1) {
      return null;
    }
    pointer = Math.min(history.length - 1, pointer + 1);
    return history[pointer];
  };

  /**
   * Get the current state.
   * @returns {*} The current state or null if history is empty.
   */
  api.current = function () {
    return pointer >= 0 ? history[pointer] : null;
  };

  /**
   * Purge all history.
   */
  api.purge = function () {
    pointer = -1;
    history = [];
  };

  /**
   * Get the number of states in history.
   * @returns {number}
   */
  api.length = function () {
    return history.length;
  };

  /**
   * Get the current pointer index.
   * @returns {number}
   */
  api.pointerIndex = function () {
    return pointer;
  };

  if (IS_DEBUG) {
    /**
     * Debug info for history.
     * @returns {{history: Array, pointer: number}}
     */
    api.debug = function () {
      return {
        history: [...history],
        pointer,
      };
    };
  }

  return Object.freeze(api);
}
