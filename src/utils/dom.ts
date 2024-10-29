/**
 * Create a DOM element from string. Or Fragment if there are multiple elements.
 *
 * @example
 *
 * const element = createElement('<div>Hello World</div>');
 *
 */
export function fragment(source: string, domWrapper: string | undefined) {
  const fragment = document.createRange().createContextualFragment(source);

  if (typeof domWrapper === "undefined") {
    if (fragment.childElementCount === 1) {
      return fragment.firstElementChild;
    }
    return fragment;
  } else if (typeof domWrapper === "string") {
    const wrapper = document.createElement(domWrapper);
    wrapper.append(fragment);
    return wrapper;
  } else {
    throw new Error("FragmentError: domWrapper must be a string or undefined");
  }
}

/**
 * Collect all parentNode elments begin from given 'node' and end on 'stopSelector'
 *
 * @example
 *
 * const path = getNodesPath('.stop-selector');
 *
 */
export function getNodesPath(stopSelector: string) {
  if (!stopSelector)
    throw new Error("getNodesPath error: stopSelector is required");
  const getPath = (node: HTMLElement, path = [node]) => {
    if (!(node.parentNode as HTMLElement)?.matches(stopSelector)) {
      path.push(node.parentNode as HTMLElement);
      return getPath(node.parentNode as HTMLElement, path);
    }
    return path;
  };
  return getPath;
}

/**
 * Add styles tag into <head/> element. When the "name" is the same, the styles will be appended.
 *
 * @example
 *
 * attachStyle("body { background: red; }", "my-style");
 *
 */
export function attachStyle(style: string, name: string) {
  const element: HTMLStyleElement =
    document.querySelector(`style[data-style-name="${name}"]`) ||
    document.createElement("style");

  if (name) {
    element.dataset.styleName = name;
  }

  document.head.appendChild(element).textContent += style;
  return element;
}
