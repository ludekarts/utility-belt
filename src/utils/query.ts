/**
 * Get query parameters from URL.
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
export function getQueryParams(...params: string[]) {
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
 * Update query parameters in URL.
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

type QueryParam = string | { [key: string]: string | string[] };

export function updateQueryParams(
  query: string,
  name: QueryParam,
  value: string
) {
  const head = query.slice(0, query.indexOf("?") + 1);
  const tail = !head
    ? query
    : query.slice(query.indexOf("?") + 1, query.length);
  const UPDATE_SINLGE_PARAM = typeof name === "string";
  const UPDATE_MULTIPLE_PARAM =
    typeof name === "object" && typeof value === "undefined";
  const searchParams = new URLSearchParams(tail);

  if (UPDATE_SINLGE_PARAM) {
    updateParam(searchParams, name, value);
  } else if (UPDATE_MULTIPLE_PARAM) {
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

  return head + searchParams.toString();
}

function updateParam(
  searchParams: URLSearchParams,
  name: string,
  value: string
) {
  const removeExistingKey = value === undefined;
  if (removeExistingKey) {
    searchParams.delete(name);
  } else {
    searchParams.set(name, value);
  }
}
