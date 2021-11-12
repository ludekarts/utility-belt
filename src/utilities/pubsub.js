export default function PubSub(config) {
  const namespaces = new Map();
  const debugMode = config && config.debug === true;
  const logger = typeof config.logger === "function" ? config.logger : undefined;

  // Default namespace.
  namespaces.set("/", new Map());

  const API = Object.freeze({
    on(n, e, o) {

      const { namespace, event, observer } = getParams(n, e, o);

      if (!namespaces.has(namespace)) {
        namespaces.set(namespace, new Map());
      }

      const currentNamespace = namespaces.get(namespace);

      if (!currentNamespace.has(event)) {
        currentNamespace.set(event, []);
      }

      currentNamespace.get(event).push(observer);

      if (debugMode && logger) {
        logger(`A new subscription "${event}" was added to namespace "${namespace}".`);
      }

      return API;
    },

    off(n, e, o) {
      const { namespace, event, observer } = getParams(n, e, o);

      if (namespaces.has(namespace)) {
        const currentNamespace = namespaces.get(namespace);
        if (currentNamespace.has(event)) {
          const observersList = currentNamespace.get(event);
          const index = observersList.indexOf(observer);
          if (~index) {
            observersList.splice(index, 1);
            if (observersList.length) {
              currentNamespace.set(event, observersList);
            } else {
              currentNamespace.delete(event);
              if (currentNamespace.size === 0 && namespace !== "/") {
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
        if (currentNamespace.has(event)) {
          const observersList = currentNamespace.get(event);
          const length = observersList.length;
          for (let i = 0; i < length; i++) {
            observersList[i](message, event);
          }

          if (debugMode && logger) {
            logger("published", { namespace, event, message, observersList });
          }
        } else if (debugMode) {
          console.warn(`Event "${event}" does not exist in "${namespace}" namespace.`);
        }
      }

      return API;
    },

    getNamespace(namespace, purge = false) {
      if (!debugMode) return;
      if (purge) {
        namespace !== "/" && // This condition need to be here to not exit purge IF in case of "/".
          namespaces.delete(namespace);
        return namespaces;
      }
      return namespace ? namespaces.get(namespace) : namespaces;
    }

  });

  // ---- Public API ----------------

  return API;
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