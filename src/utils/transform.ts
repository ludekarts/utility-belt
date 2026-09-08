/**
 * This utility traverses plain objects and arrays and applies @transformer to each value.
 * Dates, collections, and class instances are treated as leaf values and are not cloned.
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

export type Transformer = (key: string | null, value: unknown) => unknown;

export function transformObject<T>(input: T, transformer: Transformer): T {
  return traverseUnique(input, transformer, new WeakSet()) as T;
}

function traverseUnique(
  input: unknown,
  transformer: Transformer,
  visited: WeakSet<object>,
  key: string | null = null,
): unknown {
  if (typeof input !== "object" || input === null) {
    return transformer(key, input) ?? input;
  }

  if (visited.has(input)) {
    return input;
  }

  visited.add(input);

  let result: Record<string, unknown> | unknown[];
  if (Array.isArray(input)) {
    result = input.map((item) =>
      traverseUnique(item, transformer, visited, null),
    );
  } else if (isPlainObject(input)) {
    result = {};
    for (const k in input) {
      if (input.hasOwnProperty(k)) {
        const transformed = traverseUnique(input[k], transformer, visited, k);
        if (transformed !== undefined) {
          result[k] = transformed;
        }
      }
    }
  } else {
    return transformer(key, input) ?? input;
  }

  visited.delete(input);

  const final = transformer(key, result);
  return final === undefined ? result : final;
}

function isPlainObject(value: object): value is Record<string, unknown> {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
