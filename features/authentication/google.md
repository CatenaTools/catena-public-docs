# Authentication with Google

## Prerequisites

Before configuring Catena to authenticate users with Google, you must register an application in the [Google API console](https://developers.google.com/identity/protocols/oauth2#1.-obtain-oauth-2.0-credentials-from-the-dynamic_data.setvar.console_name).

The authorization callback URL should be set to the `PlatformUrl` plus the `RedirectUri` for `PROVIDER_GOOGLE_WEB`. If there is a difference between the value configured in the Google API console and the one sent by Catena (from its configuration), then Google will display an error ("Error 400: redirect_uri_mismatch") instead of an authorization page.

You will need the "client_id" and "client_secret" from the API console to configure Catena.

## Catena configuration

Open the appsettings for your environment and look for the Catena authentication service configuration section which contains a section for Google (`PROVIDER_GOOGLE_WEB`). If the section does not exist, you may need to create it.

Fill `ClientID` and `ClientSecret` with the values from the Google API console. Set the `RedirectUri` to the one shown in the example below as a starting point and make sure `IsEnabled` is set to true.

For example, in `appsettings.Development.json`:

```json
{
  "Catena": {
    "Authentication": {
      "PROVIDER_GOOGLE_WEB": {
        "ClientID": "<your client ID>",
        "ClientSecret": "<your client secret>",
        "RedirectUri": "/api/v1/authentication/PROVIDER_GOOGLE_WEB/callback",
        "IsEnabled": true
      }
    }
  }
}
```
