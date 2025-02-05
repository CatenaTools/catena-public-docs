---
markdown:
  toc:
    depth: 3
---

_If you would like to learn more about the general concept of Authentication, you can refer to our [Building a Multiplayer Backend: Authentication](https://blog.catenatools.com/building-a-multiplayer-backend-authentication/) blog post._

# Authentication
Catena supports a variety of Authentication methods designed for games of all types. This feature authenticates players using a specific identifier or third-party service, registering a session with Catena upon login.

## Engine Integration
This page is dedicated to explaining key concepts for authentication with Catena. If you are interested in how to authenticate within a particular game engine, refer to your engine's documentation.

* [Unity - Authentication](../../engines/unity/authentication.md)
* [Unreal - Authentication](../../engines/unreal/authentication.md)

## Login Types

Catena provides two types of authentication: **UNSAFE** and **PLATFORM**. These each use the same API, for simplicity's sake.

### Unsafe Login
**UNSAFE** login is designed to provide a low friction method for authenticating against Catena in development environments. This is done by specifying `PROVIDER_UNSAFE` in your authentication request and providing a username formatted with the `test` prefix, followed by two numbers (for example: `test01`).

To authenticate with an unsafe login, refer to the following code samples.

{% admonition type="info" %}
**Note**: A successful authentication request will return an empty response body. The `catena-session-id` response header is what we're looking for here.
{% /admonition %}

#### Code Sample
{% openapi-code-sample operationId="catena.catena_authentication.CatenaAuthentication_LoginWithProvider" descriptionFile="../../apis/catena-tools-core.yaml" /%}

#### Send Request from This Page
{% replay-openapi operationId="catena.catena_authentication.CatenaAuthentication_LoginWithProvider" descriptionFile="../../apis/catena-tools-core.yaml" /%}

### Platform Login
{% partial file="/_partials/coming-soon.md" /%}

## Advanced Topics

### How Catena Authentication Works

This section delves into how the Catena Authentication process works under the hood. Unless you are inspecting or modifying Catena source code, you are not required to understand its inner workings.

#### Creating a Session

The `AuthenticationService` is responsible for handling login requests from client applications sent via [LoginWithProvider](../../apis/catena-tools-core.yaml#operation/catena.catena_authentication.catenaauthentication_loginwithprovider).

Depending on the `provider` that is passed, the appropriate `IAuthValidator` is selected to validate the provided credentials. There are many auth validators to provide multiple methods for authenticating with Catena.

Upon successfully validating the credentials, we create a session. This session is stored in either **SQLite** or **Redis** depending on the `Catena.SessionStore.SessionProvider` that is configured in your `appsettings` file.

This session ID is returned to the client application in the response headers, as `catena-session-id`. The client is expected to cache this value, using it for subsequent requests to Catena.

<!-- TODO: More detailed description, including data flow sequence diagrams -->
<!-- TODO: Link to appsettings config documentation -->

#### Subsequent Requests
{% partial file="/_partials/coming-soon.md" /%}