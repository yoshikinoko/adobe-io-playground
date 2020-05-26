const axios = require("axios");
const urljoin = require("url-join");
const { URL } = require("url");

const pathUtil = require("../../util/pathUtil");

const common = {};

const _host = "https://xdce.adobe.io";

const _api = [
  {
    label: "entry",
    endpoint: "v2/api",
    method: "options",
    responseType: "json",
  },
  {
    label: "document",
    endpoint: "/v2/document/{linkID}",
    method: "get",
    responseType: "json",
  },
  {
    label: "artboard",
    endpoint: "/v2/document/{linkID}/artboard/{artboardID}",
    method: "get",
    responseType: "json",
  },
];

const _routes = [
  {
    label: "entry",
    endpoint: "/xd/entry",
  },
  {
    label: "document",
    endpoint: "/xd/document?linkID={linkID}",
  },
  {
    label: "artboard",
    endpoint: "/xd/artboard?linkID={linkID}&artboardID={artboardID}",
  },
];

async function _fetch(api, headers) {
  const response = await axios({
    method: api.method,
    baseURL: api.host,
    url: api.endpoint,
    headers: headers,
    responseType: api.responseType,
  });

  return {
    api: api,
    options: headers,
    data: response.data,
    headers: response.headers,
  };
}

common.apiPath = "/xd/apilink";

common.route = function (label, pathParams = null, queryStrings = null) {
  return pathUtil.parser(_routes, label, pathParams, queryStrings);
};

common.api = function (label, pathParams = null, queryStrings = null) {
  let r = null;
  const m = _api.filter((t) => t.label === label);
  if (m.length === 0) return null;
  else {
    // deep copy from the list
    r = Object.assign({}, m[0]);
    r.host = _host;
  }
  // Replace parameters on Path
  if (pathParams) {
    r.endpoint = Object.entries(pathParams).reduce((accum, [key, value]) => {
      return accum.replace(`{${key}}`, value);
    }, r.endpoint);
  }

  // Add query strings
  if (queryStrings) {
    const parsedQueryStr = Object.entries(queryStrings).reduce(
      (accum, [key, value]) => {
        const p = accum ? "&" : "?";
        return accum + `${p}${key}=${value}`;
      },
      ""
    );
    r.endpoint = r.endpoint + parsedQueryStr;
  }

  return r;
};

common.link = function (
  linklabel,
  label,
  pathOptions = {},
  queryStrings = {},
  path = common.apiPath
) {
  const api = common.api(label, pathOptions, queryStrings);
  const url = new URL(urljoin(api.host, api.endpoint));
  const r = {
    label: linklabel,
    href: urljoin(path, `?url=${encodeURIComponent(url.href)}`),
  };
  return r;
};

common.parseDocumentID = function (response) {
  const r = response.match(/<\/v2\/document\/([a-z,0-9,-]+)>; rel=document/);
  return r[1];
};

common.call = async function (
  label,
  pathOptions = {},
  queryStrings = {},
  headeroptions = {}
) {
  const api = common.api(label, pathOptions, queryStrings);
  return await _fetch(api, headeroptions);
};

module.exports = common;
