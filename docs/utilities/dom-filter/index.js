import { highlight, domFilter, fuzzySearch } from "../../lib/utility-belt.module.js";

(function () {
  let mode = "default";
  const input = document.getElementById("food-search");
  const switchMode = document.querySelector(".switch-mode");

  // Configure domFilter.
  const filter = domFilter({
    selector: "ul.food-items > li", // Select all food items.
    uiRender,                       // Custom render fn - adds letters highlighting.
    matchFn,                        // Custom matching fn - toggle between default & fuzy search alg.
  });

  function uiRender(entry, phrase) {
    if (mode === "default") {
      entry.ref.innerHTML = highlight(entry.text, phrase);
    } else if (mode === "fuzzy") {
      // NOTE: This snippet is just for better visualization of the results in the UI,
      // however it is not proper implementation of fuzzy search highlighting.
      entry.ref.innerHTML = highlight(entry.text, Array.from(phrase).join(","));
    }
  }

  function matchFn(entry, phrase) {
    if (mode === "default") {
      // Deafult phrase search.
      return entry.toLowerCase().includes(phrase.toLowerCase());
    } else if (mode === "fuzzy") {
      // Seach phrase with Fuzzy Seach algorithm.
      return fuzzySearch(phrase.toLowerCase(), entry.toLowerCase());
    }
  }

  // Handle input updates.
  input.addEventListener("input", event => {
    filter(event.target.value);
  });

  // Hanlde mode change.
  switchMode.addEventListener("click", event => {
    if (mode === "default") {
      mode = "fuzzy";
      event.target.textContent = "FUZZY MODE";
    } else {
      mode = "default";
      event.target.textContent = "DEFAULT MODE";
    }
  });

}());
