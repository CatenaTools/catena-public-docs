# Orders

The Catena entitlements system has an internal structure for basic order data shared by all order providers: items,
price, currency, etc. Subscriptions will include this same data and an interval. Some order providers require additional
data - see [Attaching provider-specific data to orders](#attaching-provider-specific-data-to-orders).

Certain order providers may have limitations even in the basic order data. For example, the Steam order provider limits
subscriptions to one item only where other order providers may allow creating a subscription containing multiple items.

Normally, orders will be placed by players/clients using the [offers system](offers.md) with a particular provider based
on the platform running the game. Orders may also be initiated directly by an admin for testing/development using
`AdminPlaceOrderWithProvider`, ex:

{% openapi-code-sample operationId="catena.catena_entitlements.CatenaEntitlements_AdminPlaceOrderWithProvider"
descriptionFile="../../apis/catena-tools-core.yaml" /%}

## Attaching provider-specific data to orders

Many order providers will require additional information such as a language, platform session ID, etc in addition to the
basic order data.

When necessary, this additional information can be attached by clients when calling `ExecutePreparedOffer` or directly
in the `provider_order_metadata` portion of `AdminPlaceOrderWithProvider`. The specific fields and data will vary by
order provider.