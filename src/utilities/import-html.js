// Imports HTML file and rendres its content into DOM element.
// Triggers custom "htmlLoaded" event on containder node.
//
// USAGE:
//
// JS:
// import importHtml from "./import-content";
// ...
// importHtml(() => console.log("all done"));
//
// HTML:
//
// <div data-import="./path/to/file.html"></div>

export default function importHtml(doneCallback) {
  const entry = document.querySelector("*[data-import]");
  if (!entry) return doneCallback && doneCallback();

  const importFile = entry.dataset.import;
  entry.removeAttribute("data-import");

  fetch(importFile)
    .then(response => {
      if (response.ok) return response.text();
      throw Error(`Cannot import file: ${importFile}`);
    })
    .then(html => {
      entry.innerHTML = html;
      entry.dispatchEvent(
        new CustomEvent("htmlLoaded", {
          bubbles: true,
          detail: {
            file: importFile,
          }
        })
      );
      importHtml(doneCallback);
    })
    .catch(error => {
      entry.innerHTML = `<strong style="color:red;">Cannot import module!</strong>`;
      console.error(error);
      importHtml(doneCallback);
    });
}