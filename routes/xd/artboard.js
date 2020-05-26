const express = require("express");
const router = express.Router();

const common = require("./common");
const header = require("./header");
const renderUtil = require("../../util/renderUtil");

router.get("/", async function (req, res, next) {
  try {
    const apilabel = "artboard";
    const pathOptions = req.query;
    const headers = header.options(req);
    const response = await common.call(apilabel, pathOptions, null, headers);

    const thumnbnailURL = response.data.thumbnail.url;

    // Render response
    renderUtil.response(req, res, response, null, false, thumnbnailURL);
  } catch (error) {
    renderUtil.error(req, res, error);
  }
});

module.exports = router;
