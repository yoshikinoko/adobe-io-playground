const express = require("express");
const router = express.Router();
const common = require("./common");
const header = require("./header");
const renderUtil = require("../../util/renderUtil");

router.get("/", async function (req, res, next) {
  if (req.isAuthenticated()) {
    try {
      const apilabel = "asset";
      const headers = header.options(req);
      const pathOptions = req.query;

      const response = await common.call(apilabel, pathOptions, null, headers);

      const links = common.parseLinks(response.data);
      common.renditionTypes.forEach((e) => {
        const route = common.route(
          "rendition",
          Object.assign(pathOptions, { renditionType: e })
        );

        links.unshift({
          label: `renditions/${e}`,
          href: route.endpoint,
        });
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
