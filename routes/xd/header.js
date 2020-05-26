const adobeXDCloudContentAPIKey = process.env.ADOBE_XD_CLOUD_CONTENT_API_KEY;

const header = {};

header.options = function (req) {
  const headers = {
    "X-API-Key": adobeXDCloudContentAPIKey,
  };

  if (req.isAuthenticated()) {
    const accessToken = req.session.passport.user.accessToken;
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
};

module.exports = header;
