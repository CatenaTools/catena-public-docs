# Authentication with Discord

## Prerequisites

Before configuring Catena to authenticate users with Discord, you must register an application in the [Discord developer dashboard](https://discord.com/developers/applications).

The authorization callback URL should be set to the `PlatformUrl` plus the `RedirectUri` for `PROVIDER_DISCORD_WEB`. If there is a difference between the value configured in the Discord dashboard and the one sent by Catena (from its configuration), then Discord will display an error ("Invalid OAuth2 redirect_uri") instead of an authorization page.

You will need the "client_id" and "client_secret" from the developer dashboard to configure Catena.

## Catena configuration

Open the appsettings for your environment and look for the Catena authentication service configuration section which contains a section for Discord (`PROVIDER_DISCORD_WEB`). If the section does not exist, you may need to create it.

Fill `ClientID` and `ClientSecret` with the values from the Discord developer dashboard. Set the `RedirectUri` to the one shown in the example below as a starting point and make sure `IsEnabled` is set to true.

For example, in `appsettings.Development.json`:

```json
{
  "Catena": {
    "Authentication": {
      "PROVIDER_DISCORD_WEB": {
        "ClientID": "<your client ID>",
        "ClientSecret": "<your client secret>",
        "RedirectUri": "/api/v1/authentication/PROVIDER_DISCORD_WEB/callback",
        "IsEnabled": true
      }
    }
  }
}
```
