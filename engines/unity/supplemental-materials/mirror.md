---
markdown:
  toc:
    depth: 3
---

# Mirror Networking
This is a guide on how to configure two Unity clients that connect to each other using the open source [Mirror Networking](https://mirror-networking.com/) package. It has nothing to do with Catena itself, but is supplemental material to get you up and running with a baseline Unity project that can make use of Catena's features.

_Note: This guide uses code and information from [Shrine's Mirror Networking series on YouTube](https://www.youtube.com/playlist?list=PLXEG2omgKgCapAmGe20XBgd87rmxFdKhK)._

## Estimated Time
Setting up this demo is estimated to take **<10 minutes**.

## Prerequisites
* Unity Editor, version **2021.3.35** or higher

## Initial Setup

### Install The Dedicated Server Module

1. Open your Unity Project
2. Open "Build Profiles" by navigating to `File -> Build Profiles`
3. Select "Windows Server"
4. Select "Install with Unity Hub" if "No Windows Server module loaded" is displayed. If not, you are done with this step.
5. If you needed to install, select "Windows Dedicated Server Build Support" in the Unity Hub Window that popped up.
6. Install.
7. Once installed, restart your editor.

### Download + Install The Mirror Sample

1. Open your Unity Project
2. Open the Asset Store by navigating to `Window -> Asset Store`
3. Search for "Mirror"
4. Select the "Mirror" Asset from "Mirror Networking". You can also find a link directly to Mirror [here](https://assetstore.unity.com/packages/tools/network/mirror-129321)
5. Select "Open in Unity"
6. In Unity, select "Download"
7. Select "Import"
    1. If prompted to "Install/Upgrade" dependencies, do so
8. Import all

### Download + Install ParrelSync
[ParrelSync](https://github.com/VeriorPies/ParrelSync) is a Unity editor extension that allows developers to test multiplayer gameplay without building project binaries. This is accomplished by having another Unity Editor window opened which ParrelSync mirrors the changes to from the original project.

1. Open the Package Manager by navigating to `Window -> Package Manager`
2. Select the `+` to add a package
    1. Select "Add package from git URL..."
    2. Paste the following URL: `https://github.com/VeriorPies/ParrelSync.git?path=/ParrelSync`
3. You will now see a "ParrelSync" option in the toolbar at the top of the Unity Editor
4. Open the Clones Manager by navigating to `ParrelSync -> Clones Manager`
5. Select "Create new clone"
6. When your clone is created, select "Open in New Editor"
7. Changes that are made in your original editor will now automatically be mirrored into the clone editor, which we will use later to test our multiplayer functionality

## Create Your Multiplayer Experience

### Setting Up The Network Components
1. Select the scene you would like to add Multiplayer functionality to. If you are starting from a fresh Unity project, this will be located at `Assets/Scenes/SampleScene.unity`
2. Create an empty `GameObject` in your Scene and name it `NetworkManager`
3. Add three components to your `NetworkManager` object
    1. The Mirror `Network Manager`
    2. The Mirror `Telepathy Transport (Script)`
    2. The Mirror `Network Manager HUD`
4. Set the `Network Manager -> Network Info -> Transport` to the `NetworkManager (Telepathy Transport)` component

[ ![telepathy transport](/images/unity/telepathy-transport.png) ](/images/unity/telepathy-transport.png)

5. Create a new 3D Object in your scene, selecting a Cube and name it `Player`
6. Add a component to your `Player` _object_
    1. The Mirror `Network Identity`
7. Create a new folder in your `Assets/` directory, called `Prefabs`
8. Drag the `Player` _object_ from your scene into the `Assets/Prefabs/` folder, creating a `Player` _prefab_
8. Select your `NetworkManager` in your scene. Drag your `Assets/Prefabs/Player` _prefab_ into the `Network Manager -> Player Object -> Player Prefab`

[ ![player prefab](/images/unity/player-prefab.png) ](/images/unity/player-prefab.png)

9. Delete the `Player` _object_ from the Scene. The prefab will be loaded into the scene dynamically when players join during gameplay

### Configuring Basic Player Controls
1. Create an new folder in your `Assets/` directory called `Scripts` if one does not yet exist
2. Create a new `MonoBehaviour Script` in `Assets/Scripts/`, calling it `Player`
3. Open the `Assets/Scripts/Player.cs` file in your editor of choice
4. Replace the file's contents with the code below

```c
using Mirror;
using UnityEngine;

namespace PlayerPrefab
{
    public class Player : NetworkBehaviour
    {
        void HandleMovement()
        {
            if (isLocalPlayer)
            {
                float moveHorizontal = Input.GetAxis("Horizontal");
                float moveVertical = Input.GetAxis("Vertical");
                Vector3 movement = new Vector3(moveHorizontal * 0.1f, moveVertical * 0.1f, 0);
                transform.position = transform.position + movement;
            }
        }

        void Update()
        {
            HandleMovement();
        }
    }
}
```

10. Back in your Unity Editor, double click the `Player` _prefab_ to open it
11. Add two components to your `Player` prefab
    1. The `Player.cs` script you just wrote
    2. The Mirror `Network Transport (Reliable)`

### Testing It Out
1. Re-open your Scene
2. Press play on both your main Unity Editor and the clone that ParrelSync is mirroring to
3. In one editor, select "Host (Server x Client)"
4. In the other, select "Client", leaving the fields as is
5. When you move your cube in one editor with WASD, you should see it move in the other editor as well
6. Congratulations! You have an MVP of a multiplayer game in Unity