# Audit Logging

## What Is Audit Logging?
Audit Logging is the process of keeping a history of any _modifying_ actions that users, admins, and sometimes servers have made.
Modifying actions are typically creating/adding, deleting, or updating some piece of data, but any instance where data is being altered falls under this umbrella.

Every time an action is called, the audit log will record up to two parts: the attempt and - if the action went through cleanly - the success.
If the action has missing parameters, the attempt will not be logged.

For the sake of this documentation, the terms 'action' and 'event' are interchangeable.

## Data Storage
At the moment, the default storage location for audit logs uses SQLite and can be found in the `audit_log` table within your `Build/SQLiteDatabase/audit.db` file in the `catena-tools-core` project.
However, the storage method itself is modular, and you may wish to reconfigure it.
Please see the [Choosing Modules](/core/choosing-modules.md) page for further information.

### Data Format
| column name   | type             | description                                                                                                                                |
|---------------|------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| audit_id      | string           | A unique uuid for the log.                                                                                                                 |
| log_time      | long             | The number of seconds since the Unix Epoch.                                                                                                |
| audit_context | stringified json | Contains session information, API key information, and custom audit context.                                                               |
| event         | string           | The calling event, in a dot-name format.<br>e.g. Accepting a friend request would be `friends.accept.attempt` and `friends.accept.success` |
| event_data    | stringified json | Data relevant to the event. This varies based on the specific event being called.                                                          |

> The `CustomAuditContext` section of the `audit_context` data string includes relevant data from the _caller_ of the action.
> e.g. When a user attempts to create a party, the following snippet gets logged: `"CustomAuditContext":{"AccountId":"account-37715543-9b82-4103-ab4d-61482958182a","AccountRole":"user"}`

## Services
Below is a complete list of all actions that are logged, along with the data that gets logged when those actions are triggered.
Actions are sorted by service, and further split by user actions, admin actions, and server actions.

### Accounts

#### User Actions
| Function                    | Data Logged on Attempt             | Data Logged on Success                                 |
|-----------------------------|------------------------------------|--------------------------------------------------------|
| CreateOrGetAccountFromToken | Platform Type, Platform Account Id | Catena Account Id, Platform Types linked to Account    |
| LinkAccountToPlatform       | Platform Type                      | Platform Type                                          |
| UpdateAccount               | Account Metadata Key/Value Pairs   | Account Metadata Key/Value Pairs                       | 
| CreateMetadataEntry         | Account Metadata Key/Value Pair    | Account Metadata Key/Value Pair                        |
| UpdateMetadataEntry         | Account Metadata Key/Value Pair    | Account Metadata Key/Value Pair, Update Operation Type |
| DeleteMetadataEntry         | Account Metadata Key/Value Pair    | Account Metadata Key/Value Pair, JSON Handling Type    |

#### Admin Actions
| Function                 | Data Logged on Attempt                             | Data Logged on Success                                                    |
|--------------------------|----------------------------------------------------|---------------------------------------------------------------------------|
| AdminCreateAccount       | Display Name                                       | Catena Account Id, Platform Types linked to Account                       |
| AdminDeleteAccount       | Catena Account Id                                  | Catena Account Id                                                         |
| AdminCreateMetadataEntry | Catena Account Id, Account Metadata Key/Value Pair | Catena Account Id, Account Metadata Key/Value Pair                        |
| AdminUpdateMetadataEntry | Catena Account Id, Account Metadata Key/Value Pair | Catena Account Id, Account Metadata Key/Value Pair, Update Operation Type |
| AdminDeleteMetadataEntry | Catena Account Id, Account Metadata Key/Value Pair | Catena Account Id, Account Metadata Key/Value Pair, JSON Handling Type    |

#### Server Actions
| Function                 | Data Logged on Attempt                             | Data Logged on Success                                                    |
|--------------------------|----------------------------------------------------|---------------------------------------------------------------------------|
| ServerCreateAccount †    | Display Name                                       | Catena Account Id, Platform Types linked to Account                       |
| ServerLinkAccount        | Catena Account Id, Platform Type                   | Catena Account Id, Platform Type                                          |

> † `ServerCreateAccount` is a special case: after creating an account, the server will automatically attempt to link the account to a platform.

### Announcements

#### Admin Actions

| Function                           | Data Logged on Attempt | Data Logged on Success |
|------------------------------------|------------------------|------------------------|
| AdminAnnounce                      | Message                | Message                |
| AdminClearPersistentAnnouncement † |                        | Message                |

> † `AdminClearPersistentAnnouncement` does not have an attempt.

### API Keys

#### Admin Actions
| Function                | Data Logged on Attempt                     | Data Logged on Success                     |
|-------------------------|--------------------------------------------|--------------------------------------------|
| AdminCreateApiKeyPolicy | Policy Name, Policy Permissions            | Policy Id, Policy Name, Policy Permissions |
| AdminUpdateApiKeyPolicy | Policy Id, Policy Name, Policy Permissions | Policy Id, Policy Name, Policy Permissions |
| AdminDeleteApiKeyPolicy | Policy Id                                  | Policy Id                                  |
| AdminCreateApiKey       | Api Key Name, Policy Id                    | Api Key, Api Key Name, Policy Id           |
| AdminUpdateApiKey       | Api Key, Api Key Name, Policy Id           | Api Key, Api Key Name, Policy Id           |
| AdminDeleteApiKey       | Api Key                                    | Api Key                                    |

### Authentication

#### Session-Based Actions

| Function          | Data Logged on Attempt | Data Logged on Redirect † | Data Logged on Success              |
|-------------------|------------------------|---------------------------|-------------------------------------|
| AwaitSession      | None                   | N/A                       | Platform Type                       |
| Logout            | Account Id             | N/A                       | Account Id                          |
| LoginWithProvider | Provider               | Provider                  | Account Id, Provider, Platform Type |

> Because authentication surrounds the account login process, these functions are lacking the usual `CustomAuditContext` that would usually log account information.

> † `LoginWithProvider` can redirect to OAuth2.

#### Admin Actions
| Function                       | Data Logged on Attempt | Data Logged on Success      |
|--------------------------------|------------------------|-----------------------------|
| AdminAddOrUpdateProviderConfig | Provider               | Provider                    |
| AdminToggleProvider            | Provider               | Provider, Is Enabled Status |

### Entitlements

#### User Actions
| Function            | Data Logged on Attempt | Data Logged on Success      |
|---------------------|------------------------|-----------------------------|
| CancelSubscription  | Subscription Id        | Subscription Id             |

#### Admin Actions
| Function                                  | Data Logged on Attempt                   | Data Logged on Success                                      |
|-------------------------------------------|------------------------------------------|-------------------------------------------------------------|
| AdminCreateCatalogItem                    | Item Name                                | Item Name, Item Id                                          |
| AdminDeleteCatalogItem                    | Item Id                                  | Item Id                                                     |
| AdminUpdateCatalogItem                    | Varies †                                 | Varies †                                                    |
| AdminRevokeAccountCatalogItem             | Account Id, Item Id                      | Account Id, Item Id                                         |
| AdminSetAccountCountableCatalogItem       | Account Id, Item Id, Item Count          | Account Id, Item Id, Item Count                             |
| AdminIncrementAccountCountableCatalogItem | Account Id, Item Id, Item Count Delta    | Account Id, Item Id, Item Count Delta                       |
| AdminDecrementAccountCountableCatalogItem | Account Id, Item Id, Item Count Delta    | Account Id, Item Id, Item Count Delta                       |
| AdminPlaceOrderWithProvider               | Provider, Account Id, Item Id(s)         | Order Id, Provider Id, Account Id, Item Id(s)               |
| AdminRefundOrderWithProvider              | Order Id, Provider Id                    | Order Id, Provider Id                                       |
| AdminStartSubscriptionWithProvider        | Provider, Account Id, Item Id(s)         | Subscription Id, Order Id, Provider, Account Id, Item Id(s) |
| AdminCancelSubscription                   | Subscription Id                          | Subscription Id                                             |
| AdminModifyProviderCatalogItemData        | Provider, Item Id, Update Operation Type | Provider, Item Id, Update Operation Type                    |
| AdminRemoveProviderCatalogItemData        | Provider, Item Id                        | Provider, Item Id                                           |
| AdminAddCatalogItemPurchasePrice          | Provider, Item Id, Item Price            | Provider, Item Id, Item Price                               |
| AdminUpdateCatalogItemPurchasePrice       | Provider, Item Id, Item Price            | Provider, Item Id, Item Price                               |
| AdminDeleteCatalogItemPurchasePrice       | Provider, Item Id                        | Provider, Item Id                                           |

> † `AdminUpdateCatalogItem` logs information specific to the update action: Item Name, Item Description, Is Item Published, Custom Item Id

#### Server Actions
| Function                                   | Data Logged on Attempt                      | Data Logged on Success                      |
|--------------------------------------------|---------------------------------------------|---------------------------------------------|
| ServerCancelSubscription                   | Subscription Id                             | Subscription Id                             |
| ServerModifyProviderCatalogItemData        | Provider Id, Item Id, Update Operation Type | Provider Id, Item Id, Update Operation Type |
| ServerRemoveProviderCatalogItemData        | Provider, Item Id                           | Provider, Item Id                           |
| ServerIncrementAccountCountableCatalogItem | Account Id, Item Id, Item Count Delta       | Account Id, Item Id, Item Count Delta       |
| ServerDecrementAccountCountableCatalogItem | Account Id, Item Id, Item Count Delta       | Account Id, Item Id, Item Count Delta       |

### Friends

#### User Actions
| Function             | Data Logged on Attempt | Data Logged on Success |
|----------------------|------------------------|------------------------|
| SendFriendRequest    | Account Id             | Account Id             |
| AcceptFriendRequest  | Account Id             | Account Id             |
| DeclineFriendRequest | Account Id             | Account Id             |
| RemoveFriend         | Account Id             | Account Id             |

### Match Broker

#### Admin Actions
| Function            | Data Logged on Attempt | Data Logged on Success |
|---------------------|------------------------|------------------------|
| AdminEndActiveMatch | Match Id               | Match Id               |

### Matchmaking

#### User Actions
| Function          | Data Logged on Attempt | Data Logged on Success |
|-------------------|------------------------|------------------------|
| StartMatchmaking  | Entity                 | Entity                 |
| CancelMatchmaking | Ticket Id              | Ticket Id              |

#### Server Actions
| Function                | Data Logged on Attempt | Data Logged on Success |
|-------------------------|------------------------|------------------------|
| ServerStartMatchmaking  | Entity                 | Entity                 |
| ServerCancelMatchmaking | Ticket Id              | Ticket Id              |

### Node Control

#### Admin Actions
| Function                                | Data Logged on Attempt    | Data Logged on Success    |
|-----------------------------------------|---------------------------|---------------------------|
| AdminRestartNode                        | None                      | None                      |
| AdminSetPreferredImplementationOverride | Interface, Implementation | Interface, Implementation |

### Parties

#### User Actions
| Function                | Data Logged on Attempt                                         | Data Logged on Success                                         |
|-------------------------|----------------------------------------------------------------|----------------------------------------------------------------|
| CreateParty             | None                                                           | Party Id                                                       |
| UpdatePartyPlayer       | None                                                           | Varies †                                                       |
| JoinPartyWithInviteCode | Invite Code                                                    | Invite Code, Party Id                                          |
| SetPartyLeader          | Party Id, Account Id                                           | Party Id, Account Id                                           |
| KickFromParty           | Party Id, Account Id                                           | Party Id, Account Id                                           |
| LeaveParty              | Party Id                                                       | Party Id                                                       |
| CreateMetadataEntry     | Party Id, Party Metadata Key/Value Pair                        | Party Id, Party Metadata Key/Value Pair                        |
| UpdateMetadataEntry     | Party Id, Party Metadata Key/Value Pair, Update Operation Type | Party Id, Party Metadata Key/Value Pair, Update Operation Type |
| DeleteMetadataEntry     | Party Id, Party Metadata Key/Value Pair, JSON Handling Type    | Party Id, Party Metadata Key/Value Pair, JSON Handling Type    |

> † `UpdatePartyPlayer` logs information specific to the update action: Display Name, Is Ready, Is Leader, Team Number, Metadata

#### Admin Actions

| Function              | Data Logged on Attempt | Data Logged on Success      |
|-----------------------|------------------------|-----------------------------|
| AdminCreateParty      | Leader Account Id      | Party Id, Leader Account Id |
| AdminUpdateParty      | Party Id               | Party Id, Varies †          |
| AdminDeleteParty      | Party Id               | Party Id                    |
| AdminDeleteAllParties | None                   | None                        |

> † `AdminUpdateParty` logs information specific to the update action: Leader Account Id, Kick Ids, Join Ids, Metadata

### Platform Auth

#### Admin Actions
| Function                   | Data Logged on Attempt | Data Logged on Success |
|----------------------------|------------------------|------------------------|
| AdminDeleteLoginInfo       | Replay Token           | Replay Token           |
| AdminRegisterDeviceForAuth | Device Id              | Device Id              |
| AdminRemoveDeviceForAuth   | Device Id              | Device Id              |

### Titles

#### Admin Actions
| Function                | Data Logged on Attempt                                                             | Data Logged on Success                                                                         |
|-------------------------|------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| AdminCreateTitle        | Title Name                                                                         | Title Name, Title Id                                                                           |
| AdminUpdateTitle        | Title Id, Title Name                                                               | Title Id, Title Name                                                                           |
| AdminDeleteTitle        | Title Id                                                                           | Title Id                                                                                       |
| AdminCreateTitleRelease | Title Id, Title Uri, Byte Count, Checksum, Checksum Alg, Platform Type             | Title Id, Release Id, Title Name, Title Uri, Byte Count, Checksum, Checksum Alg, Platform Type |
| AdminUpdateTitleRelease | Release Id, Title Id, Title Uri, Byte Count, Checksum, Checksum Alg, Platform Type | Release Id, Title Id, Title Uri, Byte Count, Checksum, Checksum Alg, Platform Type             |
| AdminDeleteTitleRelease | Release Id                                                                         | Release Id                                                                                     |
| AdminCreateTitlePatch   | Release Id, Title Uri, Byte Count, Checksum, Checksum Alg                          | Release Id, Patch Id, Title Uri, Byte Count, Checksum, Checksum Alg                            |
| AdminUpdateTitlePatch   | Patch Id, Release Id, Title Uri, Byte Count, Checksum, Checksum Alg                | Patch Id, Release Id, Title Uri, Byte Count, Checksum, Checksum Alg                            |
| AdminDeleteTitlePatch   | Patch Id                                                                           | Patch Id                                                                                       |