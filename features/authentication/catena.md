# Authentication with Catena

**CATENA** authentication uses a pre-defined list of username and password combinations. It's a good fit for secure development, QA or administration with small teams, or as a fallback for administration when a 3rd-party platform is unavailable. 

## Configuration

To use the CATENA provider with the Catena authentication service, make sure it is enabled in the configuration and `PlainPasswordFile` points to a file containing a list of username and password combinations.

```json
{
  "Catena": {
    "Authentication": {
      "PROVIDER_CATENA": {
        "PlainPasswordFile": "/path/to/a/password/file",
        "IsEnabled": true
      }
    }
  }
}
```

The plain password file should contain one username and password combination per line, ex:
```text
admin:secure
studio:changeme
```

When using a container or deploying Catena, make sure your password file is available but is still secure. It should not be checked into version control (git). For a docker container, the password file can be mounted into the container with a [bind mount](https://docs.docker.com/engine/storage/bind-mounts/).

## Usage

To authenticate with the Catena login, specify `PROVIDER_CATENA` in your authentication request and provide a username and password separated by a colon as the payload, for example: `username:password`.

{% admonition type="info" %}
**Note**: A successful authentication request will return an empty response body. The `catena-session-id` response header is what we're looking for here.
{% /admonition %}

## Code Sample
{% openapi-code-sample operationId="catena.catena_authentication.CatenaAuthentication_LoginWithProvider" descriptionFile="../../apis/catena-tools-core.yaml" requestBody={provider: "PROVIDER_CATENA", payload:"username:password"} /%}

## Send Request from This Page
{% replay-openapi operationId="catena.catena_authentication.CatenaAuthentication_LoginWithProvider" descriptionFile="../../apis/catena-tools-core.yaml" requestBody={provider: "PROVIDER_CATENA", payload:"username:password"} /%}
