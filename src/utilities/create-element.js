// Create DOM elements from CSS-like syntax.
export default function createElement(phrase, content) {

  // Filter attributes.
  let attrs = phrase.match(/[\w-:]+=".+?"/g);

  if (attrs) {
    attrs = attrs.map(match => splitStringAt(match.replace(/"/g, ""), match.indexOf("=")));
  }

  // Filter id, type & classes.
  let head = ~phrase.indexOf("[") ? phrase.slice(0, phrase.indexOf("[")) : phrase;
  let id, classes = ~head.indexOf(".") ? head.split(".") : [head], type = classes[0];

  // Separate classes.
  if (classes.length > 0) {
    classes = classes.slice(1, classes.length).join(" ");
  }

  if (~type.indexOf("#")) {
    [type, id] = type.split("#");
  }

  // Create element.
  const element = document.createElement(type);

  // Append id.
  if (id) {
    element.id = id;
  }

  // Append content.
  if (content) {
    if (typeof content === "string") {
      element.innerHTML = content;
    }
    else if (content instanceof HTMLElement) {
      element.append(content);
    }

    else if (content instanceof DocumentFragment) {
      element.append(content);
    }
  }

  // Append attributes.
  if (attrs) {
    attrs.forEach(attribute => element.setAttribute(attribute[0], attribute[1]));
  }

  // Append classes.
  if (classes) {
    element.className = classes;
  }

  return element;
};


function splitStringAt(value, index) {
  return [value.substring(0, index), value.substring(index + 1)];
}