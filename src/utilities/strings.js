// Split string at index.
export function splitAtIndex(str, index) {
  return [str.slice(0, index), str.slice(index)];
};

// Place 'value' inside 'source' sctring at given 'position'.
export function placeStrBetween(source, value, position) {
  return source.slice(0, position) + value + source.slice(position + value.length - 1, source.length);
}

