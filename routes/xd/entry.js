const express = require("express");
const router = express.Router();

const common = require("./common");
const header = require("./header");
const renderUtil = require("../../util/renderUtil");

router.get("/", async function (req, res, next) {
  try {
    const apilabel = "entry";
    const url = new URL(decodeURI(req.query.url));
    const headers = header.options(req);
    headers["X-AdobeXD-Link"] = url.href;

    const response = await common.call(apilabel, null, null, headers);

    // Get Link ID from the response header
    const linkID = common.parseDocumentID(response.headers.link);
    const documentURL = common.route("document", { linkID: linkID }).endpoint;
    const link = {
      label: "document",
      href: documentURL,
    };

    const links = [link];

    // Render response
    renderUtil.response(req, res, response, links, true);
  } catch (error) {
    renderUtil.error(req, res, error);
  }
});

module.exports = router;
