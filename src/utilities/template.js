import { uid, nodeListToArray } from "./index.js";

export default function template(strings, ...inserts) {

  if (!Array.isArray(strings) || !strings.raw) {
    throw new Error("template helper should be called as tagged template string rather than function");
  }

  const externalElements = {};
  const html = strings.reduce((acc, string, index) => {
    let entry;
    let currentInsert = inserts[index];

    // Convert NodeList into Array of Nodes.
    if (currentInsert instanceof NodeList) {
      currentInsert = nodeListToArray(currentInsert);
    }

    // Insert HTMLElement or array of elements.
    if (currentInsert instanceof HTMLElement || Array.isArray(currentInsert)) {
      const id = uid();
      externalElements[id] = currentInsert;
      entry = `<i id="${id}" class="_hook_"></i>`;
    } else if (typeof currentInsert === "string" || typeof currentInsert === "number") {
      entry = currentInsert;
    }

    // Allow entrirs to be also strings and numbers.
    if (typeof entry === "string" || typeof entry === "number") {
      return acc += (string + entry);
    } else {
      return acc += string;
    }
  }, "");

  const wrapper = document.createElement("div");
  wrapper.insertAdjacentHTML("beforeend", html);

  // Get node references. This will skip the insert nodes since they alreay have external referenes.
  const refs = nodeListToArray(wrapper.querySelectorAll("[ref]"))
    .reduce((acc, ref) => {
      acc[ref.getAttribute("ref")] = ref;
      ref.removeAttribute("ref");
      return acc;
    },
  {});

  // Replace inserts hooks.
  nodeListToArray(wrapper.querySelectorAll("i._hook_"))
    .forEach(hook => {
      const insert = externalElements[hook.id];
      const parent = hook.parentNode;
      if (Array.isArray(insert)) {
        insert.forEach(item => {
          if (item instanceof HTMLElement) {
            parent.insertBefore(item, hook);
          }
        })
        hook.remove();
      } else {
        parent.replaceChild(insert, hook);
      }
    });

  const element = wrapper.children.length === 1
    ? wrapper.children[0]
    : wrapper;

  return refs.length ? [element, refs] : element;
}
