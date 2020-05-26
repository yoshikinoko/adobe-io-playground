const pathUtil = {};

pathUtil.parser = function (
  pathList,
  label,
  pathParams = null,
  querySearchParams = null
) {
  let r = null;
  const m = pathList.filter((t) => t.label === label);
  if (m.length === 0) return null;
  else {
    // deep copy from the list
    r = Object.assign({}, m[0]);
  }
  // Replace parameters on Path
  if (pathParams) {
    r.endpoint = Object.entries(pathParams).reduce((accum, [key, value]) => {
      return accum.replace(`{${key}}`, value);
    }, r.endpoint);
  }

  // Add query strings
  if (querySearchParams) {
    r.endpoint = r.endpoint + "?" + querySearchParams.toString();
  }

  return r;
};

module.exports = pathUtil;
