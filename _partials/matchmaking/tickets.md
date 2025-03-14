The Catena Matchmaker accepts **matchmaking tickets** from players. **Tickets** may be submitted by a player for themselves if matchmaking alone, or may be submitted by a party leader on behalf of the entire party if partied up. These **tickets** can include metadata about the player(s), the party they are in, or the desired match properties.

Creating a **ticket** for matchmaking is done by submitting an `Entity` to [StartMatchmaking](../../apis/catena-tools-core.yaml#operation/catena.catena_matchmaking.CatenaMatchmaking_StartMatchmaking).

An `Entity` is a special Catena data type used for passing and storing dynamic data in Catena without having to define rigid data types.

<!-- TODO: Write and link to Entity documentation -->

**Tickets** will be sorted into **queues** based on the `queue_name` that is provided in the **ticket**. This `queue_name` is a requirement.

An example ticket, in it's simplest form, looks like this:

```json
{
    "entity": {
        "id": "{{account-id}}",
        "entity_type": "ENTITY_TYPE_ACCOUNT",
        "entities": [],
        "metadata": {
            "queue_name": {
                "string_payload": "solo"
            }
        }
    }
}
```

_Note: If you are using a Catena SDK in your game engine, ticket generation is done on your behalf._