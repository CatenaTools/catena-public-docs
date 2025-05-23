# Service Messenger

The service messenger is responsible for handling the transmission of requests to the backend, responses from the backend, and incoming event notifications.  

The service messenger is utilized by libcatena modules to make http requests in conjunction with protobufs to map request/response types.
Additionally, the service messenger utilizes the callback manager to transmit response and event information to any registered callbacks listening for the specified response or event type. 

## Integration

If you are planning to utilize one of the Catena provided plugins for an already supported engine such as Unreal or Unity then you may skip this section as this functionality is already handled in those plugins. However, if you plan to integrate libcatena into a custom or unsupported engine you can learn how to best setup & utilize the service messenger here.

### Setup

In order to setup the service messenger an object of the type must be created and then initilized using the `Init()` function call. An existing callback manager as well as the backend url to make requests to is expected in `Init()`.

### Object/Lifetime Management

It is recommended to create a single service messenger instance that will be utilized by all libcatena modules. An example of this can be seen here:
```c {% title="CatenaService.cpp" %}
    void CatenaService::Init()
    {
        CallbackManager = std::make_shared<Catena::CatenaCallbackManager>();
        std::string BackendUrl = "https://platform.catenatools.com";

        // Shared ptr so that many references to a single object are made
        Messenger = std::make_shared<Catena::CatenaServicesMessenger>(); 
        Messenger->Init(CallbackManager, BackendUrl);

        PartiesCatena = std::make_unique<Catena::Module::CatenaPartiesModuleHLApi>();
        PartiesCatena->Init(Messenger, CallbackManager);

        MatchmakingCatena = std::make_unique<Catena::Module::CatenaMatchmakingModuleHLApi>();
        MatchmakingCatena->Init(Messenger, CallbackManager);

        // other modules and initialization steps
    }
```

With this design in mind it is best to keep the service messenger instance in an object of the game engine that is expected to live during the full lifetime of the game or game engine. This will ensure that no errors/interuptions will occur with sending or receiving data.

{% admonition type="warning" name="Grain of Salt"%}
    The following design suggestion is currenty untested and considered an experiemental design approach to managing and utilizing service messengers and libcatena as a whole.
{% /admonition %}

Libcatena has been designed and implemented with the idea of single instances in mind, so it is best to create groupings of modules with a service messenger & callback manager for each instance of a running game or player.
If you plan to run multiple games concurrently, such as having a server manage multiple games at once, it is recommended to create new instances of service messengers & callback managers for each game/player instance to handle the sending and receiving of data. Modules should also follow this design pattern.

### Event Listening

Events are periodically received from the backend and provide important updates such as matchmaking status, party states, and more.  

In order to start listening for these events the service messenger `StartEventListener()` must be approprately called after user login.
A session id is need to successfully listen which is set once login has been completed. For this reason, `StartEventListener()` should only be called after user login has been successfully completed.

In order to stop listening to events `StopEventListener()` must be called to cut connection.

### Sending Requests

Sending requests is managed with the `SendWebRequest()` api call. Since this is a templated function a `RequestType` must be provided which must extend from the base type of `google::protobuf::Message`.  
Declaring template structs with the request type information reduce syntax bloat when writing `SendWebRequest()`. Examples of this declaration can be found in libcatena module interfaces such as the following:

```c {% title="catena_auth.hpp" %}
    template<>
    struct ResponseType<catena::catena_authentication::LoginWithProviderRequest>
    {
        using type = catena::catena_authentication::LoginWithProviderResponse;
    };

    template<>
    struct ResponseType<catena::catena_authentication::AwaitSessionRequest>
    {
        using type = catena::catena_authentication::AwaitSessionResponse;
    };
```

`SendWebRequest()` expects the request information, request options, a callId, and callback tokens.
The request information should match the request you want to make. Request options should have the appropriate endpoint uri and request method for the request being made. CallId is the identification number used for matching requests to responses in callbacks. Tokens are the set of tokens to invoke callbacks that match the request/response type.
