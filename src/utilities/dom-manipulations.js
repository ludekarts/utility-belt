// Copy attributes @from one element @to another without @excluded[] names.
export function copyAttrs(from, to, excluded = []) {
  Array.from(from.attributes || []).forEach(attr => !~excluded.indexOf(attr.name) && to.setAttribute(attr.name, attr.value));
}


// Move nodes from @source node to @target node base on given options.
// USAGE:
//
// moveNodes(source, target, "--into");
//
// moveNodes(source, target, "--after --rm-source");
//
// moveNodes(source, target, "--before --rm-source");
//
export function moveNodes(source, target, options = "--into") {

  if (options.includes("--before")) {
    while (source.childNodes.length > 0) target.before(source.firstChild);
  }

  else if (options.includes("--after")) {
    while (source.childNodes.length > 0) target.after(source.firstChild);
  }

  else {
    // --into
    while (source.childNodes.length > 0) target.appendChild(source.firstChild);
  }

  if (options.includes("--rm-source")) {
    source.remove();
  }

  return target;
};