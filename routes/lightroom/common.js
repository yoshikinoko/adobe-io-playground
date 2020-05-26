const axios = require("axios");
const urljoin = require("url-join");
const { URL } = require("url");

const pathUtil = require("../../util/pathUtil");

const common = {};

const _host = "https://lr.adobe.io/";

const _api = [
  {
    label: "health",
    endpoint: "/v2/health",
    method: "get",
    responseType: "json",
  },
  {
    label: "accounts",
    endpoint: "/v2/account",
    method: "get",
    responseType: "json",
  },
  {
    label: "catalogs",
    endpoint: "/v2/catalog",
    method: "get",
    responseType: "json",
  },
  {
    label: "asset/rendition",
    endpoint:
      "/v2/catalogs/{catalogID}/assets/{assetID}/renditions/{renditionType}",
    method: "get",
    responseType: "arraybuffer",
  },
  {
    label: "assets",
    endpoint: "/v2/catalogs/{catalogID}/assets",
    method: "get",
    responseType: "json",
  },
  {
    label: "asset",
    endpoint: "/v2/catalogs/{catalogID}/assets/{assetID}",
    method: "get",
    responseType: "json",
  },
  {
    label: "album",
    endpoint: "/v2/catalogs/{catalogID}/albums/{albumID}",
    method: "get",
    responseType: "json",
  },
  {
    label: "albums",
    endpoint: "/v2/catalogs/{catalogID}/albums",
    method: "get",
    responseType: "json",
  },
  {
    label: "album/assets",
    endpoint: "/v2/catalogs/{catalogID}/albums/{albumID}/assets",
    method: "get",
    responseType: "json",
  },
];

const _routes = [
  {
    label: "apilink",
    endpoint: "/lightroom/apilink?url={url}",
  },
  {
    label: "assets",
    endpoint: "/lightroom/assets?catalogID={catalogID}",
  },
  {
    label: "asset",
    endpoint: "/lightroom/asset?catalogID={catalogID}&assetID={assetID}",
  },
  {
    label: "rendition",
    endpoint:
      "/lightroom/rendition?catalogID={catalogID}&assetID={assetID}&renditionType={renditionType}",
  },
  {
    label: "albums",
    endpoint: "/lightroom/albums?catalogID={catalogID}",
  },
  {
    label: "album",
    endpoint: "/lightroom/album?catalogID={catalogID}&albumID={albumID}",
  },
  {
    label: "album/assets",
    endpoint: "/lightroom/albumassets?catalogID={catalogID}&albumID={albumID}",
  },
];

const _paramPattarns = [
  {
    label: "catalogID",
    pattern: "[a-f0-9]{32}",
  },
  {
    label: "assetID",
    pattern: "[a-f0-9]{32}",
  },
  {
    label: "albumID",
    pattern: "[a-f0-9]{32}",
  },
  {
    label: "renditionType",
    pattern: "2048|1280|640|thumbnail2x",
  },
];

function _processJSONResponse(response) {
  const while1Regex = /^while\s*\(\s*1\s*\)\s*{\s*}\s*/;
  return response ? JSON.parse(response.replace(while1Regex, "")) : null;
}

common.renditionTypes = ["2048", "1280", "640", "thumbnail2x"];

common.findAPIFromURL = function (url) {
  const pathname = new URL(url).pathname;
  const _rParams = {};
  let _rApi = null;

  const matchAPIs = _api.filter(function (api) {
    let _regexStr = `^${api.endpoint.replace("/", "\\/")}$`;
    _paramPattarns.forEach((p) => {
      _regexStr = _regexStr.replace(`{${p.label}}`, `${p.pattern}`);
    });

    return pathname.match(new RegExp(_regexStr, "i"));
  });

  // found API, then parse aprameters
  if (matchAPIs.length > 0) {
    const matchAPI = matchAPIs[0];
    _rApi = matchAPI;
    _paramPattarns.forEach((p, pi) => {
      // let _regexParam = matchAPI.endpoint;
      let _regexParam = `^${matchAPI.endpoint.replace("/", "\\/")}$`;
      _regexParam = _regexParam.replace(`{${p.label}}`, `(${p.pattern})`);
      // replace other
      _paramPattarns.forEach((a, ai) => {
        if (ai !== pi) {
          _regexParam = _regexParam.replace(`{${a.label}}`, `(?:${a.pattern})`);
        }
      });
      const paramMatch = pathname.match(new RegExp(_regexParam, "i"));
      if (paramMatch) {
        _rParams[p.label] = paramMatch[1];
      }
    });
  }

  if (_rApi) {
    return {
      params: _rParams,
      api: _rApi,
    };
  } else {
    return null;
  }
};

common.route = function (label, pathParams = null, queryStrings = null) {
  return pathUtil.parser(_routes, label, pathParams, queryStrings);
};

common.api = function (label, pathParams = null, querySearchParams = null) {
  const r = pathUtil.parser(_api, label, pathParams, querySearchParams);
  r.host = _host;
  return r;
};

common.call = async function (
  label,
  pathOptions = {},
  querySearchParams = null,
  headeroptions = {}
) {
  const api = common.api(label, pathOptions, querySearchParams);
  return await common.fetch(api, headeroptions);
};

common.parseLinks = function (data) {
  if (!data.links) {
    return null;
  }

  const baseURL = data.base;
  const links = [];
  for (const [key, value] of Object.entries(data.links)) {
    const url = new URL(urljoin(baseURL, value.href));

    // update template url
    if (value.templated) {
      // add asset url
      if (key.startsWith("/rels/asset")) {
        data.resources.map((v) => {
          const matchAPI = common.findAPIFromURL(
            urljoin(baseURL, value.href.replace("{asset_id}", v.id))
          );
          const catalogID = matchAPI.params.catalogID;
          const route = common.route("asset", {
            catalogID: catalogID,
            assetID: v.id,
          });
          links.push({
            label: value.href.replace("{asset_id}", v.id),
            href: route.endpoint,
          });
        });
      }

      // add album url
      if (key.startsWith("/rels/album")) {
        data.resources.map((v) => {
          const matchAPI = common.findAPIFromURL(
            urljoin(baseURL, value.href.replace("{album_id}", v.id))
          );
          const catalogID = matchAPI.params.catalogID;

          const route = common.route("album", {
            catalogID: catalogID,
            albumID: v.id,
          });
          links.push({
            label: value.href.replace("{album_id}", v.id),
            href: route.endpoint,
          });
        });
      }
    } else {
      // find URL patterns
      const route = common.route("apilink", {
        url: encodeURIComponent(url.href),
      });
      let accessURL = route.endpoint;
      // set absolute url
      if (value.href.match(/^https?:\/\//)) {
        accessURL = value.href;
      }
      links.push({ label: key, href: accessURL });
    }
  }
  return links;
};

common.fetch = async function (api, headeroptions = {}) {
  const response = await axios({
    method: api.method,
    baseURL: api.host,
    url: api.endpoint,
    headers: headeroptions,
    responseType: api.responseType,
  });

  let data = response.data;
  if (api.responseType !== "arraybuffer") {
    data = _processJSONResponse(response.data);
  }

  return {
    api: api,
    options: headeroptions,
    data: data,
    headers: response.headers,
  };
};

module.exports = common;
