// Wrap parts of @text with <strong> tags that matches with given @phrases.
//
// USAGE:
//
// const result = highlight("Good and goofy", "go, fy");
// console.log(result); // <strong>Go</strong>od and <strong>go</strong>o<em>fy</em>
//

export default function highlight(text, phrases) {
  if (!phrases.length) return text;

  let result;
  const matches = [];
  const regexp = phrasesToRegex(phrases);

  // eslint-disable-next-line no-cond-assign
  while ((result = regexp.exec(text))) {
    matches.push([result.index, result.index + result[0].length]);
  }

  const hlight = matches
    .reverse()
    .reduce(
      (acc, [start, end]) =>
        `${acc.slice(0, start)}<strong>${acc.slice(start, end)}</strong>${acc.slice(
          end
        )}`,
      text
    );

  return hlight;
}

function phrasesToRegex(phrases) {
  const words = phrases.split(",");
  const regex =
    words.length > 1
      ? words.reduce((acc, ph) => {
          const trimmed = ph.trim();
          return trimmed.length ? `${acc}${trimmed}|` : acc;
        }, "")
      : `${words[0]}|`;

  return new RegExp(regex.slice(0, -1), "gi");
}
