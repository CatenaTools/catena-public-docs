# Steam App External Item Provider

The `SteamAppExternalItemProvider` queries a player's Steam account and maps Steam App IDs to items that can be treated
like any other item in Catena. This can be used to map DLC, unlock keys, different game editions, etc to Catena items
owned by a player.

Using the provider requires [attaching a Steam App ID](index.md#attaching-provider-specific-data-to-items) to each item
that will be mapped.

A Steam App ID can only be mapped one to one with a Catena catalog item.

## Ownership policy / Family Sharing

Steam Family Sharing means that a player can own a Steam App ID "temporarily". When games use additional Steam App IDs
as license keys or premium editions to grant additional access or items to a player in-game, players could take
advantage of this system to borrow Apps and obtain items they have not purchased.

To help manage this, when attaching a Steam App ID to a Catena catalog item, a policy can be added as well. The default
policy does not distinguish whether the ownership reported by Steam is permanent or temporary (via Family Sharing).
However, when set to the `PERMANENT_ONLY` policy, Catena will only report that a player owns the corresponding Catena
item when they are the true, original owner; when a Steam App ID is shared with a player it will not be treated as owned
by that player.

## Locking ownership

Ownership checks via this item provider treat Steam's response as authoritative over any value currently held in Catena.
This means when an admin needs to manually grant/revoke an item for a user and that catalog item has a Steam App ID
attached, the non-admin lockout flag should be set; otherwise, the value set by an admin will be overwritten on the next
ownership check.

For more information see [ownership locking](index.md#ownership-locking).

## Tuning

There is one tuning option for the provider: `AppOwnershipCheckLimitMinutes` This can be used to limit how often checks
are made against Steam. The default is 1 minute. On a per-account basis, when Catena item ownership is requested and a
recent check of Steam has been done within this interval, only cached information will be used.