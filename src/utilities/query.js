// USAGE:
//
// import { getQueryParams } from "@ludekarts/utility-belt";
//
// const [id, filter] = getQueryParams("id", "filter", "http://exampla.com?id=123&user=admin&filter=age&filter=address");
//
// console.log(id, filter); // 123, "age"
//
// const [id, filter] = getQueryParams("id", "filter[]", "http://exampla.com?id=123&user=admin&filter=age&filter=address");
//
// console.log(id, filter); // 123, ["age", "addres"]

export function getQueryParams(...params) {
  const url = params.pop();
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

// USAGE:
//
// import { updateQueryParams } from "@ludekarts/utility-belt";
//
// const query = updateQueryParams("http://exampla.com?id=123&user=admin&filter=age&filter=address", "id", "456");
//
// console.log(query); // "http://exampla.com?id=456user=admin&filter=age&filter=address"

export function updateQueryParams(query, name, value) {
  const head = query.slice(0, query.indexOf("?") + 1);
  const tail = !head
    ? query
    : query.slice(query.indexOf("?") + 1, query.length);
  const updaSingleParam = typeof name === "string";
  const searchParams = new URLSearchParams(tail);

  if (updaSingleParam) {
    updateParam(searchParams, name, value);
  } else {
    Object.keys(name).forEach((key) => {
      const propValue = name[key];

      if (Array.isArray(propValue)) {
        searchParams.delete(key);
        propValue.forEach((value) => searchParams.append(key, value));
      } else {
        updateParam(searchParams, key, propValue);
      }
    });
  }

  return head + searchParams.toString();
}

function updateParam(searchParams, name, value) {
  const removeExistingKey = value === undefined;
  if (removeExistingKey) {
    searchParams.delete(name);
  } else {
    searchParams.set(name, value);
  }
}
