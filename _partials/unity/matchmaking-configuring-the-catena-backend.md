Before you integrate the matchmaker into your Unity game, you first need to configure the Catena Backend properly. This configuration will differ depending on the needs of your game. Refer to the [Catena Matchmaker documentation](/features/matchmaking/index.md) for more information.

For ease of testing for a first time integration, we recommend starting with a simple matchmaking **queue** definition that only requires a single player to execute the full matchmaking loop. We'll call that **queue**, `solo`.

We'll also set up a 1v1 **queue** to facilitate two players matchmaking together. We'll call this **queue**, `1v1`.