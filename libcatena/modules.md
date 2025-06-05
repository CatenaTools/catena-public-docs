# Modules

In this document you will learn the details of how modules are structured, how to utilize them for making requests, and which modules are available.

## Setup & Usage

This section will show how to setup modules and start utilizing their api for registering callbacks and making requests.

Each module needs to be initialized with a callback manager and a service messenger instance. It is recommended to have a shared instance of a callback manager and service messenger shared across each module representing for a single player's data-set.

Here is an example of setting up each type of module to prepare them for making requests.

```c {% title="CatenaService.cpp" %}
    void CatenaService::Init()
    {
        // CallbackManager & Messenger are shared between each module
        // to resemble a collective grouping of modules for a single player.
        CallbackManager = std::make_shared<Catena::CatenaCallbackManager>();
        std::string BackendUrl = "https://platform.catenatools.com";

        Messenger = std::make_shared<Catena::CatenaServicesMessenger>(); 
        Messenger->Init(CallbackManager, BackendUrl);

        // Low-level module examples
        PartiesCatena = std::make_unique<Catena::Module::CatenaPartiesModuleLLApi>();
        PartiesCatena->Init(Messenger, CallbackManager);

        MatchmakingCatena = std::make_unique<Catena::Module::CatenaMatchmakingModuleLLApi>();
        MatchmakingCatena->Init(Messenger, CallbackManager);

        // High-level module exampless
        AuthCatena = std::make_unique<Catena::Module::CatenaAuthModuleHLApi>()
        AuthCatena->Init(Messenger, CallbackManager);

        AccountsCatena = std::make_unique<Catena::Module::CatenaAccountsModuleHLApi>()
        AccountsCatena->Init(Messenger, CallbackManager);

        // other modules and initialization steps
    }
```

Next, would be to make sure you are registering callbacks to receive response data from requests made.
For low-level api modules, the callback manager will need to be utilized for receiving response data. [Details on how this is performed can be read here](./callback-manager.md#registering-response-callbacks). For this example, we will demonstrate how to register to the callbacks available in the high-level api module.

```c {% title="CatenaService.cpp" %}
    void CatenaService::RegisterCallbacks()
    {
        // Register callback for login with provider requests
        AuthModule->RegisterLoginWithProviderCallback(
            [](uint64_t callId, bool success,
            const catena::catena_authentication::LoginWithProviderResponse& response) mutable
            {
                // Handle response
            }
        );
    }

    void CatenaService::Login()
    {
        // Make login with provider request. Response information will be forwarded to registered callback above.
        AuthModule->LoginWithProvider(catena::catena_authentication::PROVIDER::UNSAFE, "test01");
    }
```

Once a request is successfully made and a response is received the callback manager will invoke callbacks registered within the module, which will invoke the callback registered to the high-level api module.

## Structure

Each module provides two sets of API to utilize for making requests to the backend.
Each module also implements an interface for requests they need to implement for that service.
You may notice that the interfaces they implement have functions that are not exposed publicly. This is to allow for making different public signatures for each request.

There is the low-level module which is responsible for structuring data to make requests to the backend.

Then there is the high-level module which has a form of state management that is handled from responses received. Each high-level module contains a low-level module which it utilizes for making requests. The high-level module also helps to simplify certain request data into objects when it is approprate as well as providing the ability to register callbacks to certain request/response data as demonstrated in the [Setup section](modules.md#setup).

### Low-Level Modules

The low-level module only manages the transmission of data to the service messenger the module was provided on its `Init()` call. The low-level modules implements an interface for handling a request through the service messenger. The modules also provides public functions that call into these implemented functions. The reason for this is to allow for controlling shared functionality between requests while allowing for unique data to be passed into the underlying implementation. You may see the shared functionality in the `RequestWrapper()` function on each public function implementation.

Each request allows for passing in a set of tokens. These tokens will be funneled to the service messenger to allow for notifying the callback manager which token sets to check for callbacks to invoke on a response received. More on [tokens can be read here](callback-manager.md#tokens-and-token-management).

Additionally, each request returns a `callId` value. This is to associate the request being made to a response received in a callback. Each callback has a `callId` variable which will match with the request `callId`. This is to help associate specific information for a certain request to the data received in a response. This is utilized in high-level modules such as the Catena parties high-level api module for tracking player data.

### High-Level Modules

The high-level module is a wrapper to the low-level modules to allow for managing data states, simplifying request information, and providing a set of callbacks that can be registered to for easy access to response data without having to manage the callback manager.

High-level modules were designed with the intent that it will resemble the data state being made for a single user. If you plan to have multiple users on the same process it is recommended to create separate instances of high-level modules, callback manager, and service messenger associated to that player. It is possible to handle this with a single callback manager shared across different players, but high-level modules will clash since callback tokens will have the same signature and cause clashing of data when requests are made through them. So only attempt this with low-level api modules at this moment.
<!-- Todo: Update this above comment once we patch hlapi module tokens to be fully unique. -->

The high-level module provides requests in a similar manner to the low-level module it wraps. Some request signitures may differ as a means to simplify the data that is needed to make the request.

Each request will return a `callId` to associate the request being made to the `callId` of a response received. This is useful for managing data associated to a specific request. The `callId` generated in the high-level module will be passed into the low-level module contained to associate to the request/response.

The module also provides automatic handling of certain states if requests are made in a manner that could lead to errors in the backend. An example of this can be seen in the Catena parties high-level api module when trying to create a party if the logged in user is already in another players party. In this scenario, it will make a request to leave the other players party and on a successful leave make a request to create a new party. If there is specific functionality that a high-level module performs that is undesired, then it is best to override the high-level module with specific functionality or to utilize the low-level module with your own implementation of a wrapper to perform the desired functionality.

## Available Modules

As of this writing there are a number of modules available to utilize:

{% partial file="/_partials/libcatena/available-modules.md" /%}
