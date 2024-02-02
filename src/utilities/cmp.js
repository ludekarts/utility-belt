import { dynamicElement } from "./template.js";


export function cmp(componentFn) {

  let element;
  let restArgs;
  let prevState;
  let onEffectHandler;
  let removeEffectHandler;
  let renderFn = componentFn({
    getState: () => prevState,
    getRefs: () => element?.d?.refs,
    effect: callback => onEffectHandler = callback,
  });

  let render = (state, ...rest) => {

    if (rest.length > 0) {
      restArgs = rest;
    }

    // Create new dynamic element.
    if (!element) {
      prevState = state;
      element = dynamicElement(renderFn, state, ...restArgs);
      removeEffectHandler = onEffectHandler(element, element.d.refs);
    }

    // Re-render with previouse State.
    else if (state === undefined) {
      element.d.update(prevState, ...restArgs);
    }

    // Update only when State changes.
    else if (prevState !== state) {
      prevState = state;
      element.d.update(state, ...restArgs);
    }

    return element;
  };

  render.unmount = () => {
    removeEffectHandler?.();
    element.remove();
    element = undefined;
    restArgs = undefined;
    prevState = undefined;
  };

  render.trash = () => {
    render.unmount();
    render = undefined;
    renderFn = undefined;
    onEffectHandler = undefined;
    removeEffectHandler = undefined;
  }

  return render;
}

