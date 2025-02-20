# Quickstart: Unreal

{% admonition type="info" name="Before You Get Started" %}
    Ensure you are [running Catena either locally or have it deployed somewhere](../../installation/index.md).
{% /admonition %}

## Estimated Time
The initial integration of Catena to your Unreal project is estimated to take **~15 minutes**.

## Install the SDK
### 1. Obtain the SDK
Catena is distributed via Git. You must have Git installed. [Instructions for installing Git can be found here](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).

To gain access to the [Catena Unreal Plugin](https://github.com/CatenaTools/catena-unreal-plugin), please contact us to obtain a license. Once you have access, clone the repository to your machine using the following command.

```bash
git clone https://github.com/CatenaTools/catena-unreal-plugin.git
```

### 2. Install SDK

{% admonition type="warning" name="Plugin Dependency"%}
    The `OnlineServicesCatena` plugin requires the `CommonUser` plugin provided by Epic Games as a dependency. This can be obtained from the UE5 Lyra sample game source code on [Epic Games Github](https://github.com/EpicGames/UnrealEngine/tree/ue5-main/Samples/Games/Lyra/Plugins/CommonUser), or the Epic Games launcher after downloading the Lyra sample game.
    [More information can be found here](https://dev.epicgames.com/documentation/en-us/unreal-engine/common-user-plugin-in-unreal-engine-for-lyra-sample-game#installingtheplugin).
{% /admonition %}

If your project does not contain a `Plugins` folder then create one. Copy the `OnlineServicesCatena` directory into the `Plugins` directory of your Unreal project. You should now have the SDK at `<your_unreal_project_path>/Plugins/OnlineServicesCatena/`.

### 3. Enable the Plugin

{% admonition type="info" name="Additional Plugin Requirement" %}
    Ensure that the `OnlineServices` plugin is enabled in order to utilize `OnlineServicesCatena`.
{% /admonition %}

In order to utilize `OnlineServicesCatena` the plugin needs to be enabled.
Enabling `OnlineServicesCatena` can be done in one of two ways.

- Enable the plugin in the Editor:
    1. Open the editor
    2. Go to `Edit` -> `Plugins`
    3. Find Catena plugin `OnlineServicesCatena` and check the `Enabled` box
    4. Restart the Unreal Editor

- Enable the plugin in the `.uproject` file:
    1. Open you projects `.uproject` file
    2. Add the following value to the `Plugins` section
``` json
"Plugins": [
    {
        "Name": "OnlineServicesCatena",
        "Enabled": true
    }
]
```


## Configuration

### 1. Configure CommonUser

In order to use `OnlineServicesCatena` you will need to configure the `CommonUser` plugin from using the older `OnlineSubsystem` to the newer `OnlineServices`. This is partially done in the `CommonUser` plugin folder. If you do not have the plugin then install it from the [Epic Games Github](https://github.com/EpicGames/UnrealEngine/tree/ue5-main/Samples/Games/Lyra/Plugins/CommonUser). If you do not have access then [follow the steps here to gain access](https://www.unrealengine.com/en-US/ue-on-github).

Within the `CommonUser` plugin folder navigate and open the `CommonUser.Build.cs` file. The path should be like this `<your_unreal_project_path>/Plugins/CommonUser/Source/CommonUser.Build.cs`.

Find the `bUseOnlineSubsystemV1` variable and set it to false:
``` csharp
    bool bUseOnlineSubsystemV1 = false;
```

To finish enabling `OnlineServices` follow the next section.

### 2. Configure DefaultGame.ini

In your projects `Config` folder open up the file `DefaultGame.ini`.

Enable `OnlineServicesInterface` build dependencies for `OnlineServices` by adding the following:
``` ini
[/Script/Engine.OnlineEngineInterface]
bUseOnlineServicesV2=true
```

Add the following to set `OnlineServicesCatena` to be used as the default service:
``` ini
[OnlineServices]
DefaultServices=GameDefined_0
```

### 3. Configure DefaultEngine.ini

To set the backend url of  `OnlineServicesCatena` add the following:
``` ini
[OnlineServicesCatena]
BackendURL="http://localhost:5000"
```

The provided example will expect to hit a local running instance of the Catena backend.
The value can be changed depending on the backend instance you are trying to make requests to.

{% card title="Setting up Catena" to="/installation/index.md" %}
    To learn more on standing up Catena on a local instance or deploy on a live environment go here.
{% /card %}

### 4. Edit Project Module Dependencies

Navigate to your projects `build.cs` file found under your projects `Source` folder. 

If you do not have a `Source` folder launch Unreal Engine click on `Tools` -> `New C++ Class...` and create a new class. 
This will generate the source code and solution for your project.

The `.build.cs` folder can be found in the following directory `<your_unreal_project_path>/Source/<ProjectName>/<ProjectName>.build.cs`.
Open the file and add `"CoreOnline"`, `"CommonUser"`, and`"OnlineServicesInterface"` to `PublicDependencyModuleNames`.
Your file will look similar to the following:
``` csharp
public class CatenaExample : ModuleRules
{
    public CatenaExample(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
	
        PublicDependencyModuleNames.AddRange(new string[] { 
            "Core", 
            "CoreUObject", 
            "Engine", 
            "InputCore", 
            
            // Online features
            "CoreOnline", // Access for core online features
            "CommonUser", // CatenaServices dependency for auth
            "OnlineServicesInterface" // Access for service interfaces
        });
        
        // Rest of code
    }
}
```

## Hello World

In this section we will demonstrate how to perform a login.
We will use the `CommonUser` plugin to kick off the login flow.
To learn more about the `CommonUser` plugin [you can read this documentation.](https://dev.epicgames.com/documentation/en-us/unreal-engine/common-user-plugin-in-unreal-engine-for-lyra-sample-game#commonusersubsystem)

For this login request we will be logging in using a test account.

### 1. Player Login Using Blueprints

1. Run the editor
2. Click `Open Level Blueprint`. This can be found in the blueprint button left of the play button.
![image](../../images/unreal/quick-start/open-level-bp.png)
3. Right-click on the Event Graph. Search for `Get CommonUserSubsystem` and create the node.
4. Drag from this nodes return pin and search for `Try to Login User for Online Play` and create that node.
5. Finally, connect the `Event BeginPlay` exec pin to the input exec pin. Your event graph should look like this:
![image](../../images/unreal/quick-start/quick-start-loginBp-graph.png)
6. Press the Play button.

You will notice in your logs for the `LogOnlineServices` category a response message similar to:
```LogOnlineServices: Successfully logged in as a test user!```

With that you have successfully performed your first request to Catena!

### 2. Player Login Using C++

1. Run the editor
2. Click `Tools` -> `New C++ Class`
3. Choose `Game Mode Base` as the Parent Class
4. Click `Next`
5. Name class for your project and set desired path
6. Click `Create Class`
7. Open your IDE to the class files you have created.
   1. You can find your projects `.sln` file in the projects directory.
   2. Open the `.sln` file with your preferred editor.
8. Close the UE Editor.

Next we will setup the class to call login when the game is initialized.
Open up your game mode class header file and add the following code:
``` c++
// AMyGameModeBase.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "MyGameModeBase.generated.h"

UCLASS()
class CATENAEXAMPLE_API AMyGameModeBase : public AGameModeBase
{
	GENERATED_BODY()

public:
	// AGameModeBase
	virtual void InitGame(const FString& MapName, const FString& Options, FString& ErrorMessage) override;

private:
	// Online
	virtual void OnlineServicesLogin();
};
```

Next, open up the .cpp file for this class and add the following code:
``` c++
// AMyGameModeBase.cpp
#include "MyGameModeBase.h"

#include "CommonUser/Public/CommonUserSubsystem.h"

void AMyGameModeBase::InitGame(const FString& MapName, const FString& Options, FString& ErrorMessage)
{
	Super::InitGame(MapName, Options, ErrorMessage);

	// Kick off login request
	OnlineServicesLogin();
}


void AMyGameModeBase::OnlineServicesLogin()
{
	UCommonUserSubsystem* CommonUser = GetGameInstance()->GetSubsystem<UCommonUserSubsystem>();
	if (!CommonUser) { return; }

	// Attempt login. This will use OnlineServicesCatena's login call.
	CommonUser->TryToLoginForOnlinePlay(0);
}
```

Finally, perform the following:
1. Run the UE editor using your IDE.
2. Click on `Window` -> `World Settings`
3. Scroll down the `World Settings` panel until you see the `Game Mode` section.
4. Click on the `GameMode Override` selection box and select your game mode class.
5. Press the `Play` button.

You will notice in your logs for the `LogOnlineServices` category a response message similar to:
```LogOnlineServices: Successfully logged in as a test user!```

<!-- TODO: Add Logout examples here once Logout is implemented. -->

## What Next?
Now that you've successfully made your first call, you probably want to achieve something more tangible. You can explore other APIs that the SDK provides to build out additional features for your game.
