// Create Element from source string.
export function fragment(source, domWrapper) {
  const fragment = document.createRange().createContextualFragment(source);

  if (domWrapper === "-f") {
    return fragment;
  }

  const wrapper = typeof domWrapper === "string" && document.createElement(domWrapper);

  if (fragment.childElementCount === 1) {
    if (wrapper) {
      wrapper.append(fragment.firstElementChild);
      return wrapper;
    }
    return fragment.firstElementChild;
  }

  else {
    if (wrapper) {
      wrapper.append(fragment);
      return wrapper;
    }
    else {
      const tmp = document.createElement("div");
      tmp.append(fragment);
      return tmp;
    }
  }
}

// Collect all parentNode elments begin from given 'node' and end on 'stopSelector'
export function getNodesPath(stopSelector) {
  if (!stopSelector) throw new Error("getNodesPath error: stopSelector is required");
  const getPath = (node, path = [node]) => {
    if (!node.parentNode.matches(stopSelector)) {
      path.push(node.parentNode);
      return getPath(node.parentNode, path);
    }
    return path;
  };
  return getPath;
}

// Adds styles tag into <head/> element.
export function attachStyle(style, name) {
  let element;
  element = name && document.querySelector(`style[data-style-name="${name}"]`);
  element = element ? element : document.createElement("style");

  if (name) {
    element.dataset.styleName = name;
  }

  document.head.appendChild(element).textContent += style;
  return element;
}
