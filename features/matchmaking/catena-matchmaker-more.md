The Catena matchmaker is responsible for grouping players or parties together to form games or matches. This may be done based on data sent by clients or retrieved from other sources and rules configured in the matchmaking service. The matchmaker can support both peer-to-peer and dedicated server arrangements.

Catena decouples matchmaking from server assignment and fleet and capacity management; these tasks are handled by the [Match Broker](../fleet-management/match-broker.md).

## Overview

To begin, each player or a party leader submits a ticket to the matchmaker. This ticket may take many forms and can include metadata about the players, the party, or the match such as the desired map, character classes, etc.

Central to the design of the matchmaker are one or more queues that can be configured based on the needs of the game to partition matchmaking tickets. These queues act almost like mini-matchmakers, supporting many different game types and matchmaking needs and improving scale:

* Each queue can have its own rules for match sizes, teams, <tooltip term="matchmaking strategy">matchmaking strategy</tooltip> or other custom requirements.
* Tickets are never moved or matched between queues.
* The matchmaker will assign each ticket to a queue based on the metadata it contains.

When a matchmaking strategy forms a complete match, two events are emitted:

1. All the clients on all the tickets in the match receive a matchmaking complete/finding server event
2. A new match event is broadcast so other services like the [Match Broker](../fleet-management/match-broker.md) can find or start servers if necessary

## Configuring basic queues

With many possible scenarios for matchmaking, there are many options available for the matchmaker. First, here is an example of a basic configuration with two queues:

```json
"Catena": {
    "Matchmaker": {
        "MatchmakingQueues": {
            "1v1": {
                "QueueName": "1v1",
                "Teams": 2,
                "PlayersPerTeam": 1,
                "TicketExpirationSeconds": 180
            },
            "2v2": {
                "QueueName": "2v2",
                "Teams": 2,
                "PlayersPerTeam": 2,
                "TicketExpirationSeconds": 180
            }
        }
    },
    "StatusExpirationMinutes": 15
}
```

There are many different ways these queues could be utilized by a game, for example:

* a 1v1 match could be satisfied by a lobby-style ticket containing two players
* a 1v1 match could be satisfied by two separate players each submitting their own individual ticket
* a 2v2 match could be satisfied by two parties, each with two players
* (and many more)

A client submits a ticket with the queue name in the match metadata. (More information on securing this process is available in [Custom hooks](#custom-hooks).)

In each queue, there is an amount of time to attempt matchmaking (`TicketExpirationSeconds`). If this time elapses, the ticket will be dropped and the clients will be notified that matchmaking timed out.

The `StatusExpirationMinutes` option is the amount of time the matchmaker should hold onto tickets that have completed matchmaking or timed out. This can be adjusted for scaling and game needs like match reconnect or preventing players from matchmaking too quickly.

The Catena matchmaker contains built-in strategies that will be selected automatically based on team counts and sizes.

Advanced uses like team assignment, restricted queues, deadline scheduling, or peer-to-peer matches (to name a few) require the use of [Deadline scheduling](#deadline-scheduling), [Custom hooks](#custom-hooks), or [Custom strategies](#custom-strategies).

## Custom hooks

Matchmaker custom hooks allow validation or manipulation of the data used in various stages of the matchmaker. Some examples are provided in the `Extras/MatchmakingHooks` directory. For customization of the actual matching algorithm or rules, see [Custom strategies](#custom-strategies).

A single custom hook object may be assigned to the matchmaker and a custom hook object may be assigned separately to each queue. Some hook methods are only run by the matchmaker, regardless of the queue, such as the `ValidateTicketMatchHook` and some hook methods are only run per-queue, such as the `NewMatchHook`.

{% admonition type="info" %}
A single hook object may be used for all queues and the matchmaker; they do not need to be independent.
{% /admonition %}

```json
"Catena": {
    "Matchmaker": {
        "MatchmakingQueues": {
            "1v1": {
                "QueueName": "1v1",
                "Teams": 2,
                "PlayersPerTeam": 1,
                "TicketExpirationSeconds": 180,
                "CustomHooks": "QueueLevelHook"
            }
        }
    },
    "StatusExpirationMinutes": 15,
    "CustomHooks": "MatchmakerLevelHook"
}
```

### ValidateTicketMatchHook

This hook is run both when creating and submitting a matchmaking ticket. Since it is executed for 