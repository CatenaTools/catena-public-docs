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
```