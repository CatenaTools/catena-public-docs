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

### Catena (standalone)
Catena itself provides several standalone types of authentication:

* [UNSAFE](unsafe.md) - A low-friction method for authenticating in development environments
* [CATENA](catena.md) - Username and password from a pre-defined list; good for administrators
* [DEVICE](device.md) - Create a session from a known device ID; good for playtest systems or unique device IDs
* [EMAIL_SIGN_UP](email_sign_up.md) - For players who have signed up with an email address.

### Platform Login

Catena also supports logins with the following platforms:

* [Amazon](amazon.md)
* Apple
* [Battle.net](battlenet.md)
* [Bungie](bungie.md) 
* [Discord](discord.md)
* [Epic Games](epic.md)
* [Google](google.md)
* [Itch.io](itch.md)
* [Microsoft/Azure/Office 365](microsoft.md)
* [Steam](steam.md)
* [Twitch](twitch.md)

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