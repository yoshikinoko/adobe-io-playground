const express = require("express");
const router = express.Router();
const common = require("./common");
const header = require("./header");
const renderUtil = require("../../util/renderUtil");

router.get("/", async function (req, res, next) {
  if (req.isAuthenticated()) {
    try {
      const apilabel = "catalogs";
      const headers = header.options(req);

      const response = await common.call(apilabel, null, null, headers);

      const links = common.parseLinks(response.data);

      const catalogID = response.data.id;

      // Add Link for assets
      links.unshift({
        label: "assets",
        href: common.route("assets", { catalogID: catalogID }).endpoint,
      });

      // Add Link for albums
      links.unshift({
        label: "albums",
        href: common.route("albums", { catalogID: catalogID }).endpoint,
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
