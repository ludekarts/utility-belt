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

// Inserts newNode after the old one.
export function insertNodeAfter(newNode, node) {
  const next = node.nextSibling;
  const parent = node.parentNode;
  next ? parent.insertBefore(newNode, next) : parent.appendChild(newNode);
  return newNode;
};

// Inserts newNode before the old one.
export function insertNodeBefore(newNode, node) {
  node.parentNode.insertBefore(newNode, node);
};

// Move nodes @from node @to node.
export function moveNodes(from, to) {
  while (from.childNodes.length > 0) to.appendChild(from.firstChild);
  return to;
};
