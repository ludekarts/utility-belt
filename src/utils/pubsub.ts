type ObserverCallback = (payload: any, eventName: string) => void;
type PubSubNamespace = {
  observers: Map<string, ObserverCallback[]>;
  broadcasters: ObserverCallback[];
};

type LoggerEvent = {
  data?: any;
  type: string;
  message: string;
};

type PubSubAPI = {
  on(n: string, e: string, o: ObserverCallback): PubSubAPI;
  off(n: string, e: string, o: ObserverCallback): PubSubAPI;
  emmit(n: string, e: string, p: any): PubSubAPI;
  __namespace(
    namespace: string,
    options?: { remove: boolean }
  ): Map<string, PubSubNamespace> | PubSubNamespace | undefined;
};

export function PubSub(logger?: (event: LoggerEvent) => void) {
  const namespaces = new Map<string, PubSubNamespace>();

  // Default namespace.
  namespaces.set("/", {
    observers: new Map<string, ObserverCallback[]>(),
    broadcasters: [] as ObserverCallback[],
  });

  const API: PubSubAPI = {
    on(n: string, e: string, o: ObserverCallback) {
      const { namespace, event, observer } = getParams(n, e, o);

      if (!namespaces.has(namespace)) {
        namespaces.set(namespace, {
          observers: new Map(),
          broadcasters: [],
        });
      }

      const currentNamespace = namespaces.get(namespace)!;

      // Any event (a.k.a broadcaster).
      if (event === "*") {
        !currentNamespace.broadcasters.includes(observer) &&
          currentNamespace.broadcasters.push(observer);
      }
      // Specific event (a.k.a observers).
      else {
        if (!currentNamespace.observers.has(event)) {
          currentNamespace.observers.set(event, []);
        }
        currentNamespace.observers.get(event)!.push(observer);
      }

      logger?.({
        type: "SUBSCRIBE",
        message: `New observer was subscribed to "${event}" event in "${namespace}" namespace.`,
        data: { namespace, event, observer },
      });
      return API;
    },

    off(n: string, e: string, o: ObserverCallback) {
      const { namespace, event, observer } = getParams(n, e, o);

      if (namespaces.has(namespace)) {
        const currentNamespace = namespaces.get(namespace)!;

        if (currentNamespace.observers.has(event)) {
          const observersList = currentNamespace.observers.get(event)!;
          const index = observersList.indexOf(observer);

          if (~index) {
            observersList.splice(index, 1);

            if (observersList.length) {
              currentNamespace.observers.set(event, observersList);
            } else {
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

    emmit(n: string, e: string, p: any) {
      const { namespace, event, payload } = getPublishParams(n, e, p);

      if (namespaces.has(namespace)) {
        const currentNamespace = namespaces.get(namespace)!;

        currentNamespace.broadcasters.length &&
          currentNamespace.broadcasters.forEach((broadcaster) =>
            broadcaster(payload, event)
          );

        if (currentNamespace.observers.has(event)) {
          const observersList = currentNamespace.observers.get(event)!;
          const length = observersList.length;

          for (let i = 0; i < length; i++) {
            observersList[i](payload, event);
          }

          logger?.({
            type: "EMMIT",
            message: `Event "${event}" was emmited in "${namespace}" namespace.`,
            data: { namespace, event, payload, observersList },
          });
        } else {
          logger?.({
            type: "ERROR",
            message: `Event "${event}" does not exist in "${namespace}" namespace.`,
            data: { namespace, event, payload },
          });
        }
      }

      return API;
    },

    // Use only for testing.
    __namespace(namespace: string, options: { remove: boolean }) {
      const { remove = false } = options || {};
      if (remove === true) {
        namespace !== "/" && namespaces.delete(namespace);
        return namespaces;
      }
      return namespace ? namespaces.get(namespace) : namespaces;
    },
  };

  // ---- Public API ----------------

  return Object.freeze(API);
}

// ---- Helpers ---------------------

function getParams(n: string, e: string, o: ObserverCallback) {
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
    throw new Error("PubSubError: namespace should be a string");
  }

  if (typeof event !== "string") {
    throw new Error("PubSubError: subscribe event should be a string");
  }

  if (typeof observer !== "function") {
    throw new Error("PubSubError: the observer should be a function");
  }

  return { namespace, event, observer };
}

function getPublishParams(n: string, e: string, p: any) {
  let namespace;
  let event;
  let payload;

  if (p === undefined) {
    // Set default namespace.
    namespace = "/";
    event = n;
    payload = e;
  } else {
    // Set custom namespace.
    namespace = n;
    event = e;
    payload = p;
  }

  return { namespace, event, payload };
}
