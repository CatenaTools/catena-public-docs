---
markdown:
  toc:
    depth: 3
---

# Strategies and Hooks
Custom **Strategies** and **Hooks** are useful for defining how matchmaking tickets are handled at various stages in the matchmaking process. **Strategies** are used to define how **matchmaking tickets** within a queue are matched together, and **Hooks** are used to validate matchmaking tickets and add more data to both the tickets and the resulting match. 

The Catena Matchmaker comes with a default matchmaking strategy, and a few other sample strategies and hooks that provide both some basic functionality and examples for how to implement your own strategies and hooks.

For more information on how the Catena Matchmaker works, refer to the [Catena Matchmaker](catena-matchmaker.md) documentation.

## Strategies

**Strategies** are how the matchmaker decides to match different matchmaking tickets together. Each strategy overrides a function called `TryMakeMatch`, in which it Dequeues tickets from the matchmaker in order to form a match. If a valid ticket combination is found, the strategy calls `Matchmaker.EmitMatch`, providing it a nested list of tickets (`List<List<MatchmakingTicket>>`) - One list of tickets for each team.

Catena comes with a default matchmaking strategy (called `DefaultMatchmakingStrategy`) Which takes the `Teams` field and the `PlayersPerTeam` field of each queue in the configuration to create teams. It ensures that all players on the same ticket will be on the same team, and can be used to form teamless matches by setting the `Teams` to 1. If a `MinPlayersPerTeam` is set, then this strategy will look at a ticket's progress to expiration, gradually reducing the target team count for the ticket based on how close it is to expiring. If the `ExpirationAction` for a queue is set to anything other than `drop`, then the matchmaker will try to make a match with that ticket being the only one on a team - but will still wait for enough tickets to have one for each team.

### Custom Strategies

While the default strategy is intented to be a good general solution, your game may have different requirements for how matches should be made. In such cases, it's recommended to either modify the `DefaultMatchmakingStrategy`, or create your own. 

Catena comes with a sample Custom Strategy, called `OneTicketPerTeamMatchmakingStrategy`. This strategy serves as an easier to read example of a Matchmaking Strategy, where the requirements are much more relaxed - only trying to fulfill the team number requirement, giving each team a single matchmaking ticket regardless of the number of players on that ticket. If aiming to create your own Custom Strategy, a good place to start would be to copy either this Matchmaking Strategy or the default one, and then modify it to fit your needs. If making a strategy from scratch, ensure that you inherit from `CatenaMatchmaker.MatchmakingStrategy`, and that you implement an override of `TryMakeMatch`.

When making a custom strategy, it's important to remember that they should ideally work quickly. Only one call to `TryMakeMatch` will be happening at a time, so if a strategy is slow or otherwise delaying for some reason, then it will block any matches being made in any of the queues.

Additonally, you should typically only emit one match before leaving `TryMakeMatch`. This is for the reason listed above - if a call to `TryMakeMatch` ends up emitting a match, then it will wait for the match to be emitted before progressing. By emitting more than one match, you will likely be spending a longer time forming matches for the same queue, instead of trying to form matches for all the queues equally.

If using a custom strategy, you will need to modify the configuration to indicate which queues should use this strategy. The Catena Matchmaker is configured using appsettings files in `catena-tools-core`. Here's an example of setting up a matchmaking queue to use the `OneTicketPerTeamMatchmakingStrategy` strategy:

```json
{
    "Catena": {
        ...
        "Matchmaker": {
            "MatchmakingQueues": {
                "1v1": {
                    "QueueName": "1v1 (Face Off)",
                    "Teams": 2,
                    "PlayersPerTeam": 1,
                    "TicketExpirationSeconds": 180,
                    "CustomStrategy": "OneTicketPerTeamMatchmakingStrategy"
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

## Hooks

**Hooks** allow you to add extra logic to the matchmaking process both before and after the strategy. Hooks have 2 main functions: Adding extra validation to tickets and matches, or adding/modifying data to tickets and matches. Hooks do this by using the `IMatchmakingCustomHooks` interface, and defining the functions for `ValidateTicketMatchHook` and `NewMatchHook`.

### Ticket Validation

`ValidateTicketMatchHook` is called twice before a ticket is used for matchmaking - once when creating the matchmaking ticket, and once again when starting the matchmaking with the created ticket. This function can be used to verify that tickets are valid, rejecting tickets that don't meet some set of requirements. This function can also be used to modify the data of a ticket with any additional information you might need. Catena comes with two example hooks that use the '' function to both verify and modify tickets - the `QueueAssignmentMatchmakingHook` and the `PartyMatchmakingHook`.

The `QueueAssignmentMatchmakingHook` looks at the number of players on a ticket, and then attempts to assign it a queue name based on the player count (either `team_of_2`, `team_of_3`, or `team_of_4`). It will also reject tickets that already have a queue defined, if they don't match the queue that would be assigned to the ticket.

The `PartyMatchmakingHook` is a hook that works with the Catena Parties Service, allowing an easier way of matchmaking with parties. For more information on the parties service, refer to the [Catena Parties](../parties/index.md) documentation. The hook expects that the ticket contains metadata with the party ID, and that the ticket ID matches the party leader's ID - rejecting any tickets that fail either expectation. The hook will then get the list of players in the party, and ensure that all the party members are listed in the ticket - adding them to the ticket if not. The hook also checks if there are any existing players in the ticket that are not a member of the party, rejecting the ticket if so.

Hooks that use `ValidateTicketMatchHook` only work if the custom hook is defined for all queues. The current method to have ticket validation for individual queues is to have the hook check the matchmaking queue's custom hook and see if it matches - an example of this can be seen in the `PartyMatchmakingHook`. Here's an example of how a config would look using this custom hook, where the `PartyMatchmakingHook` would only be applied to the queue `4v4`:

```json
{
    "Catena": {
        ...
        "Matchmaker": {
            "MatchmakingQueues": {
                "4v4": {
                    "QueueName": "4v4 (Party Matchmaking)",
                    "Teams": 2,
                    "PlayersPerTeam": 4,
                    "TicketExpirationSeconds": 180,
                    "CustomHooks": "PartyMatchmakingHook"
                },
                "1v1": {
                    "QueueName": "4v4 (Solo Matchmaking)",
                    "Teams": 2,
                    "PlayersPerTeam": 1,
                    "TicketExpirationSeconds": 180
                }
            },
            "StatusExpirationMinutes": 15,
            "CustomHooks": "PartyMatchmakingHook"
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

### Match Validation

After a match is made using a **Strategy**, it will then be put through the queue-specific hook by calling `NewMatchHook`. Similar to `ValidateTicketMatchHook`, you can use this function to either reject a match that doesn't meet some requirements, or to add data to the match. Catena comes with two hooks that use this functionality: The `SetTeamDataMatchmakingHook` and `SimpleP2PMatchmakingHooks`.

`SetTeamDataMatchmakingHook` is a simpler hook, with the main purpose being to attach team information to a match before it's sent off to the users. This comes in the form of setting the per player properties to contain which team each individual player is on, as well as in the match properties, providing lists of all the players on a given team. The only validation performed is ensuring that the teams and tickets provided by the matchmaking strategy are not null.

`SimpleP2PMatchmakingHooks` is designed as a basic way to perform P2P matchmaking. It requires an address to be provided with each ticket, and uses the first listed player in the resulting match as the 'host' - sending that player's address as additional event data alongside the match data. The intent is that clients will use this provided address as the host of the P2P game - so your game would need logic to identify if you are the host, or if you need to connect to another player's session.

Unlike the ticket validation, this match validation is used on a per-queue basis - if you want to apply hooks that use `NewMatchHook`, you will need to define it for each individual queue. Here's an example of how a config would look using the `SetTeamDataMatchmakingHook`:

```json
{
    "Catena": {
        ...
        "Matchmaker": {
            "MatchmakingQueues": {
                "4v4": {
                    "QueueName": "4v4",
                    "Teams": 2,
                    "PlayersPerTeam": 4,
                    "TicketExpirationSeconds": 180,
                    "CustomHooks": "SetTeamDataMatchmakingHook"
                },
                "3v3": {
                    "QueueName": "3v3",
                    "Teams": 2,
                    "PlayersPerTeam": 3,
                    "TicketExpirationSeconds": 180,
                    "CustomHooks": "SetTeamDataMatchmakingHook"
                },
                "Coop": {
                    "QueueName": "Cooperative queue (No teams)",
                    "Teams": 1,
                    "PlayersPerTeam": 4,
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

### Custom Hooks

To create your own custom hooks, the process is similar to custom strategies - you can either modify an existing hook to fit your needs, or copy and rename an existing hook to provide a starting point for your own hook. Once you have your own hook, you only need to have it defined in the configuration file, similar to the above examples


### Current Hook Restrictions

There are currently some restrictions when it comes to hooks. The first is that `ValidateTicketMatchHook` is only called if set as a global custom hook. If you want to use `ValidateTicketMatchHook` on a specific queue, then use the example shown in `PartyMatchmakingHook` - which needs to be defined as a global custom hook, but checks if the queue also specifically has `PartyMatchmakingHook` before applying it's logic.

Inversely, `NewMatchHook` is only called if defined as a queue-specific hook. If you want all your matchmaking queues to use the same hook's `NewMatchHook`, then it will need to be defined for each individual queue.

You also cannot currently stack multiple matchmaking hooks - for example, there's no way to use both the `PartyMatchmakingHook` and the `QueueAssignmentMatchmakingHook`. If you wish to combine multiple hooks, the best method currently is to create a new hook, and combine the functionality of the individual hooks you need into the one hook.