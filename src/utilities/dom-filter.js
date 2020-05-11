import { attachStyle } from "./general.js";
import { nodeListToArray } from "./arrays.js";

function defaultMatch(entry, phrase) {
  return entry.toLowerCase().includes(phrase.toLowerCase());
}

export default function domFilter({
  selector,
  extractContent,
  uiRender,
  matchFn = defaultMatch,
  matchIfEmptyPhrase = true,
}) {
  const items = nodeListToArray(document.querySelectorAll(selector))
    .reduce((acc, item) => {
      !matchIfEmptyPhrase && item.classList.add("dom-filter-match");
      acc.push({
        text: extractContent ? extractContent(item, index) : item.textContent,
        ref: item,
      });
      return acc;
    }, []);

  attachStyle(`
    .dom-filter-match {
      display: none;
    }
  `);

  const store = {};
  const itemsLength = items.length;

  return phrase => {
    for(let i = 0; i < itemsLength; i++) {
      const entry = items[i];
      if (!phrase.length && !matchIfEmptyPhrase) {
        entry.ref.classList.add("dom-filter-match");
      } else if (matchFn(entry.text, phrase, items)) {
        entry.ref.classList.remove("dom-filter-match");
        uiRender && uiRender(entry, phrase, store);
      } else {
        entry.ref.classList.add("dom-filter-match");
      }
    }
    return items;
  };
}
