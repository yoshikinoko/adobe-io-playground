const express = require("express");
const router = express.Router();

const common = require("./common");
const header = require("./header");
const renderUtil = require("../../util/renderUtil");

router.get("/", async function (req, res, next) {
  try {
    const apilabel = "document";
    const pathOptions = req.query;
    const headers = header.options(req);
    const response = await common.call(apilabel, pathOptions, null, headers);

    // Get Artboard ID from the response, then create links
    const artboards = response.data.artboards;
    const links = artboards.map((artboard) => {
      const artboardID = artboard.id;

      // Get Link ID from the response header
      const linkParseOptions = Object.assign(pathOptions, {
        artboardID: artboardID,
      });
      const linkURL = common.route("artboard", linkParseOptions).endpoint;

      return {
        label: `artboard/${artboardID}`,
        href: linkURL,
      };
    });

    const thumnbnailURL = response.data.thumbnail.url;

    // Render response
    renderUtil.response(req, res, response, links, false, thumnbnailURL);
  } catch (error) {
    renderUtil.error(req, res, error);
  }
});

module.exports = router;
