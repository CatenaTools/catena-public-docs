# Catena Friends Service
Catena uses a Mutual Agreement model, which in simpler terms means that both players must agree to be friends.

## Friends Models
The Friends Service has two different models - the Request Model and the Pair Model.
- The Request Model encompasses the first part of the Friends process - sending and receiving requests.
- The Pair Model encompasses the second and post-linking part of the Friends process - two players linked together as friends.

### Request Model
The Request Model contains 3 pieces of data:
1. The Sender's Account Id
2. The Receiver's Account Id
3. A Timestamp of when the Request was Sent

Three modifying functions are related to this stage of friending:

| Function               | Purpose                                                   | Params                      | Returns |
|------------------------|-----------------------------------------------------------|-----------------------------|---------|
| `SendFriendRequest`    | Sends a friend request to another player                  | `str` - Receiver Account Id | None    |
| `AcceptFriendRequest`  | Accepts a friend request that was sent by another player  | `str` - Sender Account Id   | None    |
| `DeclineFriendRequest` | Declines a friend request that was sent by another player | `str` - Sender Account Id   | None    |

Two informational functions are related to this stage of friending:

| Function                           | Purpose                                        | Params                              | Returns                                                                                                                                            |
|------------------------------------|------------------------------------------------|-------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| `GetOutgoingPendingFriendRequests` | Retrieve an account's outgoing friend requests | `int64` - Limit<br>`int64` - Offset | `List<FriendRequest>` - List of Friend Requests<br>`FriendRequest` contains:<br>&nbsp;`str` - Account Id<br>&nbsp;`int64` - Request Sent Timestamp |
| `GetIncomingPendingFriendRequests` | Retrieve an account's incoming friend requests | `int64` - Limit<br>`int64` - Offset | `List<FriendRequest>` - List of Friend Requests<br>`FriendRequest` contains:<br>&nbsp;`str` - Account Id<br>&nbsp;`int64` - Request Sent Timestamp |

### Pair Model
The Pair Model contains 3 pieces of data:
1. The First Account's Account Id
2. The Second Account's Account Id
3. A Timestamp of when the Pair became Friends

Only one modifying function exists for Friend Pairs:

| Function       | Purpose                         | Params                      | Returns |
|----------------|---------------------------------|-----------------------------|---------|
| `RemoveFriend` | Removes two accounts as friends | `str` - Removing Account Id | None    |

Only one informational function exists for Friend Pairs:

| Function         | Purpose                           | Params                              | Returns                                                                                                                        |
|------------------|-----------------------------------|-------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| `GetFriendsList` | Retrieve an account's friend list | `int64` - Limit<br>`int64` - Offset | `List<Friend>` - List of Friends<br>`Friend` contains:<br>&nbsp;`str` - Account Id<br>&nbsp;`int64` - Became Friends Timestamp |
