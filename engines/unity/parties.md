---
markdown:
  toc:
    depth: 3
---

# Unity - Parties

## Prerequisites
* {% partial file="/_partials/unity/running-catena-prereq.md" /%}
* You must have completed [the Unity Quickstart Guide](./quickstart.md).
* You must have completed [the Unity Authentication Guide](./authentication.md).

## Adding Parties
The first step to adding parties in your project is to set up a way for the player to log in and get an account. Once the player is logged in, they should be ready to create or join a party.

For more information on Parties in Catena and the features available, refer to the parties documentation.
<!-- Add in this link when it exists: [refer to the Parties documentation](../../features/parties/index.md). -->

### Creating a party

1. Reminder: if you have not yet completed the [Unity Quickstart Guide](./quickstart.md) and [the Unity Authentication Guide](./authentication.md), please do so now.
2. Return to the scene created in the Unity Authentication Guide, which should already have `CatenaEntrypoint` and `CatenaPlayer`. We will  refer to this as "your scene".
3. Create an empty `GameObject` in your scene.
    1. Rename this `GameObject` to `CatenaParties`.
    2. Add the `CatenaPartiesManager` component to your `GameObject`.

{% admonition type="info" name="What Is The Catena Parties Manager?" %}
The **Catena Parties Manager** component houses functionality for operations related to parties. It's an easier way to interface with the Catena Party endpoints, instead of using the **Catena Entrypoint** component directly.
{% /admonition %}

4. If you haven't already done so, add the following imports to the script you'd like to create parties from:

<!-- TODO (@HF): csharp does not appear to be supported. determine how to enable it for better syntax highlighting -->
```c
using Catena.CatenaParties;
using CatenaUnitySDK;
```

5. In the function you'll use to make calls to Catena, write the following code:

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
In order to create or join a party, the player must already be logged in to Catena, so you must check this before trying to create/join a party. There are a few ways to do this:
* Ensure the method that tries to create a party is only called after successful account login.
* Have your script subscribe to `CatenaPlayer.OnAccountLoginComplete`, so it is informed when login is complete.
* Check  `CatenaEntrypoint.HasAccount` before making any calls to the Parties manager.
{% /admonition %}
With the party now created, you are now able to send the invite code to other players so they may join the party (The invite code is included in the `PartyEventArgs.Party` provided by the `OnPartyJoin` event.)

{% admonition type="info" %}
By creating the party, you become the default party leader.
{% /admonition %}

### Joining a Party

In addition to creating parties, you will need the ability for other players to join parties. This is done using the invite code included in the response data from creating a party.

1. Create a `UI > Input Field-TextMeshPro` in your scene, and rename it to `Invite Code`
2. Add a reference to the input field in whatever script you'd like to join parties from.
3. In the script you'd like to join the party from, add the following code:

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

You should now have the functionality to both create or join a party — with the party data being sent with the `OnPartyJoin` event.

### Leaving a Party

To leave a party, whether the player has created their own party or joined another, all you need to do is add a call to `LeaveParty` in the `CatenaPartiesManager` to your script. For example:

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

## Other Party Functionality

### Events

In addition to joining and leaving parties, there are a few other functions that can be called to modify the party.
{% admonition type="info" %}
Whenever a player makes changes to a party, the `CatenaPartiesManager.OnPartyUpdate` event will be invoked, and will contain the updated party data.
{% /admonition %}
`OnPartyUpdate` keeps you up to date with the latest party information.

### Readying Up

In some cases, it may be helpful to have players indicate when they are "ready". For example, the party leader may need everyone to be ready before starting matchmaking. 

To "ready up" a party member, you can call `CatenaPartiesManager.ReadyUp(bool isReady)`, with the argument `True` for readying up, and `False` to un-ready up. This sets a status which can be checked to confirm whether a given party member is ready.

You can get the ready status of a player through the party data that is returned when joining or updating a party.

### Leader Abilities

The party leader has access to some functionality that the other players do not — such as kicking players, or promoting other players to leaders.

#### Check the leader status of a player:
You can see if the current user is the leader via `CatenaPartiesManager.IsLeader()`. You can also check a player's leader status through the party data that is returned when joining or updating a party.

#### Kick a player:
Add a call to `CatenaPartiesManager.KickPlayer(string playerId)`, passing the player ID of the player you want to kick.

#### Promote a player to be the leader:
Add a call to`CatenaPartiesManager.SetLeader(string playerId)`, passing the player ID of the player you want to set as the new leader. (You can get the player ID from the party data that is returned when joining/updating a party.)

### Party Metadata

In addition to the ready status and leader status of a player, you can add other arbitrary metadata to the party and to individual players. That data will be made available to all members of the party. 

#### Create metadata:
Make a call to `CatenaPartiesManager.CreateMetadata`. You will need to provide:
- a string as the key for the data
- an instance of `Catena.Groups.EntityMetadata`
- (optionally) the player ID of the player to add the metadata to

If a player ID is not given, then the metadata will be added to the overall party.

#### Update metadata:
Similarly, make a call to `CatenaPartiesManager.UpdateMetadata()`, providing:
- the key for the data you want to update
- the updated metadata
- (optionally) the player ID

You can also optionally add an `UpdateMetadataOperationType`, indicating whether you want to overwrite or append to the data. (Overwriting is the default.)

#### Delete metadata:
Make a call to `CatenaPartiesManager.DeleteMetadata()`, providing:
- the key for the data you want to delete
- (optionally) the player ID

You can optionally define a `DeleteJsonMetadataTypeType` (which defaults to the entire entry), and a list of JSON properties to remove, if you don't want to delete the whole entry.

## Sample script

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

## Party Matchmaking

If you also have matchmaking in your game, you have the ability to matchmake with parties. There are two ways to initiate Party Matchmaking - directly by using `CatenaPlayer`, or matchmaking through `CatenaPartiesManager`.

In `CatenaPlayer`, there is a function called `CatenaPlayer.EnterPartyMatchmaking`, which takes in the following as arguments:
- The list of players to matchmake with
- a string to indicate which player is the party leader
- A dictionary to contain the match metadata, mapping strings to `EntityMetadata`. (Can contain whatever data needed, but most importantly needs a defined `queue_name` entry)

After starting matchmaking this way, the rest of the flow is similar to normal matchmaking - which you can find more about in [the Unity Matchmaking Guides](./matchmaking/index.md). One thing to note is that the other party members must also already be listening for matchmaking events, despite not starting the matchmaking themselves - as they will be notified when a match is found.

For a simpler method to approach party matchmaking, you can use the `CatenaPartiesManager` to indirectly call the start match functionality. If you call `CatenaPartiesManager.StartMatchmaking`, the only thing you need to provide is the Match Metadata - and the manager will use the current party information to fill out the rest of the request.

## Demo Example

For an example of the party functionality in action, check out the [Catena Galactic Kittens Demo](https://github.com/CatenaTools/catena-GalacticKittens-demo). In order to enable the parties functionality in the demo, you will need to go to `Project Settings > Player > Scripting Define Symbols` and add a defintion for `ENABLE_CATENA_PARTIES`.