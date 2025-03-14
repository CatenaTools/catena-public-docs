1. A `MatchmakingStatusUpdateEvent` is emitted to players on a given ticket periodically as the ticket progresses through the system. Status update types include:
    1. `MATCHMAKING_STATUS_UPDATE_TYPE_IN_PROGRESS`
    2. `MATCHMAKING_STATUS_UPDATE_TYPE_COMPLETED`
    3. `MATCHMAKING_STATUS_UPDATE_TYPE_FAILED`
    4. `MATCHMAKING_STATUS_UPDATE_TYPE_CANCELLED`
    5. `MATCHMAKING_STATUS_UPDATE_TYPE_FINDING_SERVER`
    6. `MATCHMAKING_STATUS_UPDATE_MATCHMAKING_TIMED_OUT`
2. A `NewMatchEvent` is emitted when a match is formed, which other Catena Services can use to spin up a dedicated game server for the match, if necessary.

<!-- TODO: Write and link to MatchBroker documentation -->
<!-- TODO: Write and link to Catena Event documentation -->