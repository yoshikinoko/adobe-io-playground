const adobeapikey = process.env.ADOBE_IO_CLIENT_ID;

const header = {};

header.options = function (req) {
  const accessToken = req.session.passport.user.accessToken;
  const headers = {
    "X-API-Key": adobeapikey,
    Authorization: `Bearer ${accessToken}`,
  };
  return headers;
};

module.exports = header;
