
export default function deepCopy(source) {
  if (canBeCopied(source)) {
    return source;
  } else if (Array.isArray(source)) {
    return deepArray(source);
  } else {
    return deepObject(source);
  }
}

function deepArray(array) {
  return array.map(item =>
    Array.isArray(item)
      ? deepArray(item)
      : canBeCopied(item)
        ? item
        : deepObject(item)
  );
}

function deepObject(object) {
  return Object.keys(object).reduce((acc, key) => {
    if (object.hasOwnProperty(key)) {
      const value = object[key];
      if (canBeCopied(value))
        acc[key] = value;
      else if (Array.isArray(value))
        acc[key] = deepArray(value);
      else
        acc[key] = Object.assign({}, value);
    }
    return acc;
  }, {});
}

// ---- Helpers ----------------

function canBeCopied(type) {
  return type === null || [
    "string",
    "number",
    "symbol",
    "boolean",
    "function",
    "undefined",
  ].includes(typeof type);
}