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
