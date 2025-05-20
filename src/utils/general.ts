/**
 *
 * Hyphenate given value while ensure to remove Polish diacritics.
 *
 * @example
 *
 * hyphenate("Łódź na tafli jeziora!") // => "lodz-na-tafli-jeziora"
 *
 */

export function hyphenate(value: string) {
  const dict: { [key: string]: string } = {
    ą: "a",
    ć: "c",
    ę: "e",
    ł: "l",
    ń: "n",
    ó: "o",
    ś: "s",
    ż: "z",
    ź: "z",
    " ": "-",
  };
  return value
    .toLowerCase()
    .replace(/[\Wąćęłńóśżź_ ]/g, (match: string) => dict[match] || "")
    .replace(/-{2,}/, "-");
}

/**
 *
 * Check if given value is an object.
 *
 * @example
 *
 * isObject({}) // => true
 * isObject([]) // => false
 *
 */

export function isObject(object: any) {
  return (
    !!object &&
    typeof object !== "symbol" &&
    typeof object !== "string" &&
    typeof object !== "number" &&
    typeof object !== "boolean" &&
    typeof object !== "function" &&
    !Array.isArray(object)
  );
}

/**
 *
 * Check if given value is a promise.
 *
 * @example
 *
 * isPromise(Promise.resolve()) // => true
 * isPromise({ then: () => {} }) // => true
 * isPromise({}) // => false
 *
 */
export function isPromise(value: any) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.then === "function" &&
    typeof value.catch === "function"
  );
}

/**
 *
 * Check if piont [x,y] is in polygon [[x,y],...]
 *
 * @example
 *
 * inPolygon([1,1], [[0,0], [2,0], [2,2], [0,2]]) // => true
 * inPolygon([3,3], [[0,0], [2,0], [2,2], [0,2]]) // => false
 */
export function inPolygon(
  point: [number, number],
  vs: Array<[number, number]>
) {
  let [x, y] = point;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i][0],
      yi = vs[i][1];
    let xj = vs[j][0],
      yj = vs[j][1];
    if (yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}

/**
 *  Allow to pick proper word case (for Polish language) based on passed numerical value.
 *
 * @example
 *
 * const getCase = plPlurals({
 *  one: "produkt",
 *  few: "produkty",
 *  many: "produktów"
 * });
 *
 * getCase(1) // => "produkt"
 * getCase(2) // => "produkty"
 * getCase(3) // => "produkty"
 * getCase(5) // => "produktów"
 *
 */

type plPluralsSettings = {
  one?: string;
  few?: string;
  many?: string;
};

export function plPlurals(settings: plPluralsSettings = {}) {
  const manyCases = [11, 12, 13, 14];
  const moduloCases = [2, 3, 4];
  const { one = "", few = "", many = "" } = settings;
  return (value: number) => {
    const mod10 = value % 10;
    return value === 1
      ? one
      : !moduloCases.includes(mod10) || manyCases.includes(value)
      ? many
      : few;
  };
}

/**
 * Get random number (int) from min-max range.
 *
 * @example
 *
 * getRandomNumber(1, 10) // => 5
 *
 */
export function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates unique IDs
 * -> UUID-4 (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
 * -> or short (8-chars).
 *
 * @example
 *
 * uid() // => "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 * uid("--short") // => "3d1f4b2a"
 *
 */
export function uid(config = "") {
  return config.includes("--short")
    ? Math.floor(Math.random() * Date.now()).toString(36)
    : crypto.randomUUID();
}
