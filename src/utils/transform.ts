/**
 * This utility treverse @input object and allows to apply @transformer function on each value.
 * If @transformer returns undefined, the value is not changed.
 *
 * @example
 *
 * const source = {
 *  one: {
 *    one_1: [1, 2, 3, { deep: "deep_value" }],
 *    one_2: "one_2_value",
 *  },
 *  two: 2,
 *  three: "3",
 *  four: () => {},
 * };
 *
 * console.log(
 *  transformObject(source, (key, value) => {
 *    if (key === "deep") return value + "_updated_by_👾";  // Override "deep" key with new value.
 *  })
 * );
 */

type Transformer = (key: string, value: any) => any;

export function transformObject<T>(input: T, transformer: Transformer) {
  return traverseUnique(input, transformer, new Set());
}

function transformValue(
  key: string | null,
  value: any,
  transformer: Transformer
) {
  return typeof transformer === "function" ? transformer(key, value) : value;
}

function traverseUnique(input, transformer, visited) {
  if (typeof input !== "object" || input === null) {
    return transformValue(null, input, transformer);
  }

  // Skip cicrular references (do not stuck in loop).
  if (visited.has(input)) {
    return input;
  }

  visited.add(input);

  if (Array.isArray(input)) {
    // We using map() to guard against case when transformer modifies the oryginal array length,
    // so we process initial number of items and apply exact results to transformed array.
    const transformedArray = input.map((item) =>
      traverseUnique(item, transformer, visited)
    );
    input.length = 0;
    transformedArray.forEach((item) => input.push(item));
  } else {
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        input[key] = transformValue(key, input[key], transformer);
        input[key] = traverseUnique(input[key], transformer, visited); // Transform recursively.
      }
    }
  }

  visited.delete(input);
  return input;
}
