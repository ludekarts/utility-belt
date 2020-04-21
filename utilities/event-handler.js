// Create EventListener with destroy function at return statement.
export default function createEventHandler(element, eventName, callback, useCapture = false) {
  element.addEventListener(eventName, callback, useCapture);
  return () => element.removeEventListener(eventName, callback, useCapture);
};