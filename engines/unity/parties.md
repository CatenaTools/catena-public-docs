---
markdown:
  toc:
    depth: 3
---

# Unity - Parties

## Prerequisites
* You must be running Catena. It must be run locally or you must have it deployed somewhere. [Instructions for doing so can be found here](../../installation/index.md)
* You must have completed [the Unity Quickstart Guide](./quickstart.md)
* You must have completed [the Unity Authentication Guide](./authentication.md)

## Adding Parties
The first step to adding parties in your project is to set up a method of logging in the player, and getting an account. Once the player is logged in, they should be ready to create or join a party.

For more information on Parties in Catena and the features available, refer to the parties documentation.
<!-- Add in this link when it exists: [refer to the Parties documentation](../../features/parties/index.md). -->

### Creating a party

1. Reminder, if you have not yet completed the [Unity Quickstart Guide](./quickstart.md), and [the Unity Authentication Guide](./authentication.md) please do so now.
2. Return to the scene created in the Unity Authentication Guide, which should already have `CatenaEntrypoint` and `CatenaPlayer`. We will henceforth refer to this as "your Scene".
3. Create an empty `GameObject` in your Scene.
    1. Rename this `GameObject` to `CatenaParties`.
    2. Add the `CatenaPartiesManager` component to your `GameObject`.

#### What Is The Catena Parties Manager?
The **Catena Parties Manager** component houses functionality for operations related to parties. It's a way to more easily interface with the Catena Party endpoints, instead of using the **Catena Entrypoint** component directly.

4. Import the Catena Unity SDK to the Script you'd like to create parties from, if not already done, as well as `Catena.CatenaParties`.

<!-- TODO (@HF): csharp does not appear to be supported. determine how to enable it for better syntax highlighting -->
```c
using Catena.CatenaParties;
using CatenaUnitySDK;
```

5. From the function you'd like to make calls to Catena from, write the following code.

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
{% admonition type="warning" name="Account Needed"%}
In order to create or join a party, the player must already be logged in to Catena, so you must check this before trying to create/join a party. There is a few ways to do this:
* Make sure wherever you are trying to create a party from is called only after account login is completed.
* Have your script subscribe to `CatenaPlayer.OnAccountLoginComplete`, so it is informed when login is complete.
* Check  `CatenaEntrypoint.HasAccount` before making any calls to the Parties manager.
{% /admonition %}
With the party now created, you are now able to send the invite code to other players so they may join the party (The invite code is included in the `PartyEventArgs.Party` provided by the `OnPartyJoin` event). By creating the party, you become the default party leader.
### Joining a Party

In addition to creating parties, you will need the ability for other players to join parties. This is done using the invite code included in the response data from creating a party.

1. Create a `UI > Input Field-TextMeshPro` in your scene, and rename it to `Invite Code`
2. Add a reference to the input field in whatever script you'd like to join parties from.
3. From the script you'd like to join the party from, add the following code:

```c
// Example of reference to input field
public TMP_InputField inviteCode;

public void JoinParty()
{
    var catenaParties = FindObjectOfType<CatenaPartiesManager>();
    catenaParties.OnPartyJoin += (object sender, CatenaEntrypoint.PartyEventArgs partyArgs) =>
    {
        Debug.Log($"Player Joined Party with ID: {partyArgs.Party.PartyId}");
    };

    catenaParties.JoinParty(inviteCode.text);
}
```

4. Call the `JoinParty` function from wherever you'd like, after the input code has already been entered. For example, you could create a button (`UI > Button-TextMeshPro`), then add an `OnClick` event subscriber that calls the `JoinParty` function when clicked.

You should now have the functionality to both create or join a party - with the party data being sent with the `OnPartyJoin` event.

### Leaving a Party

To leave a party, whether the player has created their own party or joined another, all you need to do is add a call to `LeaveParty` in the `CatenaPartiesManager` to your script. Here is some example code:

```c
public void LeaveParty()
{
    var catenaParties = FindObjectOfType<CatenaPartiesManager>();
    catenaParties.OnPartyLeave += (object sender, bool success) =>
    {
        if (success)
        {
            Debug.Log($"Player has left party");
        }
    };

    catenaParties.LeaveParty();
}
```

### Other Party functionality

In addition to joining and leaving parties, there are a few other functions that can be called to modify the party in various ways. Whenever a party is updated, the event `CatenaPartiesManager.OnPartyUpdate` will be invoked, and will contain the updated party data. `OnPartyUpdate` will be invoked in response to either the player attempting to make changes to the party, or if another player in the party makes changes - keeping you up to date with the latest party information.

#### Readying Up

In order to 'ready up', which can be used for cases such as matchmaking, you can call `CatenaPartiesManager.ReadyUp(bool isReady)` - giving the argument True for readying up, and False to un-ready up.

You can get the ready status of a player through the party data that is returned when joining or updating a party.

#### Leader Abilities

The party leader has the ability to both kick a player, and set another player as the party leader - in addition to whatever custom functionality you choose to give the party leader. You can check if the player is the leader via `CatenaPartiesManager.IsLeader()`.

To kick a player, add a call to `CatenaPartiesManager.KickPlayer(string playerId)`, with the argument being the player ID of the player you want to kick. To promote a player to be the leader, you instead call `CatenaPartiesManager.SetLeader(string playerId)`, with the argument being the player ID of the player you want to set as the new leader. (The player ID can be checked through the party data that is returned when joining/updating a party)

You can get the leader status of a player through the party data that is returned when joining or updating a party.

#### Party Metadata

In addition to the ready status and leader status of a player, you can add other arbitrary metadata to both the party and individual players - allowing you to attach data and send that data to other members of the party. To do so, you need to provide a string as the key for the data, and an instance of `Catena.Groups.EntityMetadata`, as well as optionally the player ID of the player to add the metadata to. If a player ID is not given, then the metadata will be added to the overall party.

In addition to creating metadata, there is also functionality to update or remove metadata in a similar fashion. This can be done through the functions `CatenaPartiesManager.CreateMetadata()`, `CatenaPartiesManager.UpdateMetadata()`, and `CatenaPartiesManager.DeleteMetadata()`.

### Sample script

The following is an example script that includes public functions for all the different options for parties, with comments indicating when to call functions, and where to insert your own code, or calls to your own code.

```c
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using CatenaUnitySDK;
using Catena.CatenaParties;

public class PartyManager : MonoBehaviour
{
    private CatenaPartiesManager catenaParties;
    
    // Once the player is in a party, this will contain any information about the current state of the party - 
    // including what players are in the party, what metadata is associated with the parties/players, etc.
    private Party currentParty;

    void Start()
    {
        SetupCatenaEvents();
        catenaParties = FindObjectOfType<CatenaPartiesManager>();
    }

    void SetupCatenaEvents()
    {
        catenaParties.OnPartyJoin += (_, response) =>
        {
            if (response == null || response.Success == false)
            {
                Debug.Log("Failed to create/join a party");
                return;
            }

            Debug.Log($"Created/Joined a party - Party ID: {response.Party.PartyId}");
            currentParty = response.Party;
            // Insert code here to trigger any functionality you would like upon joining a party, such as updating UI.
            // Note that this event is driven off a separate thread, and can't update UI directly.
        };

        catenaParties.OnPartyLeave += (_, Success) =>
        {
            if (!Success)
            {
                Debug.Log("Failed to leave party");
                return;
            }
            Debug.Log($"Left Party");
            currentParty = null;
            // Insert code here to trigger any functionality you would like upon leaving a party.
            // Note that this event is driven off a separate thread, and can't update UI directly.
        };

        catenaParties.OnPartyUpdate += (_, party) =>
        {
            currentParty = party;
            Debug.Log($"Party Updated");
            // Insert code here to trigger any functionality you would like whenever the party is updated. 
            // This can be as a result of the player's actions, or the actions of someone else in the party (for example, someone joining the party or readying up).
            // Note that this event is driven off a separate thread, and can't update UI directly.
        };
    }

    // Call this when the player would like to make their own party.
    public void CreateParty()
    {
        catenaParties.CreateParty();
    }

    // Call this when the player wants to join another player's party.
    public void JoinParty(string inviteCode)
    {
        catenaParties.JoinParty(inviteCode);
    }

    // Call this when the player wants to leave their current party.
    public void LeaveParty()
    {
        catenaParties.LeaveParty();
    }

    // Call this with true when the player is ready - usually by clicking a 'ready up' button.
    public void Ready(bool ready)
    {
        catenaParties.SetReady(ready);
    }

    // Call this to associate any metadata you would like with the party, or a specific player - such as selected character, current level, tags, etc.
    public void CreateMetadata(string key, Catena.Groups.EntityMetadata value, string playerId = "")
    {
        catenaParties.CreateMetadata(key, value, playerId);
    }

    // Call this to update any metadata that was added by CreateMetadata.
    public void UpdateMetadata(string key, Catena.Groups.EntityMetadata value, string playerId = "")
    {
        catenaParties.UpdateMetadata(key, value, playerId);
    }

    // Call this to remove any metadata with the given key associated with either the player or the party.
    public void DeleteMetadata(string key, string playerId = "")
    {
        catenaParties.DeleteMetadata(key, value, playerId);
    }
}
```

### Demo Example

For an example of the party functionality in action, check out the [Catena Galactic Kittens Demo](https://github.com/CatenaTools/catena-GalacticKittens-demo). In order to enable the parties functionality in the demo, you will need to go to `Project Settings > Player > Scripting Define Symbols` and add a defintion for `ENABLE_CATENA_PARTIES`.