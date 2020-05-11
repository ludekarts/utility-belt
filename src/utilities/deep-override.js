// Allows to deep override "target" object with "source" config.
// CAVEAT:
// 1. deepOverride always prefers "source" object over "target", except the case when "source" property is undefined.
// 2. When overriding arrays its structure need to be preserved to override proper values e.g.:
//
//   deepOverride(
//     [1, 2, 3],
//     [undefined, undefined, 4]
//   );
//   --> [1, 2, 4]
//
//   deepOverride(
//     [1, 2, 3],
//     [4, 5]
//   );
//   --> [4, 5, 3]
//
// 3. null is treated as a value e.g.:

//   deepOverride(
//     [1, 2, 3],
//     null
//   );
//   --> null


export default function deepOverride(target, source) {
  if (canBeCopied(source)) {
    return source === undefined ? target : source;
  } else if (Array.isArray(source) || Array.isArray(target)) {
    return deepArray(target, source);
  } else {
    return deepOverrideCore(target, source);
  }
}

function deepOverrideCore(target, source) {
  if (target === undefined) return source;
  if (source === undefined) return target;
  if (target === null) return source;
  if (source === null) return source;

  const sourceKeys = Object.keys(source);
  const targetKeys = Object.keys(target);
  const keys = sourceKeys.concat(
    targetKeys.filter(key => !sourceKeys.includes(key))
  );

  return !keys.length
    ? target
    : keys.reduce((acc, key) => {
        const sourceValue = source[key];
        const targetValue = target[key];

        if (canBeCopied(sourceValue)) {
          acc[key] = sourceValue === undefined ? targetValue : sourceValue;
        } else if (Array.isArray(targetValue) || Array.isArray(sourceValue)) {
          acc[key] = deepArray(targetValue, sourceValue);
        } else {
          acc[key] =
            sourceValue instanceof RegExp
              ? RegExp(sourceValue.source, sourceValue.flags)
              : deepOverrideCore(targetValue, sourceValue);
        }
        return acc;
      }, {});
}

function deepArray(target, source) {
  if (Array.isArray(target) && Array.isArray(source)) {
    const targetLength = target.length;
    const sourceLength = source.length;
    const result = [];

    for (let i = 0; i < targetLength || i < sourceLength; i++) {
      if (canBeCopied(source[i])) {
        result[i] = source[i] === undefined ? target[i] : source[i];
      } else if (Array.isArray(target[i]) || Array.isArray(source[i])) {
        result[i] = deepArray(target[i], source[i]);
      } else {
        result[i] = deepOverrideCore(target[i], source[i]);
      }
    }
    return result;
  } else {
    return source;
  }
}

function canBeCopied(object) {
  return [
    "string",
    "number",
    "boolean",
    "symbol",
    "function",
    "undefined"
  ].includes(typeof object);
}