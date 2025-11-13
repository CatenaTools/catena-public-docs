# Authentication with an enrolled device

**DEVICE** login is designed for authentication by a pre-enrolled device or a device that can register itself with a unique ID.

This mechanism does not prescribe the identifier or format to be used. For example, it may be an IMEI, an Android device ID, a machine ID, or a custom identifier.

## Configuration

To use the device provider with the Catena authentication service, make sure it is enabled in the configuration and the database `ConnectionString` is configured.

```json
{
  "Catena": {
    "Authentication": {
      "PROVIDER_DEVICE": {
        "ConnectionString": "Data Source=Build/SqliteDatabase/email_sign_up.db;Foreign Keys=True",
        "IsEnabled": true
      }
    }
  }
}
```

## Usage

To authenticate using a device, specify `PROVIDER_DEVICE` in your authentication request and provide the device identifier and its token/certificate separated by a colon as the payload.

For example, `c70044a8-4723-4060-ae4c-c2a03f385bd8:OTM2YmVhZWEtODk3Yi00N2YwLWFjMjgtNDQ3ODRjMTQwMzNhCg==` would be the payload for a device `c70044a8-4723-4060-ae4c-c2a03f385bd8` which was enrolled previously and received the token `OTM2YmVhZWEtODk3Yi00N2YwLWFjMjgtNDQ3ODRjMTQwMzNhCg==`.

Refer to the following code samples.

{% admonition type="info" %}
**Note**: A successful authentication request will return an empty response body. The `catena-session-id` response header is what we're looking for here.
{% /admonition %}

## Code Sample
{% openapi-code-sample operationId="catena.catena_authentication.CatenaAuthentication_LoginWithProvider" descriptionFile="../../apis/catena-tools-core.yaml" requestBody={provider: "PROVIDER_DEVICE", payload:"c70044a8-4723-4060-ae4c-c2a03f385bd8:OTM2YmVhZWEtODk3Yi00N2YwLWFjMjgtNDQ3ODRjMTQwMzNhCg=="} /%}

## Send Request from This Page
{% replay-openapi operationId="catena.catena_authentication.CatenaAuthentication_LoginWithProvider" descriptionFile="../../apis/catena-tools-core.yaml" requestBody={provider: "PROVIDER_DEVICE", payload:"c70044a8-4723-4060-ae4c-c2a03f385bd8:OTM2YmVhZWEtODk3Yi00N2YwLWFjMjgtNDQ3ODRjMTQwMzNhCg=="} /%}
