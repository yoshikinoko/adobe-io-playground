const AdobeStrategy = require("passport-adobe-oauth2").Strategy;
const cookieParser = require("cookie-parser");
const createError = require("http-errors");
const express = require("express");
const logger = require("morgan");
const passport = require("passport");
const path = require("path");
const session = require("express-session");
const { URL } = require("url");

const apiScopes = require("./util/apiScopes");
const lrCommon = require("./routes/lightroom/common");

const appHost = process.env.APP_HOST;
const appPort = process.env.PORT;

const appCallBackPath = "/auth/adobe/callback";
const appLoginPath = "/auth/adobe/login";
const appPathBase = "/";
const appLogoutPath = "/logout";

const routers = [
  ["/", require("./routes/index")],
  ["/csdk/profile", require("./routes/csdk/profile")],
  ["/lightroom/status", require("./routes/lightroom/servicestatus")],
  ["/lightroom/account", require("./routes/lightroom/account")],
  ["/lightroom/catalog", require("./routes/lightroom/catalog")],
  ["/lightroom/assets", require("./routes/lightroom/assets")],
  ["/lightroom/asset", require("./routes/lightroom/asset")],
  ["/lightroom/rendition", require("./routes/lightroom/rendition")],
  ["/lightroom/albums", require("./routes/lightroom/albums")],
  ["/lightroom/album", require("./routes/lightroom/album")],
  ["/lightroom/albumassets", require("./routes/lightroom/albumassets")],
  ["/lightroom/apilink", require("./routes/lightroom/apilink")],
  ["/xd/index", require("./routes/xd/index")],
  ["/xd/entry", require("./routes/xd/entry")],
  ["/xd/document", require("./routes/xd/document")],
  ["/xd/artboard", require("./routes/xd/artboard")],
];

const app = express();
const scopes = process.env.API_SCOPES;

const callbackURL = new URL(appCallBackPath, appHost);
if (appPort) {
  callbackURL.port = appPort;
}

const ADOBE_STRATEGY_CONFIG = {
  clientID: process.env.ADOBE_IO_CLIENT_ID,
  clientSecret: process.env.ADOBE_IO_CLIENT_SECRET,
  callbackURL: callbackURL.href,
  scope: scopes,
};

app.use(
  session({
    secret: "testing",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (profile, done) {
  done(null, profile);
});
passport.deserializeUser(function (profile, done) {
  done(null, profile);
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/bootstrap",
  express.static(path.join(__dirname, "node_modules/bootstrap"))
);
app.use("/jquery", express.static(path.join(__dirname, "node_modules/jquery")));
app.use(
  "/json-viewer",
  express.static(
    path.join(__dirname, "node_modules/jquery.json-viewer/json-viewer")
  )
);
// Use the AdobeStrategy within Passport.
// Strategies in Passport require a `verify` function, which accepts credentials
// (in this case, an accessToken, refreshToken, and Adobe profile)
// and invoke a callback with a user object.
passport.use(
  new AdobeStrategy(ADOBE_STRATEGY_CONFIG, function (
    accessToken,
    refreshToken,
    profile,
    done
  ) {
    // verify function below
    // asynchronous verification, for effect...
    process.nextTick(async function () {
      // To keep the example simple, the user's Adobe profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Adobe account with a user record in your database,
      // and return that user instead.
      // var  userId = profile.userId || profile.sub;

      // FIXME
      // Adobe's Passport Strategy does not return user profile. (e.g., emails, displayNames);
      if (!apiScopes.creative_sdk && apiScopes.lr_partner_apis) {
        const headers = {
          "X-API-Key": process.env.ADOBE_IO_CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
        };
        const response = await lrCommon.call("accounts", null, null, headers);
        profile.displayName = response.data.full_name;
        profile.emails = [
          {
            value: response.data.email,
            type: "main",
          },
        ];
      }
      const t = {
        profile: profile,
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
      return done(null, t);
    });
  })
);

// Sign in into Adobe ID
app.get(appLoginPath, passport.authenticate("adobe"));
app.get(
  appCallBackPath,
  passport.authenticate("adobe", { failureRedirect: appPathBase }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect(appPathBase);
  }
);

// logut
app.get(appLogoutPath, function (req, res) {
  req.logout();
  res.redirect(appPathBase);
});

routers.map((api) => app.use(api[0], api[1]));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
