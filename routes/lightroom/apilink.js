const express = require("express");
const { URL } = require("url");
const router = express.Router();
const common = require("./common");
const header = require("./header");
const renderUtil = require("../../util/renderUtil");

router.get("/", async function (req, res, next) {
  if (req.isAuthenticated()) {
    try {
      const headers = header.options(req);
      const url = new URL(decodeURIComponent(req.query.url));
      const host = url.origin;
      const endpoint = url.pathname + url.search;

      let _callAPI = {
        label: "apilink",
        host: host,
        endpoint: endpoint,
        method: "get",
        responseType: "json",
      };

      const _matchedAPI = common.findAPIFromURL(url.href);
      if (_matchedAPI) {
        _callAPI = common.api(
          _matchedAPI.api.label,
          _matchedAPI.params,
          url.searchParams
        );
      }

      const response = await common.fetch(_callAPI, headers);
      response.api = _callAPI;

      const links = common.parseLinks(response.data);

      // Render response
      renderUtil.response(req, res, response, links);
    } catch (error) {
      renderUtil.error(req, res, error);
    }
  } else {
    res.render("index", { response: "You need to log in first" });
  }
});

module.exports = router;
