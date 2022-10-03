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

// Generates unique ID in `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` format.
// From: https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
export function uid() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
