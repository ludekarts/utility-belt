// Split string at index.
export function splitAtIndex(str, index) {
  return [str.slice(0, index), str.slice(index)];
};

// Place 'value' inside 'source' sctring at given 'position'.
export function placeStrBetween(source, value, position) {
  const head = source.slice(0, position);
  const tail = source.slice(position, source.length);
  return `${head}${value}${tail}`;
}

