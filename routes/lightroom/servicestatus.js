const express = require("express");
const router = express.Router();
const common = require("./common");
const header = require("./header");
const renderUtil = require("../../util/renderUtil");

router.get("/", async function (req, res, next) {
  if (req.isAuthenticated()) {
    try {
      const apilabel = "health";
      const headers = header.options(req);

      const response = await common.call(apilabel, null, null, headers);

      // Render response
      renderUtil.response(req, res, response);
    } catch (error) {
      renderUtil.error(req, res, error);
    }
  } else {
    res.render("index", { response: "You need to log in first" });
  }
});

module.exports = router;
