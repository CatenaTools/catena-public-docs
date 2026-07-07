# Authentication with Microsoft/Azure/Office 365

## Prerequisites

Before configuring Catena to authenticate users with Microsoft/Office 365, you must register an application in [Azure settings](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade).  

You will need the "Client ID", "Tenant ID" and "Client Secret" from Azure settings to configure Catena.

## Catena configuration

Open the appsettings for your environment and look for the Catena authentication service configuration section which contains a section for Microsoft/Azure/Office 365 (`PROVIDER_OFFICE365_WEB`). If the section does not exist, you may need to create it.

Fill `ClientID`, `OfficeTenantID`, and `ClientSecret` with the values from the Azure settings. Set the `RedirectUri` to the one shown in the example below as a starting point and make sure `IsEnabled` is set to true.

For example, in `appsettings.Development.json`:

```json
{
  "Catena": {
    "Authentication": {
      "Validators": {
        "PROVIDER_OFFICE365_WEB": {
          "ClientID": "<your client ID>",
          "OfficeTenantID": "<your tenant ID>",
          "ClientSecret": "<your client secret>",
          "RedirectUri": "/api/v1/authentication/PROVIDER_OFFICE365_WEB/callback",
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
Catena__Authentication__Validators__PROVIDER_OFFICE365_WEB__ClientID
```

Then ClientSecret maps too:

```
Catena__Authentication__Validators__PROVIDER_OFFICE365_WEB__ClientSecret
```

And OfficeTenantID maps too:

```
Catena__Authentication__Validators__PROVIDER_OFFICE365_WEB__OfficeTenantID
```

If deploying via the [AWS deployment guide](../../installation/aws-ec2.md), add these to your `dokku-secrets.env` file and run `./set-dokku-secrets.sh`. For more details and instructions on how to rotate secrets, view the [Secrets management page](../../installation/aws-secret-management.md). 