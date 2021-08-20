import { importHtml, nodeListToArray, includeScriptTag, domFilter, highlight } from "./lib/utility-belt.module.js";

// Load related HTML documetation pages, and run <pre> tags transformations when all files are loaded.
importHtml(transformPreTags);

// Transform/style <pre> tags.
function transformPreTags() {
  nodeListToArray(
    document.querySelectorAll("pre"))
    .forEach((node) => {
      node.innerHTML = node.innerHTML
        .replace(/</g, "&lt;")
        .replace(/(?!=>)>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\\\\(.*?)\\\\/g, (_m, g) => `<em>${g}</em>`)
        .replace(/-\\([\s\S]*?)\\-/gm, (_m, g) => `<em class="fade">${g}</em>`);
    });
}

// Load scripts associated with currently loaded doc html file.
document.querySelector("main")
  .addEventListener("htmlLoaded", event => {
    event.target.dataset.script && includeScriptTag(event.target.dataset.script, { isModule: true });
  });