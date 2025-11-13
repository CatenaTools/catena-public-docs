# Authentication with Catena unsafe

**UNSAFE** login is designed to provide a low friction method for authenticating against Catena in development environments. An unsafe credential is created on the fly when it is first used, has no password, and does not require a database.

## Configuration

To use the unsafe provider with the Catena authentication service, make sure it is enabled in the configuration.

```json
{
  "Catena": {
    "Authentication": {
      "PROVIDER_UNSAFE": {
        "IsEnabled": true
      }
    }
  }
}
```

## Usage

To authenticate with an unsafe login, specify `PROVIDER_UNSAFE` in your authentication request and provide a username formatted with the `test` prefix, followed by two numbers (for example: `test01`).

Refer to the following code samples.

{% admonition type="info" %}
**Note**: A successful authentication request will return an empty response body. The `catena-session-id` response header is what we're looking for here.
{% /admonition %}

## Code Sample
{% openapi-code-sample operationId="catena.catena_authentication.CatenaAuthentication_LoginWithProvider" descriptionFile="../../apis/catena-tools-core.yaml" requestBody={provider: "PROVIDER_UNSAFE", payload:"test01"} /%}

## Send Request from This Page
{% replay-openapi operationId="catena.catena_authentication.CatenaAuthentication_LoginWithProvider" descriptionFile="../../apis/catena-tools-core.yaml" requestBody={provider: "PROVIDER_UNSAFE", payload:"test01"} /%}
