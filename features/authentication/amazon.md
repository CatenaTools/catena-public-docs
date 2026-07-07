# Authentication with Amazon

{% admonition type="info" %}
This uses "Login with Amazon", not AWS.
{% /admonition %}

## Prerequisites

Before configuring Catena to authenticate users with Amazon, you must create a security profile in the [Amazon Developer Console](https://developer.amazon.com/docs/login-with-amazon/register-web.html).

You will need the "Client ID" and "Client Secret" from the security profile to configure Catena.

## Catena configuration

Open the appsettings for your environment and look for the Catena authentication service configuration section which contains a section for Amazon: `PROVIDER_AMAZON_WEB`. If the section does not exist, you may need to create it.

Fill `ClientID` and `ClientSecret` with the values from your security profile on Amazon. Set the `RedirectUri` to the one shown in the example below as a starting point and make sure `IsEnabled` is set to true.

For example, in `appsettings.Development.json`:

```json
{
  "Catena": {
    "Authentication": {
      "Validators": {
        "PROVIDER_AMAZON_WEB": {
          "ClientID": "<your client ID>",
          "ClientSecret": "<your client secret>",
          "RedirectUri": "/api/v1/authentication/PROVIDER_AMAZON_WEB/callback",
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
{% partial file="/_partials/aws/manage-secrets-production.md" variables={
    json_path: "Catena__Authentication__Validators__PROVIDER_AMAZON_WEB"
}  /%}