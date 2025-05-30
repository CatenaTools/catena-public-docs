---
markdown:
  toc:
    depth: 3
---

# Unity - Peer to Peer Matchmaking

Peer to peer matchmaking is the simplest configuration in which you can run the Catena Matchmaker. It is a good first step to get up and running, even if your game utilizes dedicated game servers. You can build on top of this implementation to add dedicated game server support.

## Prerequisites
* {% partial file="/_partials/unity/running-catena-prereq.md" /%}
* You must have completed the [Unity Authentication Guide](../authentication.md).

## Configuring The Catena Backend
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
          "TicketExpirationSeconds": 180,
          "CustomHooks": "SimpleP2PMatchmakingHooks"
        },
        "1v1": {
          "QueueName": "1v1 (Face Off)",
          "Teams": 2,
          "PlayersPerTeam": 1,
          "TicketExpirationSeconds": 180,
          "CustomHooks": "SimpleP2PMatchmakingHooks"
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

The `SimpleP2PMatchmakingHooks` [custom hook](../../../features/matchmaking/catena-matchmaker-more.md#custom-hooks) is provided out of the box to bypass dedicated game server provisioning when matches are successfully made.

## Matchmaking A Player
Reminder: if you have not yet completed the [Unity Authentication Guide](../authentication.md), please do so now. Once a player has authenticated against Catena and registered a session, they can then begin matchmaking.

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
  if (string.IsNullOrEmpty(eventData))
  {
    Debug.Log("Failed to find a match");
    return;
  }

  // eventData: {"Ip":"127.0.0.1","Port":1234,"ServerId":"<account-id-here>"}
  Debug.Log($"Found a match - data: {eventData}");

  // You may now connect to the Ip and Port provided in the eventData, beginning the match
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

// You will need to obtain your IP and port using whichever netcode solution you are using (i.e. Netcode For GameObjects, Mirror, etc.)
var ip = "127.0.0.1";
var port = "1234";
var address = $"{ip}:{port}";

// The Catena Matchmaker will match the player into the queue provided here
var queue_name = "solo";
var matchMetadata = new Dictionary<string, EntityMetadata> { { "queue_name", new EntityMetadata { StringPayload = queue_name } } };

// The SimpleP2PMatchmakingHooks will make the first player in the match the host, passing this address to all members in the match when the match is successfully made
var playerMetadata = new Dictionary<string, EntityMetadata> { { "address", new EntityMetadata{ StringPayload = address } } };

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
* {% partial file="/_partials/unity/running-catena-prereq.md" /%}
* Complete the [Mirror Networking Guide](../supplemental-materials/mirror.md)
{% admonition type="info" %}
This guide shows you how to set up an networked game MVP in Unity in less than 10 minutes.

**Mirror is not a requirement to use Catena Matchmaking. It is only used in these docs to show you a functional example of how to proceed after matchmaking**.
{% /admonition %}

### Configure Non-Matchmaking Portions
1. Add authentication to the Mirror Sample by using the [Unity Authentication Guide](../authentication.md)
2. Remove the `Network Manager HUD` from your `NetworkManager` object

### Add Peer to Peer Matchmaking
1. Configure your running Catena instance using the [Configuring The Catena Backend](#configuring-the-catena-backend) documentation above
2. Replace the contents of your `SceneManager.cs` file with the following code:

<!-- TODO (@HF): csharp does not appear to be supported. determine how to enable it for better syntax highlighting -->
```c
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Catena.CatenaAuthentication;
using Catena.Groups;
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
        public string ServerId; // In this example, the returned ServerId is the Player ID for the hosted server
    }

    // Server Travel
    private bool _transitionHost = false;
    private bool _transitionClient = false;
    private bool _inTransition = false;
    private ConnectionInfo _clientConnectionInfo;

    void Start()
    {
        RegisterCallbacks();
    }

    void Update()
    {
        if (_transitionHost)
        {
            Debug.Log("Starting Host");

            _transitionHost = false;
            _inTransition = true;

            NetworkManager.singleton.StartHost();

            _inTransition = false;
        }

        if (_transitionClient)
        {
            Debug.Log("Starting Client");

            _transitionClient = false;

            if (Transport.active is PortTransport portTransport)
            {
                NetworkManager.singleton.networkAddress = _clientConnectionInfo.Ip;
                portTransport.Port = _clientConnectionInfo.Port;

                _inTransition = true;

                // This is a crude way to ensure we only join after the host for the game session has started their listen server
                StartCoroutine(StartClientAfterWaiting());
            }
            else
            {
                Debug.LogError("For the purposes of this demo, please use the Telepathy Transport on your NetworkManager");
            }
        }
    }

    IEnumerator StartClientAfterWaiting()
    {
        yield return new WaitForSeconds(1f);
        NetworkManager.singleton.StartClient();

        _inTransition = false;
    }

    void OnGUI()
    {
        GUILayout.BeginArea(new Rect(10, 10, Screen.width - 20, Screen.height - 20));

        if (_transitionClient || _transitionHost || _inTransition) // We are connecting to another player, hide all controls during the transition
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
            else if (NetworkServer.active && NetworkClient.isConnected) // We are a host and a client
            {
                if (GUILayout.Button("Leave Match"))
                {
                    NetworkManager.singleton.StopHost();
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
            // We found a server or failed to find a match, we no longer need the ticket ID
            _ticketID = null;
            _isMatchmaking = false;

            if (string.IsNullOrEmpty(eventData))
            {
                Debug.LogError("Failed to find a match");
                return;
            }

            // eventData: {"Ip":"127.0.0.1","Port":1234,"ServerId":"<account-id-here>"}
            Debug.Log($"Found a match - data: {eventData}");

            ConnectionInfo connectionInfo;
            try
            {
                connectionInfo = JsonConvert.DeserializeObject<ConnectionInfo>(eventData);
                if (connectionInfo.ServerId == catenaPlayer.Account.Id)
                {
                    Debug.Log("This client is the host. Starting a listen server...");
                    _transitionHost = true;
                }
                else
                {
                    Debug.Log("This client is not the host, connecting to the host client...");
                    _transitionClient = true;
                    _clientConnectionInfo = connectionInfo;
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"Failed to deserialize JSON. (Error: {e}), (JSON: {eventData})");
            }
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
        catenaPlayer.CompleteLogin(Provider.Unsafe, username);
    }

    void LogoutPlayer()
    {
        var catenaPlayer = FindObjectOfType<CatenaPlayer>();

        Debug.Log("Logging Player Out");
        catenaPlayer.Logout();
    }

    void FindMatch()
    {
        if (Transport.active is PortTransport portTransport)
        {
            if (ushort.TryParse(GUILayout.TextField(portTransport.Port.ToString()), out ushort port))
            {
                var catenaPlayer = FindObjectOfType<CatenaPlayer>();
                var ip = NetworkManager.singleton.networkAddress;
                var address = $"{ip}:{port}";

                Debug.Log("Finding Match");

                var matchMetadata = new Dictionary<string, EntityMetadata> { { "queue_name", new EntityMetadata { StringPayload = _matchmakingQueues[_selectedMatchmakingQueueIndex] } } };
                var playerMetadata = new Dictionary<string, EntityMetadata> { { "address", new EntityMetadata{ StringPayload = address } } };
                catenaPlayer.EnterMatchmaking(playerMetadata, matchMetadata);

                _isMatchmaking = true;
            }
            else
            {
                Debug.LogError("Your port is invalid, please use only numbers");
            }
        }
        else
        {
            Debug.LogError("For the purposes of this demo, please use the Telepathy Transport on your NetworkManager");
        }
    }
}
```

3. Use ParrelSync to open a second Unity Editor. For more information on ParrelSync, refer to the [Mirror Networking Guide](../supplemental-materials/mirror.md#download--install-parrelsync)
4. Hit "Play" in both Unity editors
5. Log in with `test01` in one editor and `test02` in another
6. Matchmake into the `solo` or `1v1` queue

### How This Works
We use Unity's [OnGUI](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/MonoBehaviour.OnGUI.html) to create a simple user interface that interacts with Catena. Players can log in, log out, matchmake solo, matchmake 1v1, and cancel matchmaking.

To initialize matchmaking, we define a `queue_name` in the match metadata and an `address` in the player metadata. This `address` is used by the `SimpleP2PMatchmakingHooks` hook defined in your Catena configuration to notify all players in a match of the address for whoever is selected to be the host.

We use the `ServerId` sent back from the matchmaker to determine which player was selected to be the host. If the `ServerId` is not the current player's ID, we know we're not the host and we should connect to the IP/Port as a client.