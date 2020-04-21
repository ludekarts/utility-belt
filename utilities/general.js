// Remove Polish diacritics and hyphenate name.
export function hyphenate (value) {
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
    !Array.isArray(object);
}

// Check if piont [x,y] is in polygon [[x,y],...].
export function inPolygon (point, vs) {
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
export function plWordCase(options) {
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

// Get random Integer number from min-max range.
export function rangeRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generates unique ID.
export function uid() {
  return ((+new Date) + Math.random()* 100).toString(32);
}


// Adds styles tag into <head/> element.
export function attachStyle(style) {
  document.head.appendChild(
    document.createElement("style")
  ).textContent = style;
}
