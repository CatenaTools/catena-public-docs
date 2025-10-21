# Authentication with Twitch

## Prerequisites

Before configuring Catena to authenticate users with Twitch, you must register an application in the [Twitch developer console](https://dev.twitch.tv/docs/authentication/register-app).

You will need the "Client ID" and "Secret" from the developer console to configure Catena.

## Catena configuration

Open the appsettings for your environment and look for the Catena authentication service configuration section which contains a section for Twitch (`PROVIDER_TWITCH_WEB`). If the section does not exist, you may need to create it.

Fill `ClientID` and `ClientSecret` with the values from the Twitch developer console. Set the `RedirectUri` to the one shown in the example below as a starting point and make sure `IsEnabled` is set to true.

For example, in `appsettings.Development.json`:

```json
{
  "Catena": {
    "Authentication": {
      "PROVIDER_TWITCH_WEB": {
        "ClientID": "<your client ID>",
        "ClientSecret": "<your client secret>",
        "RedirectUri": "/api/v1/authentication/PROVIDER_TWITCH_WEB/callback",
        "IsEnabled": true
      }
    }
  }
}
```