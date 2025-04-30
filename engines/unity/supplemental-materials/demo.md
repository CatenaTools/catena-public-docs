---
markdown:
  toc:
    depth: 3
---

# Unity - Demo

## Using the Catena Unity SDK
As a companion to the Unity SDK, there is a [Catena Networking Demo](https://github.com/CatenaTools/catena-GalacticKittens-demo) that shows an example of how to integrate Catena into a Unity project. The base of the project is Unity's Galactic Kittens demo, with changes to add Authentication & Login, Matchmaking, and dedicated server support through Catena, along with examples for other Catena services.
The following sections are guides on how to use the demo, in order to demonstrate what integrating the SDK into a game project would look like.

## Prerequisites
* You must be running Catena. It must be run locally or you must have it deployed somewhere. [Instructions for doing so can be found here](../../../installation/index.md)

### Authentication & Login

As the first step to working with most other services in Catena, the player must first log in. In the demo, the other online Catena functions are hidden until the player has logged in.

First, start by opening the Catena Galactic Kittens Demo project. Once open, if you navigate to the scene `Assets/Scenes/Menu.unity` you will see the gameobjects `CatenaEntrypoint` and `CatenaPlayer`, which have their respective components added - the key components required for logging in to Catena.

On the MenuController gameobject, you will see the Menu Manager component, which has a few changes made for logging in/out, as well as matchmaking and entitlements (with entitlements being behind a feature flag).

In order to test the authentication and login flow, complete the following steps:

1. Ensure that Catena is up and running. [Instructions for doing so can be found here](../../installation/index.md).
2. Navigate to the scene `Assets/Scenes/Bootstrap.unity` - **going forward, whenever you want to run the game in the editor, start from this scene**.
3. Find the `CatenaEntrypoint`, and in the `CatenaEntrypoint` component, configure the **Catena Endpoint URL** to point to your running instance of Catena. If you don't yet have a running instance of Catena, refer to the [How to Run Catena](../../../installation/index.md) documentation. (If you are running Catena locally, the default Endpoint Url should be the same.)
4. Click play, then on the menu screen, type in a username - it can be anything in the format of `test#`, replacing the # with any number.
{% admonition type="info" name="Why the test# username?" %}
The `testXX` pattern is a specially recognized development username. By passing in `test01` to the `CompleteLogin` function, we perform a low-friction **UNSAFE** login for development environments. You may update this username to be any variation of `testXX` to login to different accounts.
{% /admonition %}


At this point, you should be logging in! You will see the text in the bottom left update - first to display your session ID after completing the authentication, and then displaying your entered username and your account ID after logging in. You should also see the menu controls change to show the 'online' controls.

To see the steps of how to integrate authentication in to your project, check out [the Unity Quickstart Guide](../quickstart.md) and [the Unity Authentication Guide](../authentication.md).

### Matchmaking

Once the player is logged in, they are able to use the matchmaking system to enter a game through `CatenaPlayer`. There are two options for how to handle matchmaking - either peer to peer, or a dedicated server. [The Peer to Peer Guide can be found here](../matchmaking/peer-to-peer.md), and [the Dedicated Server guide can be found here](../matchmaking/game-servers.md).

#### Peer to Peer
Before being able to start matchmaking, you must ensure that the backend is configured to have the queues and hooks that you require. This config file can be found in the `Appsettings.Development.json` file in catena-tools-core. For peer to peer matchmaking in the demo, ensure that you have a Matchmaking Queue with the name `team_of_2` with teams set to 1 and player per team set to 2, as well as the custom hook of `SimpleP2PMatchmakingHooks` - it should look something like this:

```json
{
  "Catena": {
    ...
    "Matchmaker": {
      "MatchmakingQueues": {
        "team_of_2": {
          "QueueName": "team_of_2",
          "Teams": 1,
          "PlayersPerTeam": 2,
          "TicketExpirationSeconds": 180,
          "CustomHooks": "SimpleP2PMatchmakingHooks"
        },
      },
      "StatusExpirationMinutes": 15
    }
    ...
  }
}
```

In the Galactic Kittens sample, the default mode for matches is peer-to-peer, with one of the clients hosting the game, and another client joining. In order to matchmake into a peer-to-peer session, open two instances of the game (creating a build and opening multiple instances of the game is an easy way to accomplish this). Once logged in, the player can click the Find button, which will start the matchmaking process - and once both players are matchmaking, they should find eachother and load into the character select screen.

#### Dedicated Server

In order to have a dedicated server for the game, you must build one for the demo - to do so, in the build settings, change the platform to `Dedicated Server` and then build. 

You will also need to make sure the config is set up in such a way to enable matchmaking into a dedicated server. This involves two parts of the config: The matchmaking queues, and the match broker. To set up the queues, add a queue similar to the one above, but omitting the custom hook:
```json
{
  "Catena": {
    ...
    "Matchmaker": {
      "MatchmakingQueues": {
        "team_of_2": {
          "QueueName": "team_of_2",
          "Teams": 1,
          "PlayersPerTeam": 2,
          "TicketExpirationSeconds": 180
        },
      },
      "StatusExpirationMinutes": 15
    }
    ...
  }
}
```

You will also need to set up a match broker. For our case, we will not need an allocator, as the server itself will poll for available matches - so the config should only need the following:
```json
{
  "Catena": {
    ...
    "MatchBroker": {
      "FastSchedule": 1,
      "ServerMaxLifetimeMinutes": 10,
      "MatchPickupTimeSeconds": 90,
      "MatchReadyTimeSeconds": 30,
      "MatchMaxRunTimeMinutes": 120,
      "ScheduleFrequencySeconds": 30,
      "DelayAllocationSeconds": 30,
      "Allocators": []
    }
    ...
  }
}
```

For more information on the different methods for setting up a match broker, see [the Matchmaking Into Dedicated Game Servers guide here](../matchmaking/game-servers.md).


In the Catena Galactic Kittens demo, there are a few changes made to allow dedicated server support. When running the server build, it will register itself with Catena, making it open to have players connect for matches. To see where this is done, you may navigate to the scene `Assets/Scenes/CharacterSelection.unity`, where you will see the added gameobject/component for `CatenaSingleMatchGameServer`.

For ending the match, there is a prefab located at `Assets//Prefabs//EndGameManager.prefab`, which handles the end of the match in both the Victory and Defeat scenes. For the dedicated server, it waits until the clients disconnect before shutting down, seen in `EndGameManager.cs`. In this example, the function is called from the Unity Network Manager's `OnClientDisconnectCallback` event, and `m_connectedClients` containing the list of connected client Id's:

To see the dedicated server matchmaking in action, perform the steps in the following order:

1. Ensure Catena is running, and is properly configured with the matchmaking and match broker settings.
2. Run the executable for the Galactic Kittens server build.
3. Open 2 instances of the game Galactic Kittens, and log in with both to different test accounts (test1 and test2 will suffice)
4. Click find match on both game instances, and watch as they are placed into a match hosted by the server!

### Entitlements

While not integrated into the game itself, the main menu of the Galactic Kittens demo has functionality to display entitlements information, as well as debug functionality to prepare and execute offers - something that should normally only be done from a trusted game server.

In order to enable the entitlements functionality in the demo, you will need to go to `Project Settings > Player > Scripting Define Symbols` and add a defintion for `ENABLE_CATENA_ENTITLEMENTS`. This will allow the UI for entitlements to appear on the main menu screen - but for actual information to be shown, entitlements and offers need to be created. The items and offers need to be configured outside - for more information on how to configure items and offers, refer to the Entitlements documentation.
<!-- Add in this link when it exists: [refer to the Entitlements documentation](../../features/entitlements/index.md). -->

Once items and offers are set up, in order to see their functionality in game, you must make some calls through Catena itself - giving the player items, and getting an API key for preparing/executing offers.

#### Client Entitlements Functionality - Getting Catalog

The demo has the basic functionality of listing all the items that are currently in a players Catalog. Normally, the items would be added to a player's catalog through means outside of their client - whether it be from executing offers, or entitlements given from other outside services.
To see an example how a player's inventory would function, log in to Catena with a test account, and get the account ID. Then, using the admin endpoints, give the account some items. Once this is complete, if you return to the game, you should see the list of items appear on the list of player items after clicking `Get Catalog`.

#### Server Entitlements Functionality - Offers

To see how preparing and executing offers would function, you first need to set up an API key with the proper permissions for offers - information on how to do this can be found in the API documentation. Once you have an API key, if you navigate to the bootstrap scene and locate the `CatenaEntrypoint` object, you should see a section in the `CatenaEntrypoint` component for the `Catena Server Api Test Key`. **This field is intended to only be used for debug purposes** - in normal circumstances, only trusted sources should have API keys, and those API keys should be retrieved from elsewhere - but for now, pasting an API key in this field allows for easier testing of the server entitlements functionality.
<!-- Add in link to API documentation! -->

At this point, when launching into the main menu, you should be able to click `Prepare Offers` - and after doing so, a list of all the offers you have configured should appear. You can then click on any of the offers to attempt to execute them!

To see the steps of how to integrate entitlements in to your project, check out [the Unity Entitlements Guide](../entitlements.md).

### Parties

Similar to Entitlements, the Unity demo does have the ability to display Parties functionality, although it's not integrated into the game itself - and is only for appearance in the UI. In order to enable the parties functionality in the demo, you will need to go to `Project Settings > Player > Scripting Define Symbols` and add a defintion for `ENABLE_CATENA_PARTIES`. This will allow the Party UI to appear after completing login in the main menu.

Testing the parties functionality does not require any setup - the only configuration required in the Catena backend is to make sure that the parties service is enabled, and a Connection String is defined for the parties database. To learn more about setting up Parties in Catena, refer to the Parties documentation.
<!-- Add in link to Parties documentation! -->

Once Catena is up and running, to test the parties functionality, you must first run at least 2 instances of the game (but more than 2 are supported, if you desire). Log in to each game instance, and pick one of the game instances to be the 'host'. For this game instance, click `Create Party` - and you should soon see the active party UI. You can then copy the Invite code displayed on the UI, and paste that code into the other game instances and click `Join Party`.

At this point, you should see all of the players connected to the same party. From each instance, you can select a character - which demonstrates the functionality for creating and updating metadata of party members. Each instance can also click to ready up, and unready - which will be reflected in the UI for all players. The host will also have controls displayed next to each other party member - one button for kicking the player, and another for setting the player as host. Using all these options, you should be able to test the various endpoints that are available for parties.

To see the steps of how to integrate parties in to your project, check out [the Unity Parties Guide](../parties.md).