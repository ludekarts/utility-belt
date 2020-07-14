// Inject SCRIPT tag into webpage.
export default function includeScriptTag(path, config = {}) {
  const { isModule, onComplete } = config;
  const script = document.createElement("script");
  script.setAttribute("type", isModule ? "module" : "text/javascript");

  onComplete &&
    script.addEventListener("load", onLoadHandler);

  function onLoadHandler() {
    script.removeEventListener("load", onLoadHandler);
    onComplete();
  }

  script.setAttribute("src", path);
  document.head.appendChild(script);
};