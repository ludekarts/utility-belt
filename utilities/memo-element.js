// Toggles given @klass on given @newElement removing its from the previouse one.
// USAGE:
// const avtivate = memoElement(htmlElement, "avtive");
// ...
// avtivate(newHtmlElement);
//
export default function memoElement(currentElement, klass, toggle = false) {
  currentElement && currentElement.classList.add(klass);
  return newElement => {
    if (toggle && currentElement && currentElement === newElement) {
      currentElement.classList.toggle(klass);
    } else {
      currentElement && currentElement.classList.remove(klass);
      newElement && newElement.classList.add(klass);
      // eslint-disable-next-line no-param-reassign
      currentElement = newElement;
    }
    return currentElement;
  };
}
