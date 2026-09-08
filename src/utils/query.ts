/**
 * Get query parameters from a relative or absolute URL.
 *
 * Requested values are returned in the same order as their requested names.
 * A plain name returns its first value when a key is duplicated; append `[]` to
 * the name to return every value in URL order.
 *
 * @example
 *
 * const [id, filter] = getQueryParams("id", "filter", "https://example.com?id=123&user=admin&filter=age&filter=address");
 * console.log(id, filter); // 123, "age"
 *
 * const [id, filter] = getQueryParams("id", "filter[]", "https://example.com?id=123&user=admin&filter=age&filter=address");
 * console.log(id, filter); // 123, ["age", "addres"]
 *
 */
export function getQueryParams(
  ...params: string[]
): Array<string | string[] | undefined> {
  if (params.length === 0) {
    throw new Error("GetQueryParamsError: No query parameters provided");
  }

  const url = params.pop() as string;
  const qIndex = url.indexOf("?");

  if (qIndex === -1) return [];

  const searchParams = new URLSearchParams(url.slice(qIndex + 1));
  return params.map((param) => {
    if (param.endsWith("[]")) {
      const searchParam = param.slice(0, -2);
      const result = searchParams.getAll(searchParam);
      return result;
    } else {
      const result = searchParams.getAll(param);
      return result[0];
    }
  });
}

/**
 * Update query parameters in a relative or absolute URL.
 *
 * Existing keys retain their order when updated. Array values replace all
 * existing values and are appended in array order. A value of `undefined`
 * removes all occurrences of its key. URL fragments are preserved.
 *
 * @example
 *
 * const query = updateQueryParams("https://example.com?id=123&user=admin&filter=age&filter=address", "id", "456");
 * console.log(query); // "https://example.com?id=456&user=admin&filter=age&filter=address"
 *
 * const multiQuery = updateQueryParams("https://example.com?id=123&user=admin", {
 *   id: "456",
 *   filter: ["age", "address"],
 *   user: "guest"
 * });
 * console.log(multiQuery); // "https://example.com?id=456&user=guest&filter=age&filter=address"
 *
 */

type QueryParamValue = string | string[] | undefined;
type QueryParam = string | Record<string, QueryParamValue>;

export function updateQueryParams(
  query: string,
  name: QueryParam,
  value?: string,
) {
  const hashIndex = query.indexOf("#");
  const fragment = hashIndex === -1 ? "" : query.slice(hashIndex);
  const url = hashIndex === -1 ? query : query.slice(0, hashIndex);
  const queryIndex = url.indexOf("?");
  const head = queryIndex === -1 ? `${url}?` : url.slice(0, queryIndex + 1);
  const tail = queryIndex === -1 ? "" : url.slice(queryIndex + 1);
  const UPDATE_SINGLE_PARAM = typeof name === "string";
  const UPDATE_MULTIPLE_PARAMS =
    typeof name === "object" && typeof value === "undefined";
  const searchParams = new URLSearchParams(tail);

  if (UPDATE_SINGLE_PARAM) {
    updateParam(searchParams, name, value);
  } else if (UPDATE_MULTIPLE_PARAMS) {
    Object.keys(name).forEach((key) => {
      const propValue = name[key];

      if (Array.isArray(propValue)) {
        searchParams.delete(key);
        propValue.forEach((value) => searchParams.append(key, value));
      } else {
        updateParam(searchParams, key, propValue);
      }
    });
  } else {
    throw new Error("UpdateQueryParamsError: Invalid arguments");
  }

  return head + searchParams.toString() + fragment;
}

function updateParam(
  searchParams: URLSearchParams,
  name: string,
  value: string | undefined,
) {
  const removeExistingKey = value === undefined;
  if (removeExistingKey) {
    searchParams.delete(name);
  } else {
    searchParams.set(name, value);
  }
}

/**
 * Parse CLI parameters.
 *
 * Existing keys retain their order when updated. Array values replace all
 * existing values and are appended in array order. A value of `undefined`
 * removes all occurrences of its key. URL fragments are preserved.
 *
 * @param params - Array of CLI parameters (typically `process.argv.slice(2)`).
 * @param flags - List of flags to parse from the CLI parameters.
 * @returns An array of values corresponding to the provided flags.
 *
 * @example
 *
 * import { parseCliParams } from "@ludekarts/utility-belt";
 *
 * $ node my_script.js -a 1 -b -d
 *
 * const [a, b, c, d] = parseCliParams(process.argv.slice(2), "-a", "-b", "-c", "-d");
 *
 * console.log(a, b, c, d); // 1 true undefined true
 *
 */

export function parseCliParams(
  params: Array<string | undefined>,
  ...flags: string[]
): Array<string | boolean | undefined> {
  if (!Array.isArray(params)) {
    throw new Error("Cannot parse params. Params must be an array");
  }
  params.unshift(undefined);
  return flags.map((flag) => {
    const index = params.indexOf(flag);
    const value = params[index + 1];
    return index < 0
      ? undefined
      : value
        ? flags.includes(value)
          ? true
          : value
        : true;
  });
}
