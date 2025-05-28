/**
 * Create a DOM element from string or Fragment if there are multiple elements.
 *
 * @example
 *
 * const div = fragment("<div>Hello World</div>");
 * const docFragment = fragment(`<p>Hello</p><p>World</p>`);
 * const section = fragment(`<p>Hello</p><p>World</p>`, `section`);
 *
 */
export function fragment(source: string, domWrapper: string | undefined) {
  if (!source) throw new Error("FragmentError: source is required");

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
 * Collect all parentNode elments begin from given "node" and end on "stopSelector"
 *
 * @example
 *
 * const path = getNodesPath(".stop-selector");
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

/**
 * Inject <script> tag into page.
 *
 * @example
 *
 * includeScriptTag("https://example.com/script.js", {
 *  isModule: true,
 *  onComplete: () => console.log("script loaded"),
 * });
 *
 */

interface IncludeScriptTagConfig {
  isModule?: boolean;
  onComplete?: () => void;
}
export function includeScriptTag(
  path: string,
  config = {} as IncludeScriptTagConfig
) {
  const { isModule, onComplete } = config;
  const script = document.createElement("script");
  script.setAttribute("type", isModule ? "module" : "text/javascript");

  onComplete && script.addEventListener("load", onLoadHandler);

  function onLoadHandler() {
    script.removeEventListener("load", onLoadHandler);
    onComplete?.();
  }

  script.setAttribute("src", path);
  document.head.appendChild(script);
}

/**
 * Imports HTML file and renders it content into DOM element, then triggers custom "htmlLoaded" event on containder node.
 *
 * @example
 *
 * JS:
 * importHtml(() => console.log("all scripts loaded"));
 *
 * HTML:
 * <div data-import="./path/to/file.html"></div>
 */

export default function importHtml(doneCallback: () => void) {
  const entry = document.querySelector("*[data-import]") as HTMLElement;
  if (!entry) return doneCallback && doneCallback();

  const importFile = entry.dataset.import as string;
  entry.removeAttribute("data-import");

  fetch(importFile)
    .then((response) => {
      if (response.ok) return response.text();
      throw Error(`Cannot import file: ${importFile}`);
    })
    .then((html) => {
      entry.innerHTML = html;
      entry.dispatchEvent(
        new CustomEvent("htmlLoaded", {
          bubbles: true,
          detail: {
            file: importFile,
          },
        })
      );
      importHtml(doneCallback);
    })
    .catch((error) => {
      entry.innerHTML = `<strong style="color:red;">Cannot import module!</strong>`;
      console.error(error);
      importHtml(doneCallback);
    });
}

/**
 * Copy attributes @from one element @to another without @excluded names.
 *
 * @example
 * copyAttrs(sourceElement, targetElement, ["style", "class"]);
 */
export function copyAttrs(from: Element, to: Element, excluded: string[] = []) {
  Array.from(from.attributes || []).forEach(
    (attr) =>
      !excluded.includes(attr.name) && to.setAttribute(attr.name, attr.value)
  );
}

/**
 * Move nodes from @source node to @target node base on given options.
 *
 * @example
 *
 * moveNodes(source, target, "--into");
 * moveNodes(source, target, "--after --rm-source");
 * moveNodes(source, target, "--before --rm-source");
 */

type MoveNodesOptions = "--into" | "--after" | "--before" | "--rm-source";

export function moveNodes(
  source: Element,
  target: Element,
  options: MoveNodesOptions = "--into"
) {
  if (!(source instanceof Element) || !(target instanceof Element)) {
    throw new Error("moveNodes error: source and target must be DOM elements");
  }

  if (options.includes("--before")) {
    while (source.childNodes.length > 0) target.before(source.firstChild!);
  } else if (options.includes("--after")) {
    while (source.childNodes.length > 0) target.after(source.firstChild!);
  } else {
    // --into
    while (source.childNodes.length > 0) target.appendChild(source.firstChild!);
  }

  if (options.includes("--rm-source")) {
    source.remove();
  }

  return target;
}
