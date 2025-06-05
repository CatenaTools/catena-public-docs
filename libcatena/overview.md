# Libcatena Overview

In this document we will provide an overview of the offerings of libcatena.

## Service Messenger

The service messenger is at the core of libcatena as it is responsible for sending out request, receiving responses, and managing a listener for event updates.

Each module utilizes the service messenger for making requests to the backend. The service messenger processes the data provided and sends it out as an http requests utilizing [cpr](https://github.com/libcpr/cpr) as of this writing. More on the topic of [requests/responses can be found here](service-messenger.md#sending-requests).

The service messenger also manages an event listener that can be utitlized for getting event updates from the backend on topics such as party updates, matchmaking updates, and more. More on the topic of [event listening can be read here](service-messenger.md#event-listening).

More can be learned about the [service messenger here](service-messenger.md).

## Callback Manager

The callback manager is an essential part of libcatena for registering response callback functions that will be invoked when a response is received from the backend. They are also responsible for invoking event callback functions when an event is received from the backend.

Response callbacks and event callbacks have some differing structure in how they are expected to be managed, but ultimately are the same in that they are invoked when a response is received.

Response callbacks rely on a token system for invoking a callback registered under a token, given that the token was provided along-side the request data to the service messenger. Modules have a field for tokens in each request function that will pass this along to the service messenger. More on the topic of [response callbacks can be read here](callback-manager.md#managing-response-callbacks).

Event callbacks rely on the service messenger having an event listener started & active to receive event data from the backend to get event updates. More on the topic of [event callbacks can be read here](callback-manager.md#managing-event-callbacks).

The callback manager receives response & event information from the service messenger it was given after it has processed the data from a response or event.

More can be learned about the [callback manager here](callback-manager.md).

## Modules

Modules provide the functionality to make specific requests to the backend.
Each module has a high-level & low-level implementation for making the requests.

Low-level modules are responsible for calling into the service messenger to make the desired request. The only functionality of low-level modules is for making requests.

High-level modules each contain a low-level module to handle the requests while providing wrapper code for simplifying the request information, as well as handling state management with callbacks from requests made.

High-level modules also provide their own set of callbacks for each request type for allowing users to receive information through a callback on a request made. This is to provide a simple alternative for registering callbacks rather than managing callbacks on a callback manager directly.

More can be learned about [modules here](modules.md).

### Available Modules

The set of available modules currently include the following:

{% partial file="/_partials/libcatena/available-modules.md" /%}
