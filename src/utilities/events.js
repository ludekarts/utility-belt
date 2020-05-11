// USAGE:
//
// in JS:
//
// import events from "helpers/events";
// ...
// const handlers = events(document.body, "click", "dblclick", ...);
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

export default function events(root, ...events) {

  const registerHandlers = {};

  const globalCallback = eventName => event => {
    if (event.target.dataset[eventName]) {
      const callback = registerHandlers[event.target.dataset[eventName]];
      callback && callback(event);
    }
  };

  events.forEach(eventName => {
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
