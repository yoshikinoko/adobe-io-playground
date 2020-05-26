const apiScopes = require("./apiScopes");
const passport = require("./passport");

const renderUtil = {};

renderUtil.response = function (
  req,
  res,
  response,
  links = null,
  showHeaders = false,
  defaultImageSrc = null
) {
  let data = null;
  let image = defaultImageSrc;
  let headers = null;
  const contentType = response.headers["content-type"];
  if (contentType === "image/jpeg") {
    // // Download as file.
    // res.setHeader("Content-disposition", "attachment; filename=image.jpeg");
    // res.setHeader("Content-Type", "image/jpeg");
    // res.send(Buffer.from(response.data));

    // Render preview(rendition) on the browser
    const base64 = Buffer.from(response.data, "binary").toString("base64");
    const prefix = `data:image/jpeg;base64,`;
    const imagesrc = prefix + base64;
    image = imagesrc;
  } else if (
    contentType === "application/json" ||
    contentType === "application/vnd.adobe.xd.v1+json; charset=utf-8"
  ) {
    data = JSON.stringify(response.data);
  } else {
    data = response.data;
  }

  if (showHeaders) {
    headers = JSON.stringify(response.headers);
  }

  const ops = {
    user: passport.user(req),
    host: response.api.host,
    endpoint: response.api.endpoint,
    apiScopes: apiScopes,
    links: links,
    image: image,
    response: data,
    headers: headers,
  };
  res.render("response", ops);
};

renderUtil.error = function (req, res, error) {
  console.error(error);
  const ops = {
    user: passport.user(req),
    apiScopes: apiScopes,
    response: JSON.stringify(error),
  };
  res.render("response", ops);
};

module.exports = renderUtil;
