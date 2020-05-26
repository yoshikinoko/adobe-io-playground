const express = require("express");
const router = express.Router();
const apiScopes = require("../../util/apiScopes");
const axios = require("axios");
const passport = require("../../util/passport");

const host = "ims-na1.adobelogin.com";
const endpoint = "/ims/userinfo";
const adobeapikey = process.env.ADOBE_IO_CLIENT_ID;

router.get("/", function (req, res, next) {
  if (req.isAuthenticated()) {
    /* Grab the token stored in req.session
    and set options with required parameters */
    const accessToken = req.session.passport.user.accessToken;

    axios({
      method: "post",
      baseURL: `https://${host}`,
      url: `${endpoint}?client_id=${adobeapikey}`,
      headers: { Authorization: `Bearer ${accessToken}` },
      responseType: "json",
    })
      .then(function (response) {
        const ops = {
          user: passport.user(req),
          host: host,
          endpoint: endpoint,
          apiScopes: apiScopes,
          response: JSON.stringify(response.data, null, 4),
        };
        res.render("response", ops);
      })
      .catch(function (error) {
        console.log(error);
      });
  } else {
    res.render("index", { response: "You need to log in first" });
  }
});

module.exports = router;
