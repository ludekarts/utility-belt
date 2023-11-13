// Remove Polish diacritics, lowercase word and hyphenate the value.
export function hyphenate(value) {
  const dict = {
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
    .replace(/[\Wąćęłńóśżź_ ]/g, match => dict[match] || "")
    .replace(/-{2,}/, "-");
};

// Check for primitie types & array.
export function isObject(object) {
  return !!object &&
    typeof object !== "symbol" &&
    typeof object !== "string" &&
    typeof object !== "number" &&
    typeof object !== "boolean" &&
    typeof object !== "function" &&
    !Array.isArray(object);
}

// Check for promise value.
export function isPromise(value) {
  return value !== null
    && typeof value === "object"
    && typeof value.then === "function"
    && typeof value.catch === "function"
}

// Check if piont [x,y] is in polygon [[x,y],...].
export function inPolygon(point, vs) {
  let [x, y] = point
  let inside = false
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i][0], yi = vs[i][1]
    let xj = vs[j][0], yj = vs[j][1]
    if (((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside
  }
  return inside;
}

// Allow to pick proper word case based on passed value.
export function wordCase(options) {
  const mods = [2, 3, 4];
  const mtpval = [11, 12, 13, 14];
  return value => {
    const mod10 = value % 10;
    return value === 1
      ? options.one
      : !mods.includes(mod10) || mtpval.includes(value)
        ? options.multiple
        : options.couple;
  };
}

// Get random number (int) from min-max range.
export function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generates unique IDs
// -> UUID-4 (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
// -> or short (8-chars).

export function uid(config = "") {
  return config.includes("--short") ? Math.floor(Math.random() * Date.now()).toString(36) : crypto.randomUUID();
}
