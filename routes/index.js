const express = require("express");
const router = express.Router();
const apiScopes = require("../util/apiScopes");
const passport = require("../util/passport");

/* GET home page. */
router.get("/", function (req, res, next) {
  const ops = {
    user: passport.user(req),
    apiScopes: apiScopes,
  };
  res.render("index", ops);
});

module.exports = router;
