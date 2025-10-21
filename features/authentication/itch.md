# Authentication with itch.io

## Prerequisites

Before configuring Catena to authenticate users with itch.io, you must register an application in the [itch.io user settings](https://itch.io/docs/api/oauth#registering-an-oauth-application).

The authorization callback URL should be set to the `PlatformUrl` plus the `RedirectUri` for `PROVIDER_ITCH_WEB`. If there is a difference between the value configured in the itch.io user settings and the one sent by Catena (from its configuration), then itch.io will display an error instead of an authorization page.

You will need the "Client ID" and "Secret" from the user settings to configure Catena.

## Catena configuration

Open the appsettings for your environment and look for the Catena authentication service configuration section which contains a section for itch.io (`PROVIDER_ITCH_WEB`). If the section does not exist, you may need to create it.

Fill `ClientID` and `ClientSecret` with the values from the itch.io user settings. Set the `RedirectUri` to the one shown in the example below as a starting point and make sure `IsEnabled` is set to true.

For example, in `appsettings.Development.json`:

```json
{
  "Catena": {
    "Authentication": {
      "PROVIDER_ITCH_WEB": {
        "ClientID": "<your client ID>",
        "ClientSecret": "<your client secret>",
        "RedirectUri": "/api/v1/authentication/PROVIDER_ITCH_WEB/callback",
        "IsEnabled": true
      }
    }
  }
}
```