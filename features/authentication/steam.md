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
Make sure your `appsettings.Development.json` is added to .gitignore

{% admonition type="warning" %} Do not commit real `ClientID`/`ClientSecret` values to version of `appsettings.json` or `appsettings.Production.json` — these files are part of your deployed source and shouldn't hold production secrets. Use `appsettings.Development.json` for local testing only. {% /admonition %}

### Setting secrets in production
For a live production deployment, you don't want to expose your secrets in the appsettings file. 

Catena provides 2 potential solutions for this.
- [Inline Encryption](../../features/inline-encryption/index.md) - This allows you to encrypt values in your `appsettings.json` so it can be commited and shared across the team with only one shared password stored offline.
- [Configuring Dokku Secrets](../../installation/aws-secret-management.md) - Using dokku, setup environment variables that are read in by the app

When using Dokku secrets, you can map the nested JSON values to a new environment variable.

For example, AppId maps too:

```
Catena__Authentication__Validators__PROVIDER_STEAM_WEB__AppId
```

Then ApiKey maps too:

```
Catena__Authentication__Validators__PROVIDER_STEAM_WEB__ApiKey
```

If deploying via the [AWS deployment guide](../../installation/aws-ec2.md), add these to your `dokku-secrets.env` file and run `./set-dokku-secrets.sh`. For more details view the [Secrets management page](../../installation/aws-secret-management.md). 

## Catena configuration for Steam login

Open the appsettings for your environment and look for the Catena authentication service configuration section which contains a section for Steam (`PROVIDER_STEAM`). If the section does not exist, you may need to create it.

Fill `AppId` and `ApiKey` with the values from Steamworks. The App ID is an integer, not a string, and should not have quotes. Add an auth identity; this can usually be set to "Catena". Make sure `IsEnabled` is set to true.

For example, in `appsettings.Development.json`:

```json
{
  "Catena": {
    "Authentication": {
      "Validators": {
        "PROVIDER_STEAM": {
          "SteamAuthIdentity": "Catena",
          "AppId": "<your app ID>",
          "ApiKey": "<your API key>",
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

For example, AppId maps too:

```
Catena__Authentication__Validators__PROVIDER_STEAM__AppId
```

Then ApiKey maps too:

```
Catena__Authentication__Validators__PROVIDER_STEAM__ApiKey
```

If deploying via the [AWS deployment guide](../../installation/aws-ec2.md), add these to your `dokku-secrets.env` file and run `./set-dokku-secrets.sh`. For more details and instructions on how to rotate secrets, view the [Secrets management page](../../installation/aws-secret-management.md). 