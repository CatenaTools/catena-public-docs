---
markdown:
  toc:
    depth: 3
---

# Unity - Parties

## Estimated Time
Configuring Catena parties in your Unity project is estimated to take **<5 minutes**.

## Prerequisites
* You must be running Catena. It must be run locally or you must have it deployed somewhere. [Instructions for doing so can be found here](../../installation/index.md)
* You must have completed [the Unity Quickstart Guide](./quickstart.md)
* You must have completed [the Unity Authentication Guide](./authentication.md)

## Adding Parties
The first step to adding parties in your project is to set up a method of logging in the player, and getting an account. Once the player is logged in, they should be ready to create or join a party

For more information on Parties in Catena and the features available, [refer to the Parties documentation](../../features/parties/index.md).

### Creating a party

1. Reminder, if you have not yet completed the [Unity Quickstart Guide](./quickstart.md), and [the Unity Authentication Guide](./authentication.md) please do so now.
2. Return to the scene created in the Unity Authentication Guide, which should already have `CatenaEntrypoint` and `CatenaPlayer`. We will henceforth refer to this as "your Scene".
3. Create an empty `GameObject` in your Scene.
    1. Rename this `GameObject` to `CatenaParties`.
    2. Add the `CatenaPartiesManager` component to your `GameObject`.

#### What Is The Catena Parties Manager?
The **Catena Parties Manager** component houses functionality for operations related to parties. It's a way to more easily interface with the Catena Party endpoints, instead of interaction with the **Catena Entrypoint** component directly.

4. Import the Catena Unity SDK to whatever Script you'd like to create parties from.

<!-- TODO (@HF): csharp does not appear to be supported. determine how to enable it for better syntax highlighting -->
```c
using Catena.CatenaParties;
using CatenaUnitySDK;
```

5. From the function you'd like to make calls to Catena from, write the following code.
{% admonition type="warning" name="Account Needed"%}
In order to create a party, the player must already be logged in to Catena, so you must check this before trying to create the party. There is a few ways to do this:
* Make sure wherever you are trying to create a party from is called only after account login is completed.
* Have your script subscribe to `CatenaPlayer.OnAccountLoginComplete`, so it is informed when login is complete.
* Check  `CatenaEntrypoint.HasAccount` before making any calls to the Parties manager.
{% /admonition %}
<!-- TODO (@HF): csharp does not appear to be supported. determine how to enable it for better syntax highlighting -->
```c
var catenaParties = FindObjectOfType<CatenaPartiesManager>();
catenaParties.OnPartyJoin += (object sender, CatenaEntrypoint.PartyEventArgs partyArgs) =>
{
    Debug.Log($"Player Joined Party with ID: {partyArgs.Party.PartyId}");
    Debug.Log($"Invite code for party: {partyArgs.Party.InviteCode}");
};

catenaParties.CreateParty();
```

With the party now created, you are now able to send the invite code to other players so they may join the party. By creating the party, you become the default party leader.
### Joining a Party

In addition to creating parties, you will need the ability for other players to join parties. This is done using the invite code included in the response data from creating a party.

<!-- TODO (@CJ): Include instructions to add a text input field, to grab the invite code from.-->
```c
var catenaParties = FindObjectOfType<CatenaPartiesManager>();
catenaParties.OnPartyJoin += (object sender, CatenaEntrypoint.PartyEventArgs partyArgs) =>
{
    Debug.Log($"Player Joined Party with ID: {partyArgs.Party.PartyId}");
    Debug.Log($"Invite code for party: {partyArgs.Party.InviteCode}");
};

catenaParties.JoinParty("Invite Code");