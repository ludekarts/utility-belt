/**
 * Allows for copying text to clipboard.
 *
 * @example
 * copyToClipboard("Hello, World!", document.querySelector("#someElement"));
 */
export function copyToClipboard(value: string, rootElement?: HTMLElement) {
  const container = (document.getElementById("_clipContainer_") ||
    document.createElement("textarea")) as HTMLTextAreaElement;
  const root = rootElement || document.body;

  if (!container.id) {
    container.id = "_clipContainer_";
    container.style.opacity = "0";
    container.style.position = "fixed";
    container.style.pointerEvents = "none";
    root.appendChild(container);
  }

  try {
    container.value = value;
    container.select();
    document.execCommand("copy");
    return value;
  } catch (error) {
    console.error(error);
    return;
  }
}
