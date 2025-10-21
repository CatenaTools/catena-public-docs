# Authentication with Steam

Catena can authenticate players

## Prerequisites

Before configuring Catena to authenticate users with the Steam, you must have an App ID and create an API key on Steamworks using "Users and Permissions" and a group.

You will need your App ID and the API key from to configure Catena. This applies to either web browser login or game clients launched from Steam.

## Catena configuration for web browser login

Open the appsettings for your environment and look for the Catena authentication service configuration section which contains a section for Steam (`PROVIDER_STEAM_WEB`). If the section does not exist, you may need to create it.

Fill `AppId` and `ApiKey` with the values from Steamworks. The App ID is an integer, not a string, and should not have quotes. Set the `RedirectUri` to the one shown in the example below as a starting point and make sure `IsEnabled` is set to true.

For example, in `appsettings.Development.json`:

```json
{
  "Catena": {
    "Authentication": {
      "PROVIDER_STEAM_WEB": {
        "AppId": <your app ID>,
        "ApiKey": "<your API key>",
        "RedirectUri": "/api/v1/authentication/PROVIDER_STEAM_WEB/callback",
        "IsEnabled": true
      }
    }
  }
}
```

## Catena configuration for Steam login

Open the appsettings for your environment and look for the Catena authentication service configuration section which contains a section for Steam (`PROVIDER_STEAM`). If the section does not exist, you may need to create it.

Fill `AppId` and `ApiKey` with the values from Steamworks. The App ID is an integer, not a string, and should not have quotes. Add an auth identity; this can usually be set to "Catena". Make sure `IsEnabled` is set to true.

For example, in `appsettings.Development.json`:

```json
{
  "Catena": {
    "Authentication": {
      "PROVIDER_STEAM": {
        "SteamAuthIdentity": "Catena",
        "AppId": <your app ID>,
        "ApiKey": "<your API key>",
        "IsEnabled": true
      }
    }
  }
}
```