// Transfrom array of objects in to JS object,
// stores each entry under the key pulled from the object.
export function arrayToObject(array, key) {
  return array.reduce((result, object) => {
    result[object[key]] = object;
    return result;
  }, {});
}

// Slice array in chunks with given size.
export function chunksArray(array, size) {
  let index = 0;
  const arrayLength = array.length;
  const chunks = [];
  for (index; index < arrayLength; index += size) {
    chunks.push(array.slice(index, index + size));
  }
  return chunks;
};

// Compare two arrays and returns comparation object.
export function compareArrays(arrayA, arrayB) {
  return {
    added: arrayB.filter(el => !~arrayA.indexOf(el)),
    removed: arrayA.filter(el => !~arrayB.indexOf(el))
  };
};

// Get randomly picked subarray from array of given size.
export function getRandomSubarray(arr, size) {
  const shuffled = arr.slice(0);
  let i = arr.length;
  const min = i - size;
  let temp;
  let index;
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(min);
};

// Fasterst way to convert NodeList into Array.
export function nodeListToArray(nodelist) {
  const array = [];
  for (let i = -1, l = nodelist.length; ++i !== l; array[i] = nodelist[i]);
  return array;
}

// Reduces provided array with given reducer.
export function reduce(array, reducer, results) {
  let index = -1;
  const length = array.length;
  const last = length - 1;
  while (++index < length) {
    results = reducer(results, array[index], index, index === last);
  }
  return results;
}

// Loop through array.
export function loop(array, callback) {
  let index = 0;
  let stop = array.length;
  while (index < stop) {
    callback(array[index], index, array);
    index++;
  }
}

// Shuffle elements in the array.
export function shuffleArray(array) {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;
  let result = [...array];

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = result[currentIndex];
    result[currentIndex] = result[randomIndex];
    result[randomIndex] = temporaryValue;
  }

  return result;
};

export function sortByPhraseIndex(array, phrase, selector = x => x) {
  const lowerPhrase = phrase.toLowerCase();
  const result = [...array];
  return result.sort((a, b) => {
    const indexA = selector(a).indexOf(lowerPhrase);
    const indexB = selector(b).indexOf(lowerPhrase);
    // Make sure that -1 (not found) goes at the very end of the array.
    const ia = indexA < 0 ? Infinity : indexA;
    const ib = indexB < 0 ? Infinity : indexB;
    return ia - ib;
  });
}


export function removeByIndex(array, index) {
  const clone = [...array];
  clone.splice(index, 1);
  return clone;
}

export function removeByInstance(array, instance) {
  const index = array.indexOf(instance);
  if (index === -1) return array;
  const clone = [...array];
  clone.splice(index, 1);
  return clone;
}

export function replaceByIndex(array, index, item) {
  const clone = [...array];
  clone.splice(index, 1, item);
  return clone;
}

export function swapOrder(array, startIndex, endIndex) {
  const clone = [...array];
  const [removed] = clone.splice(startIndex, 1);
  clone.splice(endIndex, 0, removed);
  return clone;
}

export function insertAtIndex(array, index, item) {
  const clone = [...array];
  clone.splice(index, 0, item);
  return clone;
}