// Parse search query into object. Repeating keys are stored as an array under one key.
export function queryToObject(queryString) {

  if (!queryString || !queryString.length) {
    return {};
  }

  const query = queryString.indexOf("?") === 0
    ? queryString.slice(1)
    : queryString;

  return query
    .split("&")
    .reduce((acc, param) => {
      const [key, value] = param.split("=");
      const decodedValue = decodeURIComponent(value);
      if (acc[key]) {
        if (Array.isArray(acc[key])) {
          acc[key].push(decodedValue);
        } else {
          acc[key] = [acc[key], decodedValue];
        }
      } else {
        acc[key] = decodedValue;
      }
      return acc;
    }, {});
}


/**
 * Update query params in the URL.
 * NOTE: When updated value is "undefined" or "string" with zero-length then the param will be removed.
 * @param   {String/Object}  queryString   String with query params or object containing params.
 * @param   {Object}         updateObject  Object with params to update.
 * @return  {String}                       New query string.
 */
export function updateQuery(queryString, updateObject) {
  const queryObject = typeof queryString === "string"
    ? queryToObject(queryString)
    : queryString;
  const params = new URLSearchParams();
  const query = { ...queryObject, ...updateObject };

  Object.keys(query).forEach(param => {
    const current = query[param];
    if (current !== undefined) {
      if (Array.isArray(current)) {
        current.forEach(value => params.append(param, value));
      } else if (typeof current !== "string" || current.length > 0) {
        params.append(param, current);
      }
    }
  });
  return params.toString();
}
