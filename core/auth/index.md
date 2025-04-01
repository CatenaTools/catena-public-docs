# Auth Framework

Most of the RPCs provided by Catena services require some form of authorization to use. For example, the call may
require:

* a session to correlate state for the user - their account, party, etc
* elevated privileges - an admin account to delete a leaderboard entry
* a trusted service - a game server reading match information or granting items

Authorization in Catena is handled in two distinct forms:

* [Sessions](sessions.md) - A session is typically produced by an authentication service when a user/client successfully logs in.
* [API keys](api-keys.md) - An API key is created for a particular server/website/service and usually applied in that service's
  configuration.

Either a session or an API key should be passed in the header of any request which requires it. A service does not need
to be concerned with processing this information; the Catena node will process the headers and will only call a
service's RPC method with the request if authorization is successful.

A service RPC method can only require a particular session type or an API key to access it, not multiple types. This is done to reduce complexity
and make authorization safer. This means there may be several variants of an RPC to support access by users, admin, and servers.