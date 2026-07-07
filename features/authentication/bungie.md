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
      "Validators": {
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
}
```
Make sure your `appsettings.Development.json` is added to .gitignore

{% admonition type="warning" %} Do not commit real `ClientID`/`ClientSecret` values to version of `appsettings.json` or `appsettings.Production.json` — these files are part of your deployed source and shouldn't hold production secrets. Use `appsettings.Development.json` for local testing only. {% /admonition %}

### Setting secrets in production
For a live production deployment, you don't want to expose your secrets in the appsettings file.

Catena provides 2 potential solutions for this.
- [Inline Encryption](../../features/inline-encryption/index.md) - This allows you to encrypt values in your `appsettings.json` so it can be commited and shared across the team with only one shared password stored offline.
- [Configuring Dokku Secrets](../../installation/aws-secret-management.md) - Using dokku, setup environment variables that are read in by the app

When using Dokku secrets, you can map the nested JSON values to a new environment variable.

For example, ClientID maps too:

```
Catena__Authentication__Validators__PROVIDER_BUNGIE_WEB__ClientID
```

Then ClientSecret maps too:

```
Catena__Authentication__Validators__PROVIDER_BUNGIE_WEB__ClientSecret
```

And ApiKey maps too:

```
Catena__Authentication__Validators__PROVIDER_BUNGIE_WEB__ApiKey
```

If deploying via the [AWS deployment guide](../../installation/aws-ec2.md), add these to your `dokku-secrets.env` file and run `./set-dokku-secrets.sh`. For more details and instructions on how to rotate secrets, view the [Secrets management page](../../installation/aws-secret-management.md). 