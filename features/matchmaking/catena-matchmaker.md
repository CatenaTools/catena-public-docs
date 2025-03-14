---
markdown:
  toc:
    depth: 3
---

# Catena - The Catena Matchmaker
The Catena Matchmaker is responsible for grouping players or parties together to form games or matches.

It is _not_ responsible for assigning dedicated game servers or fleet management. It is also not responsible for handling backfill. If you would like to learn more about how Catena handles dedicated game servers or backfill, refer to the [Match Broker](../game-servers/index.md) documentation.

## Engine Integration

{% partial file="/_partials/matchmaking/engine-integration.md" /%}

## How The Matchmaker Works

### Tickets
{% partial file="/_partials/matchmaking/tickets.md" /%}

### Queues
The Catena Matchmaker utilizes separate **queues** to partition tickets. These **queues** act like mini-matchmakers, supporting many different game types and matchmaking needs.

* You may configure one or many **queues**, depending on the needs of your game.
* Each **queue** can have it's own rules for match sizes, teams, **matchmaking strategies** (the algorithm used to make matches), or other custom requirements.
* **Matchmaking tickets** are never moved between **queues** and are never matched with other **matchmaking tickets** from other **queues**.
* The Catena Matchmaker will assign each **matchmaking ticket** to a **queue** based on the metadata it contains.

### Matchmaking Strategies
The Catena Matchmaker uses **matchmaking strategies** within **queues** to define how **matchmaking tickets** are matched together.

The Catena Matchmaker contains built-in **strategies** that will be selected automatically based on team counts and sizes.

#### (Optional) Custom Strategies
Configuring custom **matchmaking strategies** is an advanced topic. If you are configuring the matchmaker for the first time, it is recommended you set up your proof of concept with Catena's built-in **strategies**.

{% partial file="/_partials/coming-soon.md" /%}

<!-- TODO: Include documentation on how to configure custom strategies -->

### Events
As **matchmaking tickets** progress through the Catena Matchmaker, events are emitted that either game clients or other Catena Services who are subscribed can ingest.

{% partial file="/_partials/matchmaking/events.md" /%}

### (Optional) Matchmaking Hooks
Configuring custom **matchmaking hooks** is an advanced topic. If you are configuring the matchmaker for the first time, it is recommended you set up your proof of concept without custom **matchmaking hooks**.

{% partial file="/_partials/coming-soon.md" /%}

<!-- TODO: How to configure hooks -->

## Configuring The Catena Matchmaker
Tha Catena Matchmaker is configured using appsettings files in `catena-tools-core`.

### Basic Example

There are many possible scenarios for matchmaking across many different genres of game. Let's start with a basic configuration that selects the "Catena Matchmaker" as the enabled matchmaking implementation and defines three **queues**.

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
                },
                "2v2": {
                    "QueueName": "2v2 (Team Play)",
                    "Teams": 2,
                    "PlayersPerTeam": 2,
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

How these **queues** are utilized by your game is up to you, but a few examples include:

* A solo match could be satisfied by a single **ticket**, submitted by an individual player
* A 1v1 match could be satisfied by a single **ticket** containing two players, submitted by the leader of a party
* A 1v1 match could be satisfied by two separate players, each submitting their own individual **ticket**
* A 2v2 match could be satisfied by four separate players, each submitting their own individual **tickets**
* A 2v2 match could be satisfied by two **tickets**, each containing two players, submitted by to separate party leaders for two formed parties

### Available Configuration Options

Let's take a look at all the available properties in the `Matchmaker` config.

| Property | Definition |
|-|-|
| `MatchmakingQueues` | The **queues** that **tickets** can be added to |
| `StatusExpirationMinutes` | Time before a matchmaking status is considered expired. Tickets that have successfully made a match or have expired are retained for this amount of time for observability purposes, or if a game client is not subscribed to events and prefers to poll the matchmaker for it's ticket's status |
| `CustomHooks` | Name of a **custom hook** class to use for all **queues** |

Each **queue** defined with `MatchmakingQueues` will have it's own properties.

First, the JSON `key` is the value that **tickets** will need to provide as their `queue_name` value. In the above [basic example](#basic-example), they are `solo`, `1v1` and `2v2`. This value is how **tickets** are sorted into **queues**.

| Property | Definition |
|-|-|
| `QueueName` | Human readable **queue** name, used in logging |
| `Teams` | Number of required teams in this **queue** |
| `PlayersPerTeam` | Number of required players per team in this **queue** |
| `TicketExpirationSeconds` | The amount of time a **ticket** can wait in matchmaking for a match to be made before expiring |
| `ExpirationAction` | Options: `drop` (default), `minimum`. If `drop`, this queue will not try to match **tickets** which have expired. If `minimum`, this queue will create a match that includes only the candidate **tickets** which have passed their deadline |
| `CustomStrategy` | Name of a custom **strategy** to use for this **queue** |
| `CustomHooks` | Name of a **custom hook** class to use for this **queue** |

## What Next?
{% partial file="/_partials/matchmaking/what-next.md" /%}