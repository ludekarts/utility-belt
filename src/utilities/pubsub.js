export default function PubSub(config = {}) {
  const namespaces = new Map();
  const { debug = false, logger } = config

  // Default namespace.
  namespaces.set("/", {
    observers: new Map(),
    broadcasters: [],
  });

  const API = {
    on(n, e, o) {

      const { namespace, event, observer } = getParams(n, e, o);

      !namespaces.has(namespace) && namespaces.set(namespace, {
        observers: new Map(),
        broadcasters: [],
      });

      const currentNamespace = namespaces.get(namespace);

      if (event === "*") {
        !currentNamespace.broadcasters.includes(observer) && currentNamespace.broadcasters.push(observer);
      }

      else {
        !currentNamespace.observers.has(event) && currentNamespace.observers.set(event, []);
        currentNamespace.observers.get(event).push(observer);
      }

      debug && logger && logger(`A new subscription "${event}" was added to namespace "${namespace}".`);
      return API;
    },

    off(n, e, o) {
      const { namespace, event, observer } = getParams(n, e, o);

      if (namespaces.has(namespace)) {
        const currentNamespace = namespaces.get(namespace);

        if (currentNamespace.observers.has(event)) {

          const observersList = currentNamespace.observers.get(event);
          const index = observersList.indexOf(observer);

          if (~index) {
            observersList.splice(index, 1);

            if (observersList.length) {
              currentNamespace.observers.set(event, observersList);
            }

            else {
              currentNamespace.observers.delete(event);
              if (currentNamespace.observers.size === 0 && namespace !== "/") {
                namespaces.delete(namespace);
              }
            }
          }
        }
      }

      return API;
    },

    dispatch(n, e, m) {

      const { namespace, event, message } = getPublishParams(n, e, m);

      if (namespaces.has(namespace)) {
        const currentNamespace = namespaces.get(namespace);

        currentNamespace.broadcasters.length &&
          currentNamespace.broadcasters.forEach(broadcaster => broadcaster(message, event));

        if (currentNamespace.observers.has(event)) {

          const observersList = currentNamespace.observers.get(event);
          const length = observersList.length;

          for (let i = 0; i < length; i++) {
            observersList[i](message, event);
          }

          debug && logger && logger("published", { namespace, event, message, observersList });
        }

        else if (debug) {
          console.warn(`Event "${event}" does not exist in "${namespace}" namespace.`);
        }
      }

      return API;
    },

  };

  // Expose only in debug mode for testing.

  if (debug) {
    API.getNamespace = (namespace, { remove = false } = {}) => {
      if (remove === true) {
        namespace !== "/" && namespaces.delete(namespace);
        return namespaces;
      }
      return namespace ? namespaces.get(namespace) : namespaces;
    };
  }

  // ---- Public API ----------------

  return Object.freeze(API);
};


// ---- Helpers ---------------------

function getParams(n, e, o) {

  let namespace;
  let event;
  let observer;

  if (o === undefined) {
    // Set default namespace.
    namespace = "/";
    event = n;
    observer = e;
  } else {
    // Set custom namespace.
    namespace = n;
    event = e;
    observer = o;
  }

  if (typeof namespace !== "string") {
    throw new Error("PubSub Error: namespace should be a string");
  }

  if (typeof event !== "string") {
    throw new Error("PubSub Error: subscribe event should be a string");
  }

  if (typeof observer !== "function") {
    throw new Error("PubSub Error: the observer should be a function");
  }

  return { namespace, event, observer };
}

function getPublishParams(n, e, m) {
  let namespace;
  let event;
  let message;

  if (m === undefined) {
    // Set default namespace.
    namespace = "/";
    event = n;
    message = e;
  } else {
    // Set custom namespace.
    namespace = n;
    event = e;
    message = m;
  }

  return { namespace, event, message };
}