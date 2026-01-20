# Authentication with Battle.net

## Prerequisites

Before configuring Catena to authenticate users with Battle.net, you must create a client in [Battle.net community API Access](https://community.developer.battle.net/).

To configure the client, you will need to provide Redirect URLs. This will be a combination of the PlatformUrl and the Battle.net RedirectUri - for example, when developing locally, this might look like (`http://localhost:5000
http://localhost:5000/api/v1/authentication/PROVIDER_BATTLENET_WEB/callback`)

You will need the "Client ID" and "Client Secret" from the created client to configure Catena.

## Catena configuration

Open the appsettings for your environment and look for the Catena authentication service configuration section which contains a section for Battle.net (`PROVIDER_BATTLENET_WEB`). If the section does not exist, you may need to create it.

Fill `ClientID` and `ClientSecret` with the values from the created Battle.net client. Set the `RedirectUri` to the one shown in the example below as a starting point and make sure `IsEnabled` is set to true.

For example, in `appsettings.Development.json`:

```json
{
  "Catena": {
    "Authentication": {
      "PROVIDER_BATTLENET_WEB": {
        "ClientID": "<your client ID>",
        "ClientSecret": "<your client secret>",
        "RedirectUri": "/api/v1/authentication/PROVIDER_BATTLENET_WEB/callback",
        "IsEnabled": true
      }
    }
  }
}
```