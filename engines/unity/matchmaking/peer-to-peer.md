---
markdown:
  toc:
    depth: 3
---

# Unity - Peer to Peer Matchmaking

Peer to peer matchmaking is the simplest configuration you can run the Catena Matchmaker in. It is a good first step to get up and running, even if your game utilizes dedicated game servers. You can build on top of this implementation to add dedicated game server support.

## Prerequisites
* You must have completed the [Unity Authentication Guide](../authentication.md)

## Configuring The Catena Backend
Before you integrate the matchmaker into your Unity game, you first need to configure the Catena Backend properly. This configuration will differ depending on the needs of your game. Refer to the [Catena Matchmaker documentation](../../../features/matchmaking/index.md) for more information.

For ease of testing for a first time integration, we recommend starting with a simple matchmaking **queue** definition that only requires a single player to execute the full matchmaking loop. We'll call that **queue**, `solo`.

We'll also set up a 1v1 **queue** to facilitate two players matchmaking together. We'll call this **queue**, `1v1`.

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
  }
}
```

The `SimpleP2PMatchmakingHooks` **Custom Hook** is provided out of the box to bypass dedicated game server provisioning when matches are successfully made.

## Matchmaking A Player
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
  if (string.IsNullOrEmpty(eventData))
  {
    Debug.Log("Failed to find a match");
    return;
  }

  // eventData: {"Ip":"127.0.0.1","Port":1234,"ServerId":"<account-id-here>"}
  Debug.Log($"Found a match - data: {eventData}");

  // You may now connect to the Ip and Port provided in the eventData, beginning the match
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

## A Practical Example
{% partial file="/_partials/coming-soon.md" /%}

<!-- TODO: Build on top of the ../supplemental-materials/mirror.md to introduce a full matchmaking loop with two game clients -->