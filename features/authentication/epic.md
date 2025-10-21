# Authentication with Epic Games

## Prerequisites

Before configuring Catena to authenticate users with Epic Games, you must register an application in [Epic Games developer console]( https://dev.epicgames.com/).

You will need the "Client ID" and "Client Secret" from the "TrustedServer" found in "EOS SDK Credentials" to configure Catena.

## Catena configuration

Open the appsettings for your environment and look for the Catena authentication service configuration section which contains a section for Epic Games (`PROVIDER_EPIC_WEB`). If the section does not exist, you may need to create it.

Fill `ClientID` and `ClientSecret` with the values from the Epic Games developer console. Set the `RedirectUri` to the one shown in the example below as a starting point and make sure `IsEnabled` is set to true.

For example, in `appsettings.Development.json`:

```json
{
  "Catena": {
    "Authentication": {
      "PROVIDER_EPIC_WEB": {
        "ClientID": "<your client ID>",
        "ClientSecret": "<your client secret>",
        "RedirectUri": "/api/v1/authentication/PROVIDER_EPIC_WEB/callback",
        "IsEnabled": true
      }
    }
  }
}
```