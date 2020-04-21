// Fuzzy search inplementation.
export default function fuzzySearch (chars, phrase) {
  const phraseLength = phrase.length;
  const charsLength = chars.length;
  if (charsLength > phraseLength) return false;
  if (charsLength === phraseLength) return chars === phrase;

  outer: for (let i = 0, j = 0; i < charsLength; i++) {
    const sch = chars.charCodeAt(i);
    while (j < phraseLength) {
      if (phrase.charCodeAt(j++) === sch) {
        continue outer;
      }
    }
    return false;
  }
  return true;
};