/**
 * Split string at index.
 *
 * @example
 *
 * splitAtIndex("Hello world", 5); // ["Hello", " world"]
 *
 */
export function splitAtIndex(str: string, index: number) {
  return [str.slice(0, index), str.slice(index)];
}

/**
 * Place 'insert' inside 'str' string at given 'position'.
 *
 * @example
 *
 * placeStrBetween("Hello world", "beautiful ", 5); // "Hello beautiful world"
 *
 */

//
export function insertStrAtIndex(
  str: string,
  insert: string,
  position: number
) {
  const [head, tail] = splitAtIndex(str, position);
  return `${head}${insert}${tail}`;
}
