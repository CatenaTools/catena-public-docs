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

``` bash
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
    1. Open you projects `.uproject` file with a text editor
    2. Add the following values to the `Plugins` section
``` json {%title="<projectName>.uproject"%}
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
``` csharp {%title="CommonUser.Build.cs"%}
    bool bUseOnlineSubsystemV1 = false;
```

To finish enabling `OnlineServices` follow the next section.

### 2. Configure DefaultEngine.ini

In your projects `Config` folder open up the file `DefaultEngine.ini`.

Enable `OnlineServicesInterface` build dependencies for `OnlineServices` by adding the following:
``` ini {%title="DefaultEngine.ini"%}
[/Script/Engine.OnlineEngineInterface]
bUseOnlineServicesV2=true
```

Add the following to set `OnlineServicesCatena` to be used as the default service:
``` ini {%title="DefaultEngine.ini"%}
[OnlineServices]
DefaultServices=GameDefined_0
```

### 3. Configure CatenaConfig.ini

In the plugin folder in `<path-to-plugins>/OnlineServicesCatena/Source/OnlineServicesCatena/Config/CatenaConfig.ini` open up the `CatenaConfig.ini` file.

To set the backend url of  `OnlineServicesCatena` edit the following var:
``` ini {%title="CatenaConfig.ini"%}
[OnlineServicesCatena]
BackendURL="http://localhost:5000"
```

The provided example will expect to hit a local running instance of the Catena backend.
The value can be changed depending on the backend instance you are trying to make requests to.

{% card title="Setting up Catena" to="/installation/index.md" %}
    To learn more on standing up Catena on a local instance or deploy on a live environment go here.
{% /card %}

### 4. Edit Project Module Dependencies

Navigate to your projects `Build.cs` file found under your projects `Source` folder. 

If you do not have a `Source` folder launch Unreal Engine click on `Tools` -> `New C++ Class...` and create a new class. 
This will generate the source code and solution for your project.

The `.Build.cs` folder can be found in the following directory `<your_unreal_project_path>/Source/<ProjectName>/<ProjectName>.Build.cs`.
Open the file and add `"CoreOnline"`, `"CommonUser"`, and`"OnlineServicesInterface"` to `PublicDependencyModuleNames`.
Your file will look similar to the following:
``` csharp {%title="<projectName>.Build.cs"%}
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
            "OnlineServicesInterface", // Access for service interfaces
            "OnlineSubsystemUtils" // Utility features for accessing subsystems
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

#### 1. Create GameInstance Class
1. Run the editor
2. Click `Tools` -> `New C++ Class`
3. Choose `GameInstance` as the Parent Class
4. Click `Next`
5. Name class for your project and set desired path
6. Click `Create Class`
7. Open your IDE to the class files you have created.
   1. You can find your projects `.sln` file in the projects directory.
   2. Open the `.sln` file with your preferred editor.
8. Close the UE Editor.

#### 2. Set Your GameInstance Class As Default

In order for the engine to utilize your newly created game instance it needs to be configured in the `Project Settings`.
1. Select `Edit` -> `Project Settings`
2. In the `Project Settings` menu click on the search bar and type `GameInstance`
3. Under the `Maps & Modes` section override the `Game Instance Class` default with your newly created Game Instance.

Your project will now utilize your game instance class when playing.

#### 3. Add functionality To Your GameInstance Class

Next we will setup the class to call login when the game is initialized.
Open up your game instance class header file and add the following code:

``` c++ {%title="MyGameInstance.h"%}
#pragma once

#include "CoreMinimal.h"
#include "Engine/GameInstance.h"
#include "MyGameInstance.generated.h"

// Forward Declare
namespace UE::Online
{
	class IAuth;
	class IOnlineServices;
}

UCLASS()
class CATENAEXAMPLE_API UMyGameInstance : public UGameInstance
{
	GENERATED_BODY()

public:
	// UGameInstance
	virtual void Init() override;

private:
	// Online
	void Login();

	TSharedPtr<UE::Online::IOnlineServices> OnlineServices;
	TSharedPtr<UE::Online::IAuth> AuthService;
};
```

Next, open up the .cpp file for this class and add the following code:

``` c++ {%title="MyGameInstance.cpp"%}
#include "MyGameInstance.h"

#include "CommonUser/Public/CommonUserSubsystem.h"
#include "Online/OnlineServicesEngineUtils.h"

void UMyGameInstance::Init()
{
	Super::Init();

	OnlineServices = UE::Online::GetServices(GetWorld(), UE::Online::EOnlineServices::GameDefined_0);
	if (OnlineServices == nullptr)
	{
		UE_LOG(LogTemp, Error, TEXT("OnlineServices is null."));
		return;
	}

	AuthService = OnlineServices->GetAuthInterface();
	if (AuthService == nullptr)
	{
		UE_LOG(LogTemp, Error, TEXT("AuthService is null."));
		return;
	}
	
	// Kick off login request
	Login();
}

void UMyGameInstance::Login()
{
	UE::Online::FAuthLogin::Params LoginParameters;
	LoginParameters.PlatformUserId = FPlatformUserId::CreateFromInternalId(0);
	LoginParameters.CredentialsType = UE::Online::LoginCredentialsType::Auto;
	
	UE::Online::TOnlineAsyncOpHandle<UE::Online::FAuthLogin> LoginHandle = AuthService->Login(MoveTemp(LoginParameters));
}
```
#### 4. Perform Test

Finally, perform the following:
1. Run the UE editor using your IDE.
2. Press the `Play` button.

You will notice in your logs for the `LogOnlineServices` category a response message similar to:
```LogOnlineServices: Successfully logged in as a test user!```

## What Next?
Now that you've successfully made your first call, you probably want to achieve something more tangible. You can explore other APIs that the SDK provides to build out additional features for your game.
