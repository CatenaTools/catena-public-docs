# Authentication with an email address

**EMAIL_SIGN_UP** is designed for players to register for an account with an email address and use that email address and a password to log in.

## Configuration

To use the email sign up provider with the Catena authentication service, make sure it is enabled in the configuration and the database `ConnectionString` is configured.

```json
{
  "Catena": {
    "Authentication": {
      "PROVIDER_EMAIL_SIGN_UP": {
        "ConnectionString": "Data Source=Build/SqliteDatabase/email_sign_up.db;Foreign Keys=True",
        "IsEnabled": true
      }
    }
  }
}
```

## Usage

To authenticate with a registered email address, specify `EMAIL_SIGN_UP` in your authentication request and the email address and password separated by a colon as the payload, for example: `address@mail.local:password`.

Refer to the following code samples.

{% admonition type="info" %}
**Note**: A successful authentication request will return an empty response body. The `catena-session-id` response header is what we're looking for here.
{% /admonition %}

## Code Sample
{% openapi-code-sample operationId="catena.catena_authentication.CatenaAuthentication_LoginWithProvider" descriptionFile="../../apis/catena-tools-core.yaml" requestBody={provider: "PROVIDER_EMAIL_SIGN_UP", payload:"address@mail.local:password"} /%}

## Send Request from This Page
{% replay-openapi operationId="catena.catena_authentication.CatenaAuthentication_LoginWithProvider" descriptionFile="../../apis/catena-tools-core.yaml" requestBody={provider: "PROVIDER_EMAIL_SIGN_UP", payload:"address@mail.local:password"} /%}
