---
markdown:
  toc:
    depth: 3
---

# Unity - Matchmaking Into Dedicated Game Servers
Matchmaking into dedicated game servers is necessary when your game requires a trusted authority to track game state during your moment to moment gameplay.

## Prerequisites
* You must be running Catena. It must be run locally or you must have it deployed somewhere. [Instructions for doing so can be found here](/installation/index.md)
* You must have completed the [Unity Authentication Guide](../authentication.md)

## Configuring The Catena Backend

### The Matchmaker
{% partial file="/_partials/unity/matchmaking-configuring-the-catena-backend.md" /%}

```json
{
  "Catena": {
    ...
    "Matchmaker": {
      "MatchmakingQueues": {
        "solo": {
          "QueueName": "Solo",
          "Teams": 1,
          "PlayersPerTeam": 1,
          "TicketExpirationSeconds": 180
        },
        "1v1": {
          "QueueName": "1v1 (Face Off)",
          "Teams": 2,
          "PlayersPerTeam": 1,
          "TicketExpirationSeconds": 180
        }
      },
      "StatusExpirationMinutes": 15
    }
    ...
  },
  "PreferredImplementations": {
    ...
    "ICatenaMatchmaker": "!CatenaMatchmaker"
    ...
  }
}
```

### The Match Broker

When matchmaking players into dedicated game servers, you will also need to configure the **Match Broker** in the Catena Backend. This configuration will differ depending on the needs of your game. Refer to the [Catena Match Broker documentation](/features/game-servers/index.md) for more information.

For ease of testing for a first time integration, we recommend starting with a [CatenaLocalBareMetalAllocator](/features/game-servers/index.md#catenalocalbaremetalallocator) **Match Broker** configuration that will start and manage game server processes alongside the Catena backend. If you would like to provision game servers using another method, you may refer to the [available match broker allocator configuration options](/features/game-servers/index.md#available-configuration-options).

```json
"Catena": {
    ...
    "MatchBroker": {
        "FastSchedule": 1,
        "ServerMaxLifetimeMinutes": 10,
        "MatchPickupTimeSeconds": 90,
        "MatchReadyTimeSeconds": 30,
        "MatchMaxRunTimeMinutes": 10,
        "ScheduleFrequencySeconds": 30,
        "DelayAllocationSeconds": 30,
        "Allocators": [
            {
                "Allocator":"CatenaLocalBareMetalAllocator",
                "AllocatorDescription": "Human Readable Description",
                "Configuration": {
                    "GameServerPath": "<full-path-to-game-server-executable>",
                    "GameServerArguments": "<optional-arguments-for-game-server>",
                    "GameServerEnvironment": {},
                    "ReadyDeadlineSeconds": 30,
                    "ReaperConfiguration": {
                        "AllocatorReaperPeriodSeconds": 10,
                        "MaxRunTimeMinutes": 125
                    }
                },
                "Requirements": ""
            }
        ]
    }
    ...
}
```

{% admonition type="warning" %}
    If you have deployed Catena to Heroku, the `CatenaLocalBareMetalAllocator` is not supported. If you would like to run this allocator, refer to [Installation Options](/installation/index.md) to deploy Catena using a different configuration.

    Please ensure your game server's executable is co-located with the Catena backend, or else it will not be able to run it.
{% /admonition %}

# Configuring Your Dedicated Game Server
Your game server will need to be configured to communicate with your running Catena backend.

1. In the Scene that launches when the game server is run, add a new empty `GameObject` and call it `CatenaSingleMatchGameServer`.
2. Add a component to that `GameObject`, selecting the `CatenaSingleMatchGameServer` script.

In whatever your main script is to manage your Scene, such as `SceneManager.cs` if you are using the [Supplemental Material](/engines/unity/supplemental-materials/mirror.md) guide, add the following:

```c
private CatenaSingleMatchGameServer _catenaSingleMatchGameServer;

void Awake()
{
#if UNITY_SERVER
    // Start up game server, using whatever netcode solution you prefer

    // Tell Catena we are ready for a match
    _catenaSingleMatchGameServer = CatenaSingleMatchGameServer.Instance;
    _catenaSingleMatchGameServer.GetMatch();
#endif
}
```

# Matchmaking A Player
Reminder, if you have not yet completed the [Unity Authentication Guide](../authentication.md), please do so now. Once a player has authenticated against Catena and registered a session, they can then begin matchmaking.

To initiate matchmaking, you first need to register callbacks:
<!-- TODO (@HF): csharp does not appear to be supported. determine how to enable it for better syntax highlighting -->
```c
var catenaEntrypoint = FindObjectOfType<CatenaEntrypoint>();
var catenaPlayer = FindObjectOfType<CatenaPlayer>();

// Matchmaking Started Callback
catenaEntrypoint.OnStartMatchmakingCompleted += (_, matchmakingEventArgs) =>
{
  string logString =
    $"Matchmaking began with (Ticket ID: {matchmakingEventArgs.MatchmakingTicketId}), (Status Success: {matchmakingEventArgs.Status.Success})";
  if (!matchmakingEventArgs.Status.Success)
  {
    logString += ", (Status Message: {matchmakingEventArgs.Status.Message})";
  }
  Debug.Log(logString);
};

// Matchmaking Finished Callback
catenaPlayer.OnFindingServer += (_, eventData) =>
{
  if (eventData == null)
  {
    Debug.Log("Failed to find a match");
    return;
  }

  if (eventData == "")
  {
    Debug.Log("Found a match; waiting for a server");
    return;
  }
};

// Server Found Callback
catenaPlayer.OnFoundServer += (_, connectionDetails) =>
{
  Debug.Log($"Found a server - connection details: {connectionDetails}");

  var parts = connectionDetails.Split(":");
  var ip = parts[0];
  var port = ushort.Parse(parts[1]);
  
  // You may now connect to the ip and port, joining the match
};

// Cancel Matchmaking Callback
catenaEntrypoint.OnCancelMatchmakingCompleted += (_, status) =>
{
  if (!status.Success)
  {
    Debug.LogError($"Failed to cancel matchmaking: {status.Message}");
    return;
  }

  Debug.Log("Cancel Matchmaking Complete");
};
```

Once your callbacks are registered, you can initiate matchmaking by:

<!-- TODO (@HF): csharp does not appear to be supported. determine how to enable it for better syntax highlighting -->
```c
var catenaPlayer = FindObjectOfType<CatenaPlayer>();

// The Catena Matchmaker will match the player into the queue provided here
var queue_name = "solo";
var matchMetadata = new Dictionary<string, EntityMetadata> { { "queue_name", new EntityMetadata { StringPayload = queue_name } } };
var playerMetadata = new Dictionary<string, EntityMetadata>();

catenaPlayer.EnterMatchmaking(playerMetadata, matchMetadata);
```

You can cancel matchmaking by:

<!-- TODO (@HF): csharp does not appear to be supported. determine how to enable it for better syntax highlighting -->
```c
var catenaEntrypoint = FindObjectOfType<CatenaEntrypoint>();
var ticketId = "<your-ticket-id>";
catenaEntrypoint.CancelMatchmaking(ticketId);
```

## A Practical Example
{% partial file="/_partials/unity/practical-example-preamble.md" /%}

### Estimated Time
Configuring a practical example should take you **<30 minutes**.

### Prerequisites
* You must be running Catena. It must be run locally or you must have it deployed somewhere. [Instructions for doing so can be found here](/installation/index.md)
* Complete the [Mirror Networking Guide](../supplemental-materials/mirror.md)
  * _This guide shows you how to set up an networked game MVP in Unity in less than 10 minutes. **Mirror is not a requirement to use Catena Matchmaking, it is only used in these docs to show you a functional example of how to proceed after matchmaking**_

### Configure Non-Matchmaking Portions
1. Add authentication to the Mirror Sample by using the [Unity Authentication Guide](../authentication.md)
2. Remove the `Network Manager HUD` from your `NetworkManager` object

### Add Matchmaking
1. Replace the contents of your `SceneManager.cs` file with the below code

<!-- TODO (@HF): csharp does not appear to be supported. determine how to enable it for better syntax highlighting -->
```c
using System;
using System.Collections;
using System.Collections.Generic;
using Catena.Groups;
using UnityEngine;
using CatenaUnitySDK;
using Mirror;
using Newtonsoft.Json;

public class SceneManager : MonoBehaviour
{
    // Authentication
    private bool _playerLoggedIn = false;
    private string _username = "test01"; // default "UNSAFE" username
    
    // Matchmaking
    private bool _isMatchmaking = false;
    private int _selectedMatchmakingQueueIndex = 0;
    private readonly string[] _matchmakingQueues = { "solo", "1v1" };
    private string _ticketID;

    // ConnectionInfo is used to deserialize the returned match
    private class ConnectionInfo
    {
        public string Ip;
        public ushort Port;
    }
    
    // Server Travel
    private bool _transitionClient = false;
    private ConnectionInfo _clientConnectionInfo;
    
    // Running as Server
    private CatenaSingleMatchGameServer _catenaSingleMatchGameServer;

    void Awake()
    {
#if UNITY_SERVER
        Debug.Log("Running as dedicated server");
        
        // Start the server
        NetworkManager.singleton.StartServer();
        
        // Tell Catena we are ready for a match
        _catenaSingleMatchGameServer = CatenaSingleMatchGameServer.Instance;
        _catenaSingleMatchGameServer.GetMatch();
#endif
    }

    void Start()
    {
#if !UNITY_SERVER
        Debug.Log("Running as game client");
        RegisterCallbacks();
#endif
    }

    void Update()
    {
        if (_transitionClient)
        {
            Debug.Log("Starting Client"); 
            
            _transitionClient = false;
            
            // We found a server, we no longer need the ticket ID
            _ticketID = null;
            _isMatchmaking = false;
            
            if (Transport.active is PortTransport portTransport)
            {
                NetworkManager.singleton.networkAddress = _clientConnectionInfo.Ip;
                portTransport.Port = _clientConnectionInfo.Port;

                NetworkManager.singleton.StartClient();
            }
            else
            {
                Debug.LogError("For the purposes of this demo, please use the Telepathy Transport on your NetworkManager");
            }
        }
    }

    void OnGUI()
    {
        GUILayout.BeginArea(new Rect(10, 10, Screen.width - 20, Screen.height - 20));

        if (_transitionClient) // We are connecting to a server, hide all controls during the transition
        {
            GUILayout.Label("Connecting To Match...");
        }
        else if (_playerLoggedIn)
        {
            if (!_isMatchmaking && !NetworkServer.active && !NetworkClient.isConnected) // Hide logout if in a match or matchmaking
            {
                GUILayout.Label("Authentication");
                if (GUILayout.Button("Log Out"))
                {
                    LogoutPlayer();
                }
            }

            GUILayout.Label("Matchmaking");
            if (_isMatchmaking)
            {
                if (GUILayout.Button("Cancel Matchmaking"))
                {
                    var catenaEntrypoint = FindObjectOfType<CatenaEntrypoint>();
                    catenaEntrypoint.CancelMatchmaking(_ticketID);
                }
            }
            else if (NetworkClient.isConnected) // We are a client
            {
                if (GUILayout.Button("Leave Match"))
                {
                    NetworkManager.singleton.StopClient();
                }
            }
            else // We are not matchmaking and we are not connected to anything
            {
                _selectedMatchmakingQueueIndex = GUILayout.SelectionGrid(_selectedMatchmakingQueueIndex, _matchmakingQueues, 2);

                if (GUILayout.Button("Find Match"))
                {
                    FindMatch();
                }   
            }
        }
        else
        {
            _username = GUILayout.TextField(_username);
            if (GUILayout.Button("Log In"))
            {
                LoginPlayer(_username);
            }
        }

        GUILayout.EndArea();
    }

    void RegisterCallbacks()
    {
        var catenaEntrypoint = FindObjectOfType<CatenaEntrypoint>();
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
        
        // Matchmaking Started Callback
        catenaEntrypoint.OnStartMatchmakingCompleted += (_, matchmakingEventArgs) =>
        {
            _ticketID = matchmakingEventArgs.MatchmakingTicketId;
            
            string logString =
                $"Matchmaking began with (Ticket ID: {matchmakingEventArgs.MatchmakingTicketId}), (Status Sucess: {matchmakingEventArgs.Status.Success})";
            if (!matchmakingEventArgs.Status.Success)
            {
                logString += ", (Status Message: {matchmakingEventArgs.Status.Message})";
            }
            Debug.Log(logString);
        };
        
        // Matchmaking Finished Callback
        catenaPlayer.OnFindingServer += (_, eventData) =>
        {
            if (eventData == null)
            {
                // We failed to find a match, we no longer need the ticket ID
                _ticketID = null;
                _isMatchmaking = false;
                
                Debug.Log("Failed to find a match");
                return;
            }

            if (eventData == "")
            {
                Debug.Log("Found a match; waiting for a server");
                return;
            }
            
            // eventData: {"Ip":"127.0.0.1","Port":1234,"ServerId":"<account-id-here>"}
            Debug.Log($"Found a match - data: {eventData}");
        };

        catenaPlayer.OnFoundServer += (_, connectionDetails) =>
        {
            Debug.Log($"Found a server - connection details: {connectionDetails}");

            var parts = connectionDetails.Split(":");
            var ip = parts[0];
            var port = ushort.Parse(parts[1]);
            
            _clientConnectionInfo = new ConnectionInfo { Ip = ip, Port = port };
            _transitionClient = true;
        };

        // Cancel Matchmaking Callback
        catenaEntrypoint.OnCancelMatchmakingCompleted += (_, status) =>
        {
            if (!status.Success)
            {
                Debug.LogError($"Failed to cancel matchmaking: {status.Message}");
                return;
            }
            
            Debug.Log("Cancel Matchmaking Complete");
            _isMatchmaking = false;
            _ticketID = null;
        };
    }

    void LoginPlayer(string username)
    {
        var catenaPlayer = FindObjectOfType<CatenaPlayer>();

        Debug.Log("Logging Player In");
        catenaPlayer.CompleteLogin(username);
    }

    void LogoutPlayer()
    {
        var catenaPlayer = FindObjectOfType<CatenaPlayer>();

        Debug.Log("Logging Player Out");
        catenaPlayer.Logout();
    }

    void FindMatch()
    {
        var catenaPlayer = FindObjectOfType<CatenaPlayer>();
        
        Debug.Log("Finding Match");

        var matchMetadata = new Dictionary<string, EntityMetadata> { { "queue_name", new EntityMetadata { StringPayload = _matchmakingQueues[_selectedMatchmakingQueueIndex] } } };
        var playerMetadata = new Dictionary<string, EntityMetadata>();
        catenaPlayer.EnterMatchmaking(playerMetadata, matchMetadata);

        _isMatchmaking = true;
    }
}
```

2. Build your game server
    1. In your Unity Editor, navigate to `File -> Build Profiles`
    2. Select "Windows Server"
    3. Select "Switch Platform"
    4. Select "Build"
    5. Note the full path of your server build executable, you will need this in the next step
3. If you are running Catena locally, skip this step. If you have it deployed somewhere, you will need to copy your server binary and associated output to the same machine that Catena is running on
4. Configure your running Catena instance using the [Configuring The Catena Backend](#configuring-the-catena-backend) documentation above
    1. When you are configuring the match broker, configure the `Catena.MatchBroker.Allocators[0].Configuration.GameServerPath` to be the full path of your server executable
5. In your Unity editor, navigate to `File -> Build Profiles`
6. Select "Windows"
7. Select "Switch Platform"
8. Exit the Build Profiles menu
9. Hit "Play" in the Unity Editor
10. Log in with `test01`
11. Matchmake into the `solo` queue

### How This Works
We use Unity's [OnGUI](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/MonoBehaviour.OnGUI.html) to create a simple user interface that interacts with Catena. Players can log in, log out, matchmake solo, matchmake 1v1, and cancel matchmaking.

If we are running as a server, we start listening as a game server and request a match be placed on the server against the Catena backend.

If we are running as a game client, we allow the player to begin matchmaking. To initialize matchmaking, we define a `queue_name` in the match metadata. We then listen for matchmaking to complete and a server to be assigned via callbacks. Once a server is assigned, we connect to that server.