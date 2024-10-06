/**
 * Transform array of objects in to JS object, stores each entry under the key pulled from the object.
 *
 * @example
 *
 * const myArray = [{name: 'John', age: 25}, {name: 'Jane', age: 22}];
 * arrayToObject(myArray, 'name'); // {John: {name: 'John', age: 25}, Jane: {name: 'Jane', age: 22}}
 *
 */

export function arrayToObject(
  array: Array<{ [key: string]: any }>,
  key: string
) {
  return array.reduce((result, object) => {
    result[object[key]] = object;
    return result;
  }, {});
}

/**
 * Slice array in chunks with given size. Returns new array.
 *
 * @example
 *
 * const myArray = [1, 2, 3, 4, 5, 6, 7, 8, 9];
 * chunkArray(myArray, 3); // [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
 */

export function chunkArray<T>(array: T[], size: number) {
  let index = 0;
  const arrayLength = array.length;
  const chunks = [];
  for (index; index < arrayLength; index += size) {
    chunks.push(array.slice(index, index + size));
  }
  return chunks;
}

/**
 * Compare two arrays, and returns comparation object.
 *
 * @example
 *
 * const arrayA = [1, 2, 3, 4, 5];
 * const arrayB = [3, 4, 5, 6, 7];
 * compareArrays(arrayA, arrayB); // {added: [6, 7], removed: [1, 2]}
 *
 */
export function compareArrays(arrayA: any[], arrayB: any[]) {
  return {
    added: arrayB.filter((el) => !~arrayA.indexOf(el)),
    removed: arrayA.filter((el) => !~arrayB.indexOf(el)),
  };
}

/**
 * Get random subarray from full array by given size. Returns new array.
 *
 * @example
 *
 * const myArray = [1, 2, 3, 4, 5, 6, 7, 8, 9];
 * getRandomSubarray(myArray, 3); // [2, 5, 8]
 *
 */

export function getRandomSubarray<T>(array: T[], size: number) {
  const shuffled = array.slice(0);
  let i = array.length;
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
}

/**
 * Custom reduce implementation w/ isLast flag.
 *
 * @example
 *
 * const myArray = [1, 2, 3, 4, 5];
 * reduce(myArray, (acc, item, index, isLast) => acc += item); // 15
 *
 */

export function reduce<T>(
  array: T[],
  reducer: (acc: any, item: any, index: number, isLast: boolean) => any,
  results: any
) {
  let index = -1;
  const length = array.length;
  const last = length - 1;
  while (++index < length) {
    results = reducer(results, array[index], index, index === last);
  }
  return results;
}

/**
 * Loop through an array.
 *
 * @example
 *
 * const myArray = [1, 2, 3, 4, 5];
 * loop(myArray, (item, index) => console.log(item, index));
 *
 */

export function loop<T>(
  array: T[],
  callback: (item: T, index: number, array: T[]) => void
) {
  let index = 0;
  let stop = array.length;
  while (index < stop) {
    callback(array[index], index, array);
    index++;
  }
}

/**
 * Shuffle elements in the array. Returns new array.
 *
 * @example
 *
 * const myArray = [1, 2, 3, 4, 5];
 * shuffleArray(myArray); // [3, 1, 5, 2, 4]
 *
 */
export function shuffleArray<T>(array: T[]) {
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
}

/**
 * Remove array item by given index. Returns new array.
 *
 * @example
 *
 * const myArray = [1, 2, 3, 4, 5];
 * removeByIndex(myArray, 2); // [1, 2, 4, 5]
 *
 */
export function removeByIndex<T>(array: T[], index: number) {
  const clone = [...array];
  clone.splice(index, 1);
  return clone;
}

/**
 * Remove array item by it's reference. Returns new array.
 *
 * @example
 *
 * const myArray = [1, 2, 3, 4, 5];
 * removeByInstance(myArray, 3); // [1, 2, 4, 5]
 *
 */

export function removeByInstance<T>(array: T[], instance: T) {
  const index = array.indexOf(instance);
  if (index === -1) return array;
  return removeByIndex(array, index);
}

/**
 * Replace array item on given index. Returns new array.
 *
 * @example
 *
 * const myArray = [1, 2, 3, 4, 5];
 * replaceOnIndex(myArray, 2, 10); // [1, 2, 10, 4, 5]
 */
export function replaceOnIndex<T>(array: T[], index: number, item: T) {
  const clone = [...array];
  clone.splice(index, 1, item);
  return clone;
}

/**
 * Cuts item of an array from 'fromIndex' and paste it onto 'toIndex'
 * w/ preserving array order. Returns new array.
 *
 * @example
 *
 * const myArray = [1, 2, 3, 4, 5];
 * swapOrder(myArray, 0, 3); // [2, 3, 4, 1, 5]
 *
 */

export function swapOrder<T>(array: T[], fromIndex: number, toIndex: number) {
  const clone = [...array];
  const [cut] = clone.splice(fromIndex, 1);
  clone.splice(toIndex, 0, cut);
  return clone;
}

/**
 * Swaps array items on given indexes. Returns new array.
 *
 * @example
 *
 * const myArray = [1, 2, 3, 4, 5];
 * insertAtIndex(myArray, 0, 3); // [4, 2, 3, 1, 5]
 *
 */

export function swapItems<T>(array: T[], indexA: number, indexB: number) {
  const clone = [...array];
  const temp = clone[indexA];
  clone[indexA] = clone[indexB];
  clone[indexB] = temp;
  return clone;
}

/**
 * Inserts item at given index extending given array. Returns new array.
 *
 * @example
 *
 * const myArray = [1, 2, 3, 4, 5];
 * insertAtIndex(myArray, 2, 10); // [1, 2, 10, 3, 4, 5]
 *
 */

export function insertAtIndex<T>(array: T[], index: number, item: T) {
  const clone = [...array];
  clone.splice(index, 0, item);
  return clone;
}

/**
 * Combines two arrays into single array of value pairs where each pair is positioned
 * (indexed) same as in orginal array.
 *
 * @example
 *
 * const arrayA = [1, 2, 3, 4, 5];
 * const arrayB = ['a', 'b', 'c', 'd', 'e'];
 * zipArray(arrayA, arrayB); // [1, 'a', 2, 'b', 3, 'c', 4, 'd', 5, 'e']
 *
 */

export function zipArray<A, B>(arrayA: A[], arrayB: B[]): Array<[A, B]> {
  return arrayA.map((element, index) => [element, arrayB[index]]);
}

/**
 * Combines multiple arrays and filters out duplicate values. Returns new array.
 *
 * @example
 *
 * const myArray1 = [1, 2, 3, 4];
 * const myArray2 = [1, 3, 5, 6];
 * uniqueArray(myArray1, myArray2); // [1, 2, 3, 4, 5, 6]
 *
 */

export function uniqueArray<T>(...arrays: Array<T[]>) {
  return [...new Set(arrays.flat())];
}

/**
 * Cretaes a touple with one array that passes the predicate test and one that does not.
 *
 * @example
 *
 * const [even, odd] = sortOutArray([1, 2, 3, 4, 5], (x) => x % 2 === 0);
 * console.log(even, odd); // [2, 4] [1, 3, 5]
 *
 */

export function sortOutArray<T>(
  array: T[],
  predicate: (item: T, index: number) => boolean
): [T[], T[]] {
  return array.reduce(
    (acc, item, index) =>
      predicate(item, index)
        ? [[...acc[0], item], acc[1]]
        : [acc[0], [...acc[1], item]],
    [[], []] as [T[], T[]]
  );
}

/**
 * Splits array into two arrays at given index.
 *
 * @example
 *
 * const myArray = [1, 2, 3, 4, 5];
 * splitArrayAt(myArray, 2); // [[1, 2], [3, 4, 5]]
 */

export function splitArrayAt<T>(array: T[], index: number) {
  return [array.slice(0, index), array.slice(index)];
}
