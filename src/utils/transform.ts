/**
 * This utility treverse @input object and allows to apply @transformer function on each value.
 * If @transformer returns "undefined", the value is not changed.
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

type Transformer = (key: string | null, value: any) => any;

export function transformObject<T>(input: T, transformer: Transformer): T {
  return traverseUnique(input, transformer, new WeakSet());
}

function traverseUnique(
  input: any,
  transformer: Transformer,
  visited: WeakSet<any>,
  key: string | null = null
): any {
  if (typeof input !== "object" || input === null) {
    return transformer(key, input) ?? input;
  }

  if (visited.has(input)) {
    return input;
  }

  visited.add(input);

  let result: any;
  if (Array.isArray(input)) {
    result = input.map((item) =>
      traverseUnique(item, transformer, visited, null)
    );
  } else {
    result = {};
    for (const k in input) {
      if (input.hasOwnProperty(k)) {
        const transformed = traverseUnique(input[k], transformer, visited, k);
        if (transformed !== undefined) {
          result[k] = transformed;
        }
      }
    }
  }

  visited.delete(input);

  const final = transformer(key, result);
  return final === undefined ? result : final;
}
