// Copy arributes 'from' one element 'to' another.
export function copyAttrs(from, to, excluded = []) {
  Array.from(from.attributes || []).forEach(attr => !~excluded.indexOf(attr.name) && to.setAttribute(attr.name, attr.value));
}

// Exracts childNodes from @node. Removes @node at the end.
export function extractNodes(node) {
  if (node.childNodes.length === 0) return node.remove();
  node.parentNode.insertBefore(node.firstChild, node);
  extractNodes(node);
};

// Move nodes @from node @to node.
export function moveNodes(from, to) {
  while (from.childNodes.length > 0) to.appendChild(from.firstChild);
  return to;
};
