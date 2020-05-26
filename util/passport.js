const passport = {};

passport.user = function (req) {
  if (req.isAuthenticated()) {
    return {
      displayName: req.session.passport.user.profile.displayName,
      email: req.session.passport.user.profile.emails[0].value,
    };
  } else {
    return null;
  }
};

module.exports = passport;
