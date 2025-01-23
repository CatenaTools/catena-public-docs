# Quickstart: Unity

{% admonition type="info" name="Before You Get Started" %}
    Ensure you are [running Catena either locally or have it deployed somewhere](../../installation/index.md).
{% /admonition %}

## Estimated Time
The initial integration of Catena to your Unity project is estimated to take **~10 minutes**.

## Install the SDK
{% partial file="/_partials/install-catena/obtain-catena-source.md" /%}

The Unity SDK lives in Catena's source. It can be found at `catena-tools-core/CatenaUnitySDK/`.

### 2. Install SDK
Copy the `catena-tools-core/CatenaUnitySDK/` directory into the `Assets/Scripts/` directory of your Unity project. You should now have the SDK at `<your_unity_project_path>/Assets/Scripts/CatenaUnitySDK/`.

{% admonition type="info" %}
    For Unity versions **older** than *2020.1*, you will need to **remove** `CatenaUnitySDK/Runtime/Plugins/System.Runtime.CompilerServices.Unsafe.dll`. More information can be [found here](https://github.com/protocolbuffers/protobuf/issues/9618#issuecomment-1185348928).
{% /admonition %}

## Hello World

### 1. Add Entrypoint
1. Create an empty `GameObject` in the Scene you would like to add Catena to.
2. Rename this `GameObject` to `CatenaEntrypoint`.
3. Add the `CatenaEntrypoint` component to your `GameObject`.
4. Configure your `GameObject`
    1. Configure the **Catena Endpoint URL** to point to your running instance of Catena. If you don't yet have a running instance of Catena, refer to the [How to Run Catena](../../installation/index.md) documentation.
    2. You can skip configuring the **Catena Server Api Test Key** for the purposes of this quickstart guide.
    3. Leave **Use Catena Data Cleanup** checked

#### What Is The Catena Entrypoint?
The **Catena Entrypoint** component is a Singleton class that is used by other Catena components to communicate with the Catena backend.

This component will make the `GameObject` it's on persist between scenes, so it's best to put it on its own `GameObject` or another `GameObject` you already plan to have persist between scenes.

### 2. Configure Our First Call to Catena

#### (Optional) Create Script To Interact with Catena
If you are working in a brand new Unity project, you will need to create a script in your Scene that interacts with the `CatenaEntrypoint`. If you are integrating Catena into an existing project, you can skip this part.

1. Create an empty `GameObject` in the Scene you would like to add Catena to.
2. Rename this `GameObject` to `SceneManager`.
3. Add a component, selecting **New script**. Name this script `SceneManager`.
4. Open the `SceneManager.cs` script that was created in your editor of choice.
5. The `Start()` function will be where we call into Catena in the next step.

#### Call Catena Backend

1. To call the Catena Backend, write the following code in the Script you'd like to call it from.

<!-- TODO (@HF): csharp does not appear to be supported. determine how to enable it for better syntax highlighting -->
```c
var catenaEntrypoint = FindObjectOfType<CatenaEntrypoint>();

catenaEntrypoint.OnNodeIsHealthyCompleted += (object sender, CatenaEntrypoint.NodeInspectionServiceArgs serviceArgs) =>
{
    if (!serviceArgs.Status.Success)
    {
        Debug.Log("Failed to check node health: " + serviceArgs.Status.Message);
        return;
    }

    Debug.Log("Completed Request, Healthy: " + serviceArgs.IsHealthy);
};

Debug.Log("Requesting NodeIsHealthy");
catenaEntrypoint.NodeIsHealthy();
```

2. Run your project. You should see output in your Console Window indicating that you've successfully made a request to your Catena Backend checking your node's health!

## What Next?
Now that you've successfully made your first call, you probably want to achieve something more tangible. You can explore other APIs that the SDK provides to build out additional features for your game.