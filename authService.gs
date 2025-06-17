
/**
 * Create a new OAuth service to facilitate accessing an API.
 * This example assumes there is a single service that the add-on needs to
 * access. Its name is used when persisting the authorized token, so ensure
 * it is unique within the scope of the property store. You must set the
 * client secret and client ID, which are obtained when registering your
 * add-on with the API.
 *
 * See the Apps Script OAuth2 Library documentation for more
 * information:
 *   https://github.com/googlesamples/apps-script-oauth2#1-create-the-oauth2-service
 *
 *  @return A configured OAuth2 service object.
 */
function getOAuthService() {
  const scriptProps = PropertiesService.getScriptProperties().getProperties();
  return OAuth2.createService('auth')
      .setAuthorizationBaseUrl('https://api.getjobber.com/api/oauth/authorize')
      .setTokenUrl('https://api.getjobber.com/api/oauth/token')
      .setClientId(scriptProps.GETJOBBER_CLIENT_ID)
      .setClientSecret(scriptProps.GETJOBBER_CLIENT_SECRET)
      .setScope('read write')
      .setCallbackFunction('authCallback')
      .setCache(CacheService.getUserCache())
      .setPropertyStore(PropertiesService.getUserProperties())
      .setParam('access_type', 'offline') // ✅ important
      .setParam('prompt', 'consent');     // ✅ forces refresh_token on every auth;
}

/**
 * Boilerplate code to determine if a request is authorized and returns
 * a corresponding HTML message. When the user completes the OAuth2 flow
 * on the service provider's website, this function is invoked from the
 * service. In order for authorization to succeed you must make sure that
 * the service knows how to call this function by setting the correct
 * redirect URL.
 *
 * The redirect URL to enter is:
 * https://script.google.com/macros/d/<Apps Script ID>/usercallback
 *
 * See the Apps Script OAuth2 Library documentation for more
 * information:
 *   https://github.com/googlesamples/apps-script-oauth2#1-create-the-oauth2-service
 *
 *  @param {Object} callbackRequest The request data received from the
 *                  callback function. Pass it to the service's
 *                  handleCallback() method to complete the
 *                  authorization process.
 *  @return {HtmlOutput} a success or denied HTML message to display to
 *          the user. Also sets a timer to close the window
 *          automatically.
 */
function authCallback(callbackRequest) {
  var service = getOAuthService();
  var authorized = service.handleCallback(callbackRequest);

  if (authorized) {
    var token = service.getAccessToken();
      const tokenInfo = service.getToken();
  Logger.log('Token Info: %s', JSON.stringify(tokenInfo));
    // Save to User Properties (or ScriptProperties if shared across users)
    var userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('JOBBER_ACCESS_TOKEN', token);
    return HtmlService.createHtmlOutput(
      `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        <h2>Authentication Successful!</h2>
        <p>You can now close this window.</p>
      </div>
     `
    );
  } else {
    return HtmlService.createHtmlOutput('Denied');
  }
}

/**
 * Unauthorizes the non-Google service. This is useful for OAuth
 * development/testing.  Run this method (Run > resetOAuth in the script
 * editor) to reset OAuth to re-prompt the user for OAuth.
 */
function resetOAuth() {
  getOAuthService().reset();
}
