---
markdown:
  toc:
    depth: 3
---

# Unity - Entitlements

## Prerequisites
* You must be running Catena. It must be run locally or you must have it deployed somewhere. [Instructions for doing so can be found here](../../installation/index.md)
* You must have the entitlements service running, and have it configured with Items and Offers already set up. Instructions for doing so can be found here
<!-- Add in this link when it exists: [Instructions for doing so can be found here](../../features/entitlements/index.md). -->
* You must have completed [the Unity Quickstart Guide](./quickstart.md)
* You must have completed [the Unity Authentication Guide](./authentication.md)

## Adding Entitlements
The first step to adding entitlements in your project is to set up a method of logging in the player, and getting an account. Once the player is logged in, they should be ready to lookup entitlements.

Additionally, you must already have catalog items and offers set up in your database through admin endpoints - as you won't be able to create items or offers from the Unity client.

For more information on Entitlements in Catena and the features available, refer to the entitlements documentation.
<!-- Add in this link when it exists: [refer to the Entitlements documentation](../../features/entitlements/index.md). -->

### Client-Side Entitlements

1. Reminder, if you have not yet completed the [Unity Quickstart Guide](./quickstart.md), and [the Unity Authentication Guide](./authentication.md) please do so now.
2. Return to the scene created in the Unity Authentication Guide, which should already have `CatenaEntrypoint` and `CatenaPlayer`. We will henceforth refer to this as "your Scene".
3. Create an empty `GameObject` in your Scene.
    1. Rename this `GameObject` to `CatenaClientEntitlements`.
    2. Add the `CatenaClientEntitlementsManager` component to your `GameObject`.

{% admonition type="info" name="What Is The Catena Client Entitlements Manager?" %}
The **Catena Client Entitlements Manager** component houses functionality for allowing a player to get the list of items that they have - both getting the full list of items, and polling for whether the player owns an individual item.
{% /admonition %}

4. Import the Catena Unity SDK to the Script you'd like to create parties from, if not already done, as well as `Catena.CatenaEntitlements`.

<!-- TODO (@HF): csharp does not appear to be supported. determine how to enable it for better syntax highlighting -->
```c
using Catena.CatenaEntitlements;
using CatenaUnitySDK;
```

5. From the function you'd like to get the player's catalog from, write the following code.

<!-- TODO (@HF): csharp does not appear to be supported. determine how to enable it for better syntax highlighting -->
```c
var catenaClientEntitlements = FindObjectOfType<CatenaClientEntitlementsManager>();
catenaClientEntitlements.OnGetCatalog += (object sender, List<CatenaEntrypoint.PlayerCatalogItem> playerCatalog) =>
{
    Debug.Log($"Player Catalog Recieved:");
    foreach (CatenaEntrypoint.PlayerCatalogItem item in playerCatalog)
    {
        Debug.Log($"{item.CatalogItemId}: Is owned = {item.IsOwned}, Count = {item.Count}";
    }
};

// Reminder - This will only work if the player is already logged in!
catenaClientEntitlements.UpdateCatalog();
```

With the above code, you should now be able to get the list of items that the player owns. By calling `UpdateCatalog`, the `CatenaClientEntitlementsManager` will now have a cached version of the catalog, which you can access with either `GetCatalog` (which provides the full list of items) or `GetCatalogItem` (which returns a single item, given the item Id.)

Additionally, if you wish to just check whether the player owns a single item, you can call `GetPlayerOwnsCatalogItem` - which will check Catena directly if the player owns an item, rather than checking the cached data. The following code is an example of this:

```c
var catenaClientEntitlements = FindObjectOfType<CatenaClientEntitlementsManager>();
catenaClientEntitlements.OnGetItem += (object sender, CatenaEntrypoint.PlayerCatalogItem playerCatalogItem) =>
{
    if (playerCatalogItem != null)
    {
        Debug.Log("Player catalog item could not be found");
    }
    else if (!playerCatalogItem.IsOwned)
    {
        Debug.Log($"Player does not own catalog item {playerCatalogItem.CatalogItemId}");
    }
    else
    {
        Debug.Log($"Player has {playerCatalogItem.Count} of catalog item {playerCatalogItem.CatalogItemId}");
    }
};

// Reminder - This will only work if the player is already logged in!
catenaClientEntitlements.GetPlayerOwnsCatalogItem("sample-item-id");
```

### Server-Side Entitlements

Some entitlements functionality can only be done on a trusted service, the most important of which being preparing and executing offers. A server will prepare offers for a player, then send that offer info to the player - the player then picks the offer that they would like, which is then executed by the server.

The following steps are for code that should only be executed on a dedicated server build, which needs to include a valid API Key. How that server gets the API key is up to you - the following steps are for creating and executing an offer on a dedicated server with an API key set up.

1. Create an empty `GameObject` in your Scene.
    1. Rename this `GameObject` to `CatenaServerEntitlements`.
    2. Add the `CatenaServerEntitlementsManager` component to your `GameObject`.

{% admonition type="info" name="What Is The Catena Server Entitlements Manager?" %}
The **Catena Server Entitlements Manager** component houses functionality for a server to both to determine what items the players own, as well as preparing and executing offers on behalf of the player connected to the server.
{% /admonition %}

2. Import the Catena Unity SDK to the Script you'd like to create parties from, if not already done, as well as `Catena.CatenaEntitlements`.

<!-- TODO (@HF): csharp does not appear to be supported. determine how to enable it for better syntax highlighting -->
```c
using Catena.CatenaEntitlements;
using CatenaUnitySDK;
```
3. Add the following code to the script where you would like to prepare the offers from:

<!-- TODO (@HF): csharp does not appear to be supported. determine how to enable it for better syntax highlighting -->
```c
var catenaServerEntitlements = FindObjectOfType<CatenaServerEntitlementsManager>();
catenaServerEntitlements.OnOffersPrepared += (object sender, CatenaEntrypoint.PreparedOffersEventArgs preparedOffers) =>
{
    Debug.Log($"Offers prepared for account preparedOffers.AccountId");
    // Add whatever logic you need here to send the list of offers to the client.
};

// Replace the arguments in this call with the player's account ID that you would like, and the entitlement provider to get the offers from.
catenaServerEntitlements.PrepareOffersForProvider("account-id", EntitlementProvider.Unspecified, "USD");
```

4. Add the following code for when receiving the desired offers from the user

```c
var catenaServerEntitlements = FindObjectOfType<CatenaServerEntitlementsManager>();
catenaServerEntitlements.OnOfferExecuted += (object sender, CatenaEntrypoint.ExecutedPreparedOffersEventArgs executedOffers) =>
{
    Debug.Log($"Offers executed for account preparedOffers.AccountId");
    // Inform the user about their executed offers, most likely prompting the client to get the latest update to their item catalog.
};

// Replace the arguments here with the account ID of the player, and a list of the orders that they would like alongside the quantity of each order.
catenaServerEntitlements.ExecutePreparedOffers("account-id", preparedOrdersWithQuantity);
```

### Demo Example

For an example of the entitlements functionality in action, check out the [Catena Galactic Kittens Demo](https://github.com/CatenaTools/catena-GalacticKittens-demo). In order to enable the entitlements functionality in the demo, you will need to go to `Project Settings > Player > Scripting Define Symbols` and add a defintion for `ENABLE_CATENA_ENTITLEMENTS`. The demo has functionality to list the items that the user owns, solely as a test functionality, can prepare and execute it's own offers from the menu. You will need to provide an API key to the demo for this to work.