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
 * Place @insertStr string into @baseStr string at given @position number
 *
 * @example
 *
 * placeStrBetween("Hello world", "beautiful ", 5); // "Hello beautiful world"
 *
 */

//
export function insertStringAtIndex(
  baseStr: string,
  insertStr: string,
  position: number
) {
  const [head, tail] = splitAtIndex(baseStr, position);
  return `${head}${insertStr}${tail}`;
}
