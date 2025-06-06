# Server Manager

A server manager is the point of contact for game servers to obtain and report on the status of matches. A server
manager may also, but is not required to, track game server capacity and add and remove capacity by utilizing one or
more allocators. The server manager may call on or be called by a [match broker](match-broker.md) to perform its duties.

The default Catena server manager is contained within the [default match broker](match-broker.md#catena-match-broker).

## Allocators

Allocators expose a simple interface that a server manager can use to allocate or deallocate game servers as needed,
in compatibility with a particular platform or provider. Examples may include a local process allocator, a Docker container allocator, or a
Multiplay allocator. Other components, such as an admin dashboard, may also be able to utilize allocators directly.

{% admonition type="info" %}
A full list of allocators and configuration options is available here: [Match Broker Allocators](match-broker-allocators.md).
{% /admonition %}

## Game server endpoints

The server manager is the point of interaction for game servers. The game server SDK interacts with the server manager
to run matches.

### Typical/simple flow

```mermaid
sequenceDiagram
    participant SM as Server Manager
    participant GS as Game Server
    loop Until match received
        GS->>SM: RequestMatchRequest
        SM->>GS: RequestMatchResponse
    end
    GS->>SM: MatchReadyRequest
    SM->>GS: MatchReadyResponse
    Note over GS: Run match
    GS-->>SM: EndMatchRequest
    SM-->>GS: EndMatchResponse
```

An example of the simple flow, running a single match, is included in
a [mock game server script](https://github.com/CatenaTools/catena-tools-core/blob/main/mocks/gameserver/gameserver.py).

### API reference

See the [Catena Server Manager API documentation](../../apis/catena-tools-core/catenaservermanager) for all the available RPCs.

### `RequestMatch`

When a game server is idle (or backfilling or running matches in parallel) and has room for a new match it can
call `RequestMatch()`. This will request a match from a [match broker](match-broker.md), optionally meeting any
requirements of the game server by including a <tooltip term="JMESPath">JMESPath</tooltip> expression. The result of
this may be one match or that there are no matches are available meeting the requirements in which case the game server
may want to periodically retry until it gets a match or just exit (user implementation specific). This first use of this
call is also the first indication to the backend that a server is extant.

A future extension of the messages may allow for any/all the following:

- A game server to request multiple matches up to some limit(s)/deadline(s)
- A response from the backend server manager that contains no matches and a hint to the game server that it should stop
  polling/shut itself down

#### Requirements filter

A game server can use a requirements filter to ensure it will only receive a match it can run. The requirements filter
can reference any of the fields that are used within the Catena backend, or any match or player properties sent by
clients or developed during matchmaking. For example, a game server may already have a map loaded and may only request
matches that require that map:

```C#
RequestMatch("MatchProperties.map == 'forbidden_forest'")
```

This example shows how a <tooltip term="JMESPath">JMESPath</tooltip> expression can be used to check that a
game-specified match property (`map`) is set to a certain value so only matches with that value may be returned to the
game server.

### `MatchReady`

This is the point where the game server signals to clients that it is ready for them to connect. In the Catena server
manager, is proxied through the [match broker](match-broker.md) for tracking purposes.

This call avoids the incomplete flow that exists in some platforms where a game server may not actually be ready at the
time clients receive connection details. In Catena, this call and the match broker ensure that when a client receives
connection details for a match, the server is truly ready.

When calling `MatchReady()`, the game server includes a generic connection string that is meaningful to clients; it is
simply passed onto clients by the broker. The connection string may be a hostname and port, a URI, or contain extra
metadata/extensions that will be meaningful or important to clients to connect to the server (such as a per game server
key). It is included in each MatchReady request, since it may be different for each match, particularly if a game server
can run multiple matches in parallel or there is some additional metadata per match.

### `EndMatch`

This is not necessarily required, but it signals the backend and the clients (by way of the backend) that a match
has/should end. After this point the server may shut down, or it may request a new match. A server may communicate
through its own channel with client(s) or just end, skipping this call, but this will result in the Catena server
manager hitting timeouts before cleaning up tracking of servers, making it less effective.

## Game server endpoint hints

Some game server request or response messages can contain hints. These hints are entirely optional but may make certain
arrangements more efficient. Hints are predefined flags, shared across the server manager API, which may also be
combined with each other.

Hints may be sent with a request or response, but interpretation is dependent on the backend/SDK
implementation, situation, and message type. Hints may be ignored when they are not supported or are not
relevant to the situation or message type.

{% admonition type="info" %}
Since they are entirely optional, an SDK or client should not require that a particular hint is available to function
correctly.
{% /admonition %}

For example, the Catena match broker does not assume a game server exits after it calls `EndMatch`; it continues to
track that server as available in case it can run another match, backfill itself, etc. However, if a game server _does_
exit after `EndMatch`, then the broker may wait to start a new game server when a new match arrives, believing there is
an idle game server that will soon call `RequestMatch`. After a delay, the match broker will identify that the new match has
not been picked up, and conclude that more capacity is required, so it will start a new game server.

This inefficiency/delay can be avoided if the game server adds `HintFlag.Shutdown` to the hints in its `EndMatch`
request when it knows it will exit afterward. The Catena match broker will immediately stop tracking the game server and
avoid unnecessary delays when the next new match arrives.

### Available hints

These hints are implemented in the Catena [match broker](match-broker.md).

<!-- TODO: fill in descriptions for flags -->

Shutdown: This flag indicates to the backend that the game server will shut down after it receives a response to `EndMatch`.

```protobuf
enum HintFlag {
    HINT_FLAG_NO_HINT_FLAGS = 0x00; // No flags - either unspecified or empty
    HINT_FLAG_SHUTDOWN = 0x01; // Flag indicating a component will shutdown or should shut down if it can
    HINT_FLAG_WILLING_TO_WAIT = 0x02; // Flag indicating a component is willing to wait a "long time" for a response to the request.
    HINT_FLAG_WILLING_TO_SHUTDOWN = 0x04; // Flag indicating a component is willing to shutdown if a shutdown is requested
    HINT_FLAG_FULL = 0x08; // Flag indicating a component will cease making requests for additional matches
    HINT_FLAG_NOT_FULL = 0x10; // Flag indicating a component will begin making requests for additional matches
}
```
