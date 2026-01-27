# Authentication with Bungie.Net

## Prerequisites

Before configuring Catena to authenticate users with Bungie.Net, you must register an application in
<a href="https://www.bungie.net/en/Application" target="_blank" rel="noopener noreferrer">Bungie developer portal</a>

You will need the "OAuth client_id" and "OAuth client_secret" from the "API Key" from the bungie portal.

## Catena configuration

Open the appsettings for your environment and look for the Catena authentication service configuration section which contains a section for Bunige Games (`PROVIDER_BUNGIE_WEB`). If the section does not exist, you may need to create it.

Fill `ClientID` and `ClientSecret` with the values from the Bunige developer console. Set the `RedirectUri` to the one shown in the example below as a starting point and make sure `IsEnabled` is set to true.

{% admonition type="warning" %}
Ensure the RedirectUri url is **HTTPS** or callback will fail. 

Note: RedirectUri is case sensitive
{% /admonition %}

Note: PlatformUrl should match the base RedirectUri.
The Bungie redirect link is the host name + the config RedirectUri.

For example, if the catena host is `https://catena.example.com/`,
the url in Bungie developer portal would then be
`https://catena.example.com/api/v1/authentication/PROVIDER_BUNGIE_WEB/callback` -
which is a combination of the PlatformUrl and RedirectUri.

Here is an example config, `appsettings.Development.json`:
```json
{

  "Catena": {
    "PlatformUrl": "https://catena.example.com",
    ...
    "Authentication": {
      "PROVIDER_BUNGIE_WEB": {
        "ClientID": "<your client ID>",
        "ClientSecret": "<your client secret>",
        "ApiKey":"<bungie api key>",
        "RedirectUri": "/api/v1/authentication/PROVIDER_BUNGIE_WEB/callback",
        "IsEnabled": true
      }
    }
  }
}
```