# Callback Manager

The callback manager is an essential piece of libcatena for handling response messages and events from the backend. Each high-level api module utilizes a reference to a callback manager to handle state changes stored in the module.

The callback manager is responsible for managing and invoking registered callbacks for responses & events from the backend.  

This document will dive deeper into the design and usage of the callback manager, response callbacks, and event callbacks.

## Callback Manager Setup

In order to start utilizing the callback manager all that needs to be done is to create an instance and pass a shared pointer into utilizing modules if there are any. An example is shown in the following code snippet:

```c {% title="CatenaService.cpp" %}
    void CatenaService::Init()
    {
        // Create an instance for utilization
        CallbackManager = std::make_shared<Catena::CatenaCallbackManager>();

        std::string BackendUrl = "https://platform.catenatools.com";
        
        // Pass Callback Manager into utilizing instances
        Messenger = std::make_shared<Catena::CatenaServicesMessenger>(); 
        Messenger->Init(CallbackManager, BackendUrl);

        PartiesCatena = std::make_unique<Catena::Module::CatenaPartiesModuleHLApi>();
        PartiesCatenaHLApi->Init(Messenger, CallbackManager);

        MatchmakingCatena = std::make_unique<Catena::Module::CatenaMatchmakingModuleHLApi>();
        MatchmakingCatenaHLApi->Init(Messenger, CallbackManager);

        // other modules and initialization steps
    }
```

If you plan to manage callbacks with a low-level api module or your own way then read the following sections to best grasp the steps required in having callbacks fully functional.

## Managing Response Callbacks

Response callbacks are utilized for receiving responses for requests made to the backend.

### Setup Response Processing

To receive a response a callback needs to be registered for the response type to receive the response data and have a token associated to the callback. The same token will need to be provided when making a request.

In order for incoming response callbacks to be processed the `CatenaCallbackManager::Tick()` or `CatenaCallbackManager::TickRequestCallbacks()` need to be called in the game engine's ticker function if it is not handled already.

### Registering Response Callbacks  

To receive responses from requests a callback of the expected response type must be registered. There are a few components in registering a callback properly. The components are a unique token, a function to invoke, and the expected request/response type for a request.

The callback being bound must also have parameters for a `uint64_t` callId, `int` response code, and the response type parameter expected for the callback.

{% admonition type="warning" name="Notice"%}
    It is important to know that the callback manager will only invoke **one callback for a single response type for each single token**. This means that if there are two or more callbacks registered for the same response type mapping to the same token then only the first of those callbacks will be invoked, while the rest are ignored. This could lead into errors since some registered callbacks are not receiving data when expected.
    **With this in mind, only register one callback for each response type and token pairing!**

{% /admonition %}

Examples of registering callbacks are shown in the following code snippet.

```c {% title="CatenaService.cpp" %}
    void CatenaService::RegisterRequestCallbacks()
    {
        // Generate unique token to associate registered callbacks to requests
        Catena::RequestCallbackToken token = callbackManager->GenerateRequestToken("CatenaService-CallbackToken");

        // Register callback to member function
        callbackManager->RegisterRequestCallback<catena::catena_parties::JoinPartyWithInviteCodeRequest>(
            token, "CatenaService::OnJoinPartyWithInviteCodeResponse",
            std::bind(
                &CatenaService::OnJoinPartyWithInviteCodeResponse, this, std::placeholders::_1,
                std::placeholders::_2, std::placeholders::_3
            )
        );

        // Register callback to lambda
        callbackManager->RegisterRequestCallback<catena::catena_parties::GetPartyInfoByPartyIdRequest>(
            token, "CatenaService-GetPartyInfoByPartyIdRequest-lambda",
            [this](const uint64_t callId, int responseCode, const catena::catena_parties::GetPartyInfoResponse response)
            {
                // Handle response
            }
        );
    }

    // Bound member function
    void CatenaService:: OnJoinPartyWithInviteCodeResponse(const uint64_t callId, int responseCode, 
    const catena::catena_parties::JoinPartyWithInviteCodeResponse& response)
    {
        // Handle response
    }
```

The typical callback workflow takes these steps from registering a callback to receiving responses:

1. `CatenaCallbackManager::Tick()` or `CatenaCallbackManager::TickRequestCallbacks()` is properly called in a tick function.
2. Unique token is created with `CatenaCallbackManager::GenerateRequestToken()`.
3. Callbacks are registered utilizing the returned `RequestCallbackToken`.
4. Request is made with `CatenaServicesMessenger::SendWebRequest()` and token(s) are provided in request data to invoke callbacks registered under token(s).
5. Once a response is received the `CatenaServicesMessenger` calls `CatenaCallbackManager::QueueRequestCallback()` with the provided token(s) to find registered callback(s).
6. CallbackManager handles the response callback on the next `CatenaCallbackManager::Tick()` or `CatenaCallbackManager::TickRequestCallbacks()` call.
7. Registered callback(s) will be invoked with the response data.

#### Tokens and Token Management

Tokens are essential to registering callbacks and notifying which token sets should be searched for when a response is received.

An object of type `Catena::RequestCallbackToken` is generated when calling `CatenaCallbackManager::GenerateRequestToken()` with a unique id. Be sure to use separate unique ids for each callback you plan to register to the same request/response type.

The generated `Catena::RequestCallbackToken` must then be passed into `CatenaCallbackManager::RegisterRequestCallback()` to associate the callback to a token for the response type.

The callback registered with the generated token will only be invoked when a request is made with that same token and once a response is received for that request. If the token is not provided when making the request then no callbacks under that token will be searched for the request/response type.

### Unregistering Response Callbacks

There are a couple of unregister api calls available in the callback manager for response callbacks.  

If you plan to unregister every single callback managed by a callback manager then `CatenaCallbackManager::UnregisterAllRequestCallbacks()` will remove all request callbacks.

If you need to only unregister request callbacks associated to a specific token then `CatenaCallbackManager::UnregisterAllRequestCallbacksByToken()` will handle that case.

Finally, if you need to unregister a single request callback then `CatenaCallbackManager::UnregisterRequestCallback()` will be able to remove the callback given the request type it was bound to and the token it is associated with.  

## Managing Event Callbacks

Event callbacks are utilized for receiving updates on certain event types such as a matchmaking status, party updates, and more.  

### Setup Events Processing

To receive the event in a callback it needs to be registered for the event type just like response callbacks are for each request/response type.

In order for incoming event callbacks to be processed `CatenaCallbackManager::Tick()` or `CatenaCallbackManager::TickEventCallbacks()` need to be called in the game engine's ticker function if it is not handled already.

Secondly, event callbacks require that the event listener is setup to poll for events. This does require a successful login to have been performed since a session id is required to begin polling.
After a login has been performed, calling `CatenaServicesMessenger::StartEventListener()` will start the event listner to poll for incoming events.

### Registering Event Callbacks

To register event callbacks, all that is needed is a function that has the expected event type as a parameter.
Calling `CatenaCallbackManager::RegisterEventCallback()` with the event type expected, a callback name to refer to the callback, and the callback function to invoke when the event of that type is received.

```c {% title="CatenaService.cpp" %}
    void CatenaService::RegisterEventCallbacks()
    {
        // Register event callback
        callbackManager->RegisterEventCallback<catena::catena_parties::PartyUpdateEvent>(
            "CatenaService-PartyUpdateEventCallback",
            [](const catena::catena_matchmaking::PartyUpdateEvent& event) mutable
            {
                // Handle event
            }
        );
    }
```

The typical callback workflow takes these steps from registering a callback to receiving events:

1. `CatenaCallbackManager::Tick()` or `CatenaCallbackManager::TickEventCallbacks()` is properly called in a tick function.
2. Register callback to an event type with `CatenaCallbackManager::RegisterEventCallback()`.
3. Login is performed to get session id for event listener.
4. `CatenaServicesMessenger::StartEventListener()` called post-login to begin polling for events.
5. Event is received in `CatenaServicesMessenger` which then calls `CatenaCallbackManager::QueueEventCallback()` with the event data.
6. The CallbackManager will handle the event on the next `CatenaCallbackManager::Tick()` or `CatenaCallbackManager::TickEventCallbacks()` if a callback is bound.
7. Any bound callbacks to type are invoked with event data.

### Unregistering Event Callbacks

There are a couple of unregister api calls available in the callback manager for event callbacks.  

If you plan to unregister every single event callback managed by a callback manager then `CatenaCallbackManager::UnregisterAllEventCallbacks()` will remove all event callbacks.

If you need to unregister event callbacks associated to a specific event type then `CatenaCallbackManager::UnregisterAllEventCallbacksByEventType()` will handle that case.

Finally, if you need to unregister a single event callback then `CatenaCallbackManager::UnregisterEventCallback()` will be able to remove the callback given the event type it was bound to and the name of the callback used when registering the event callback.
