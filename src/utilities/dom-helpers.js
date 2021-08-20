// Create Element from source string.
export function elFromString(source) {
  return document.createRange().createContextualFragment(source);
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
  const element = document.createElement("style");
  if (name) {
    element.dataset.styleName = name;
  }
  document.head.appendChild(element).textContent = style;
  return element;
}
