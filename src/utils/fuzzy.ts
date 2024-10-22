/**
 * Custom fuzzy search inplementation finding best match by distance of phrase from the start of the text.
 *
 */

type FuzzySource = string | Record<string, any>;
type MatchingScope = { start: number | null; text: string };
type FuzzyResult = {
  text: string;
  item: FuzzySource;
  match: MatchingScope[];
};

export function fuzzySearch(
  source: FuzzySource[],
  phrase: string,
  propSelector?: (source: Record<string, any>) => string
) {
  return source
    .reduce((acc: FuzzyResult[], item) => {
      const text =
        typeof item === "string"
          ? item
          : propSelector?.(item as Record<string, any>);

      if (!text) {
        throw new Error("FuzzySearchErrir: Cannot retrieve text from source.");
      }

      const match = fuzzyScore(text, phrase);
      match.length && acc.push({ text, item, match });
      return acc;
    }, [])
    .sort(sortByFuzzyMatch);
}

// Picks best match for given @text and @phrase.
function fuzzyScore(text: string, phrase: string) {
  let best: MatchingScope[] = [];

  for (let index = 0; index < text.length; index++) {
    if (text[index] === phrase[0]) {
      const collection = fuzzyMatch(text, phrase, index);
      if (compareCollections(best, collection, phrase.length)) {
        best = collection;
      }
    }
  }
  return best;
}

// Matches @phrase within given @text starting from the @startIndex.
function fuzzyMatch(text: string, phrase: string, startIndex = 0) {
  let collection: MatchingScope[] = [];
  let phraseIndex = 0;
  let letterIndex = startIndex;
  let phraseLength = phrase.length;
  let currentScope: MatchingScope = { start: null, text: "" };

  function saveScope() {
    collection.push({ ...currentScope });
    currentScope.start = null;
    currentScope.text = "";
  }

  for (; letterIndex < text.length; letterIndex++) {
    // Collect matching letters.
    if (text[letterIndex] === phrase[phraseIndex]) {
      currentScope.start =
        currentScope.start === null ? letterIndex : currentScope.start;
      currentScope.text += text[letterIndex];
      phraseIndex++;
    }

    // Start new entry in a collection.
    else if (currentScope.start !== null) {
      saveScope();
    }

    // If first letter is duplicated move start pointer to the last occurrence.
    if (
      collection.length &&
      phraseIndex > 0 &&
      !currentScope.text.length &&
      collection[collection.length - 1].text === text[letterIndex]
    ) {
      collection[collection.length - 1].start = letterIndex;
    }

    // When whole phrase was found.
    if (phraseIndex === phraseLength) {
      saveScope();
      break;
    }
  }
  // Hanlde match at the very end.
  if (currentScope.start !== null) {
    saveScope();
  }

  return collection;
}

// Returns TRUE if given @collection is "better" than @best.
function compareCollections(
  best: MatchingScope[],
  collection: MatchingScope[],
  phraseLength: number
) {
  if (best.length === 0 && collection.length) {
    const collectioCount = countCollLength(collection);
    return collectioCount >= phraseLength;
  }

  // Need to have shorter length and match all phrase characters.
  else if (collection.length && collection.length < best.length) {
    const bestCount = countCollLength(best);
    const collectioCount = countCollLength(collection);
    return collectioCount === phraseLength && collectioCount >= bestCount;
  }

  // Need to heve lower start index.
  else if (
    collection.length === best.length &&
    collection[0].start &&
    best[0].start &&
    collection[0].start < best[0].start
  ) {
    return true;
  }

  return false;
}

// Counts collection length.
function countCollLength(collection: MatchingScope[]) {
  return collection.reduce((acc, c) => (acc += c.text.length), 0);
}

function sortByFuzzyMatch(a: FuzzyResult, b: FuzzyResult) {
  // Prefer shorter collections.
  let score = a.match.length - b.match.length;
  return score === 0
    ? a.match[0].start !== null && b.match[0].start !== null
      ? a.match[0].start - b.match[0].start // Prefer lower start index.
      : score
    : score;
}
