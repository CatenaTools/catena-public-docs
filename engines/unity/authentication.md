---
markdown:
  toc:
    depth: 3
---

# Unity - Authentication

## Estimated Time
Configuring Catena authentication in your Unity project is estimated to take **<10 minutes**.

## Prerequisites
* You must be running Catena. It must be run locally or you must have it deployed somewhere. [Instructions for doing so can be found here](../../installation/index.md)
* You must have completed [the Unity Quickstart Guide](./quickstart.md)

## Adding Authentication
The first real call you'll want to make to Catena is authenticating a player to register a session. Catena supports a variety of authentication providers. For the purposes of this guide, we will be using our **UNSAFE** provider, which is used for development workflows.

For more information on Authentication in Catena, such as different authentication types, [refer to the Authentication documentation](../../features/authentication/index.md).

### Logging A Player In

1. Reminder, if you have not yet completed the [Unity Quickstart Guide](./quickstart.md), please do so now.
2. Determine the Scene you would like to add Catena to. We will henceforth refer to this as "your Scene".
3. Create an empty `GameObject` in your Scene.
    1. Rename it to `CatenaStatus`.
    2. Add a `TextMeshPro - Text` component to it.
4. Create an empty `GameObject` in your Scene.
    1. Rename this `GameObject` to `CatenaPlayer`.
    2. Add the `CatenaPlayer` component to your `GameObject`.
    3. Link the `CatenaStatus` object in the **Status Text** field.

#### What Is The Catena Player?
The **Catena Player** component houses functionality for operations related to a specific player.

5. Import the Catena Unity SDK to whatever Script you'd like to call Catena from.

<!-- TODO (@HF): csharp does not appear to be supported. determine how to enable it for better syntax highlighting -->
```c
using Catena.CatenaAuthentication;
using CatenaUnitySDK;
```

6. From the function you'd like to make calls to Catena from, write the following code.

<!-- TODO (@HF): csharp does not appear to be supported. determine how to enable it for better syntax highlighting -->
```c
var username = "test01";

var catenaPlayer = FindObjectOfType<CatenaPlayer>();
catenaPlayer.OnAccountLoginComplete += (object sender, Catena.CatenaAccounts.Account account) =>
{
    Debug.Log($"Player Logged In With ID: {account.Id}");
};

catenaPlayer.CompleteLogin(Provider.Unsafe, username); // This will trigger the catenaPlayer.OnAccountLoginComplete callback when login is completed
```

<!-- TODO: link to UNSAFE login docs -->
The `testXX` pattern is a specially recognized development username. By passing in `test01` to the `CompleteLogin` function, we perform a low-friction **UNSAFE** login for development environments. You may update this username to be any variation of `testXX` to login to different accounts.
### Logging A Player Out

Let's update the above code to first log a player in, and then immediately log that player out. Here is an entire class that ties it all together.

<!-- TODO (@HF): csharp does not appear to be supported. determine how to enable it for better syntax highlighting -->
```c
using UnityEngine;
using Catena.CatenaAuthentication;
using CatenaUnitySDK;

public class SceneManager : MonoBehaviour
{
    bool _playerLoggedIn = false;
    bool _loggingOut = false;

    void Start()
    {
        RegisterCallbacks();
        LoginPlayer();
    }

    void Update()
    {
        if (_playerLoggedIn && !_loggingOut)
        {
            LogoutPlayer();
        }
    }

    void RegisterCallbacks()
    {
        var catenaPlayer = FindObjectOfType<CatenaPlayer>();

        // Login Callback
        catenaPlayer.OnAccountLoginComplete += (object sender, Catena.CatenaAccounts.Account account) =>
        {
            Debug.Log($"Player Logged In With ID: {account.Id}");
            _playerLoggedIn = true;
        };

        // Logout Callback
        catenaPlayer.OnSessionInvalid += (_, _) =>
        {
            Debug.Log("Player Logged Out");
            _playerLoggedIn = false;
        };
    }

    void LoginPlayer()
    {
        var catenaPlayer = FindObjectOfType<CatenaPlayer>();

        var username = "test01";

        Debug.Log("Logging Player In");
        catenaPlayer.CompleteLogin(Provider.Unsafe, username);
    }

    void LogoutPlayer()
    {
        var catenaPlayer = FindObjectOfType<CatenaPlayer>();

        _loggingOut = true;

        Debug.Log("Logging Player Out");
        catenaPlayer.Logout();
    }
}
```

## What Next?
Now that you've successfully authenticated a player you can now make authenticated calls against Catena, such as matchmaking players together.

{% partial file="/_partials/unity/matchmaking-card.md" /%}