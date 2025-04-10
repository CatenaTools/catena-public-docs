# Entitlements

The entitlements system and service in Catena support players owning, purchasing and refunding premium/in-game currency,
skins, items, keys, subscriptions, and other products - usually by real-world (fiat) or other currency. Collectively
these are referred to as "items" - an item may represent anything in the Catena entitlements system.

Depending on the providers configured, item purchases or subscriptions may be initiated inside a game or through
storefronts. Item and ownership data may also just be ingested from multiple sources to use inside a game through a
consistent interface.

{% admonition type="info" %}
The entitlements system can deal generically in "items" and does not require purchases. However, it is not designed to
be used as a general-purpose, in-game inventory system.
{% /admonition %}

## Entitlements and items

Generally, there are a number of approaches to entitlements:

1. Single ownership - a player may only own 1 copy of something
2. Unique/instanced ownership - a player may only own 1 copy of something but multiple instances/copies of something may
   be created, each with a unique ID
3. **Multiple ownership - a player may own multiple copies of something without creating unique instances**

For a simplified handling of entitlements and consistent support for premium/in-game currency, Catena utilizes
**multiple ownership** in its entitlement system and often refers entitlements as "countable" or "countable items". This
readily supports transforming or "consuming" entitlements and detecting when an entitlement is used/spent more than
once - such as when a player purchases an item, obtains the benefit, and quickly refunds the purchase.

To enforce single ownership of an entitlement, a game should take care to utilize the entitlements system such that
players can not obtain more than one of an item. However, in certain scenarios, such as when an item can be purchased (
and therefore refunded) **and** is "consumable"/"spendable" or also granted by another system, the player ownership
count for the item may be <0 or >1 under certain circumstances and games should expect and handle this.

Typically, instancing of items provided via entitlements is done in a separate inventory system, not by creating
multiple entitlements unless a storefront will present them as truly unique items, each with their own identifier.

## Order and Item Providers

Item ownership is collected and handled by providers that can be enabled and configured as needed by the game. These
providers fall into two categories:

1. Order providers - These providers support initiating purchases, subscriptions, or refunds from Catena or a game.
2. External item providers - These providers collect ownership data from outside Catena to make it available inside
   Catena or a game.

In some cases, a platform may have multiple providers and/or combine an order provider and external item provider to
support different uses.

More detailed information is available about [orders and order providers](orders.md) and the
corresponding [offer system](offers.md). 

Current Catena entitlement providers are listed in the table below.

| Name                              | Type                   | Description                                                                                                                |
|-----------------------------------|------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `SteamOrderProvider`              | Order provider         | Initiates item or subscription purchases, refunds, and handles refunds/subscription cancellations initiated through Steam. |
| `SteamAppExternalItemProvider`    | External item provider | Queries a player's Steam account and maps app IDs to items. Good for checking DLC, unlock keys, editions, etc.             |
| `TwitchDropsExternalItemProvider` | External item provider | Queries Twitch drop campaign benefits and updates corresponding player item ownership.                                     |

## Internal item tracking operations

Several atomic operations are available inside the entitlements system and shared by providers and RPCs used by games,
admin dashboards, or other external services:

`SetOwnership` - Sets the ownership of an item for an account to a value, ignoring whatever the current value may be.
Good for direct admin/game grant or revoke operations. Generally, increment and decrement operations should be
preferred. Order providers should **not** use this operation.

`IncrementOwnership` - Increments ownership of an item for an account from its current value. Good for granting an
additional amount of an item, especially for purchases in order providers.

`DecrementOwnership` - Decrements ownership of an item for an account from its current value. Good for revoking/spending
some amount of an item, especially for refunds in order providers.

## The catalog and creating items

The catalog is the set of all items extant in the Catena entitlements system and catalog items are the definitions of
items that may be purchased, spent, or owned by players.

Creating an item in Catena may be done in the dashboard or by calling `AdminCreateCatalogItem`. This will return a
unique ID that represents this item in the catalog. An item must have a unique name and description.

Catalog items may have one or more tags applied to them. These are intended to organize/filter tags in a dashboard or an
in-game storefront. Catalog items do not have any other metadata attached to them.

A catalog item may optionally have a unique custom ID attached to it. Custom IDs can be utilized if a game already has
item IDs it recognizes - either as in game items or when transitioning from another system.

{% openapi-code-sample operationId="catena.catena_entitlements.CatenaEntitlements_AdminCreateCatalogItem"
descriptionFile="../../apis/catena-tools-core.yaml" /%}

## Item prices

Once an item exists in the catalog, price data can be attached to the item if it will be purchased or represents a
subscription. This is not required if a catalog item represents something that will be granted manually or by another
system, such as a Twitch drop reward or a Steam app/game. An item may be granted by another system _and_ have price
data; it is not necessary to make multiple items.

The item price system is very flexible. A single item may have combinations of:

* purchase prices and subscription prices
* multiple purchase prices with different quantities (to support bulk pricing)
* multiple subscription prices with different intervals (to support bulk/long-term subscriptions)
* multiple purchase/subscription prices in different currencies
* *Future plans for built-in promo/limited time purchase and subscription pricing*

{% openapi-code-sample operationId="catena.catena_entitlements.CatenaEntitlements_AdminAddCatalogItemPurchasePrice"
descriptionFile="../../apis/catena-tools-core.yaml" /%}

## Querying player ownership

There are two methods that can be used to check player/account item ownership, with variations for users/admins/servers:

`GetAccountOwnsCatalogItem` - Query whether an account owns a specific item. Good for simple cases where only one item
is checked. When multiple items will be checked, `GetAccountCatalogItems` should be preferred.

`GetAccountCatalogItems` - Query all the items owned by an account. A game client/server may call this and cache the
result, updating when appropriate.

{% openapi-code-sample operationId="catena.catena_entitlements.CatenaEntitlements_GetAccountCatalogItems"
descriptionFile="../../apis/catena-tools-core.yaml" /%}

## Attaching provider-specific data to items

For some entitlement providers, additional item data is necessary. For example, when using the
`SteamAppExternalItemProvider`, a Catena catalog item must map to a Steam App ID.

The dashboard or `AdminModifyProviderCatalogItemData` can be used to add/update this data per item. Different data may
be supported/required for each provider.

A single item may have multiple unique provider data attached to it but may not have multiple copies of provider data
attached to it. For example, an item may have a Steam App ID attached to it and data for another provider, but it may
not have 2 Steam App IDs attached to it.