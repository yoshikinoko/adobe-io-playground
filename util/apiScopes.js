const scopes = process.env.API_SCOPES;

const apiScopes = {
  openid: scopes.indexOf("openid") !== -1,
  AdobeID: scopes.indexOf("AdobeID") !== -1,
  creative_sdk: scopes.indexOf("creative_sdk") !== -1,
  lr_partner_apis: scopes.indexOf("lr_partner_apis") !== -1,
};

module.exports = apiScopes;
