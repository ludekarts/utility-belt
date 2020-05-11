
// Encode Base 64.
export function base64(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) =>
    String.fromCharCode('0x' + p1)
  ));
}

// Convert string to 32bit integer.
export function hash32(string) {
  let hash = 0;
  let i;
  let chr;
  const { length } = string;
  if (length === 0) return hash;
  for (i = 0; i < length; i++) {
    chr = string.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
}

// Create hashCode from string.
export function hashCode(source) {
  return source.split("").reduce((a, b) => { a = (( a << 5) - a) + b.charCodeAt(0); return a&a }, 0);
}
