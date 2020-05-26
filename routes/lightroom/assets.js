const express = require("express");
const router = express.Router();
const common = require("./common");
const header = require("./header");
const renderUtil = require("../../util/renderUtil");

router.get("/", async function (req, res, next) {
  if (req.isAuthenticated()) {
    try {
      const apilabel = "assets";
      const headers = header.options(req);
      const pathOptions = req.query;
      const _searchParams = new URLSearchParams();
      _searchParams.set("limit", "5");

      const response = await common.call(
        apilabel,
        pathOptions,
        _searchParams,
        headers
      );

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
