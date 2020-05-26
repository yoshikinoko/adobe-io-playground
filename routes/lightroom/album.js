const express = require("express");
const router = express.Router();
const common = require("./common");
const header = require("./header");
const renderUtil = require("../../util/renderUtil");

router.get("/", async function (req, res, next) {
  if (req.isAuthenticated()) {
    try {
      const apilabel = "album";
      const headers = header.options(req);
      const pathOptions = req.query;

      const response = await common.call(apilabel, pathOptions, null, headers);

      const links = common.parseLinks(response.data);

      const route = common.route("album/assets", pathOptions);

      links.unshift({
        label: "album/assets",
        href: route.endpoint,
      });

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
