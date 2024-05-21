// DESC:
// This utility treverse input @obj and allows to apply @transformer function on each value.
// If @transformer returns undefined, the value is not changed.

// EXAMLPE:
/*

  const source = {
    one: {
      one_1: [1, 2, 3, { one_deep: "one_deep_value" }],
      one_2: "one_2_value",
    },
    two: 2,
    three: "3",
    four: () => {},
  };

  console.log(
    transformObject(source, (key, value) => {
      console.log(key, value);
      // Override "one_deep" key with new value.
      if (key === "one_deep") return "one_deep-👾";
    })
  ); // --> updated source object.

*/

export default function transformObject(obj, transformer) {
  return typeof obj === "object"
    ? traverseObject(obj, transformer)
    : transformValue(undefined, obj, transformer);
}

function transformValue(key, value, transformer) {
  let result =
    typeof transformer === "function" ? transformer(key, value) : undefined;
  return result === undefined ? value : result;
}

function traverseObject(obj, transformer) {
  if (Array.isArray(obj)) {
    obj.forEach((item) => traverseObject(item, transformer));
  } else if (typeof obj === "object") {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        obj[key] = transformValue(key, obj[key], transformer);
        traverseObject(value, transformer);
      }
    }
  }
  return obj;
}
