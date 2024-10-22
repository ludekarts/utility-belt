export function fuzzySearchWidget() {
  const { fuzzySearch } = window.UtilityBelt;

  const source = [
    "hello world",
    "this is hell",
    "hotel like this",
    "hotel like this hello",
    "hotel like this helloello",
  ];

  const widget = document.createElement("div");
  const preview = document.createElement("ul");
  const search = document.createElement("input");
  const label = document.createElement("label");

  label.textContent = "Fuzzy Search Example";

  search.oninput = (event) => {
    const phrase = event.target.value;
    const matches = fuzzySearch(source, phrase).reduce(
      (acc, result) =>
        (acc += result.match
          ? "<li>" + renderMarkers(result.text, result.match) + "</li>"
          : ""),
      ""
    );

    preview.innerHTML = matches;
  };

  function renderMarkers(text, matches) {
    return matches
      .reverse()
      .reduce(
        (acc, item) =>
          wrapRange(acc, item.start, item.start + item.text.length, "strong"),
        text
      );
  }

  function wrapRange(text, start, end, tag) {
    const head = text.slice(0, start);
    const content = text.slice(start, end);
    const tail = text.slice(end, text.length);
    return `${head}<${tag}>${content}</${tag}>${tail}`;
  }

  widget.appendChild(label);
  widget.appendChild(search);
  widget.appendChild(preview);
  return widget;
}
