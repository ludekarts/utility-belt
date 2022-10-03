import { isObject } from "./general.js";

// ---- Schema Types Validators ----------------

export const schemaTypes = {
  // Basic validators.
  isNull: value => value === null,
  isUndefined: value => value === undefined,
  object: value => isObject(value),
  array: value => Array.isArray(value),
  number: value => typeof value === "number",
  string: value => typeof value === "string",
  symbol: value => typeof value === "symbol",
  boolean: value => typeof value === "boolean",
  // HOF validators.
  matches: regex => value => regex.test(value),
  objectOf: schema => value => isObject(value) && { value: value, schema: schema },
  arrayOf: schema => value => Array.isArray(value) && { value: value, schema: schema },
};


export function checkSchema(value, schema, options = {}) {

  // Allow only function validators.
  if (typeof schema === "function") {

    const result = schema(value);

    if (Array.isArray(result.value)) {
      return result.value.every(entry => {
        return Array.isArray(result.schema)
          // Each entry match at least one of schema's tests. "silent" flag prevent from throwing
          // an error when searching for any match.
          ? result.schema.some(test => checkSchema(entry, test, { silent: true }))
          // Run direct check.
          : checkSchema(entry, result.schema);
      });
    }

    if (isObject(result.schema)) {
      return Object.keys(result.schema).every(key => {
        if (result.value[key] === undefined) {
          throw new Error(`Missing property "${key}"`);
        }
        return checkSchema(result.value[key], result.schema[key]);
      });
    }

    if (result === false) {
      if (options.silent) {
        return false;
      } else {
        console.error(`Mismatch value:`, value);
        throw new Error(`Value "${value}" does not match schema type.`);
      }
    }

    return true;
  }

  throw new Error(`Incorrect schema type. Got "${typeof schema}" instead of schema-type function.`);
}
