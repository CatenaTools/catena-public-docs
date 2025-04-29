# Key Concepts

{% admonition type="info" %}
*For a deeper dive into key concepts, refer to [The Architecture of Catena](https://blog.catenatools.com/the-architecture-of-catena/) blog post.*
{% /admonition %}

Catena is a source-available set of tools that is designed to help game developers build online games quickly and efficiently. With Catena, online features are interoperable, extensible, modular, easy to integrate with your game, and simple to run anywhere; even with limited backend experience.

## Source Available

Unlike other platforms, you have access to Catena’s source code and must run it yourself. Don’t worry, this isn’t as scary as it sounds! You can get up and running in a few minutes with [Getting Started: How to Run Catena](../installation/index.md).

Because Catena is source available, you have the option to peel the curtain back and modify backend systems to match the needs of your game. Catena handles the hard parts of implementing a game backend, and is designed in a similar manner to “engine code” you might find in Unreal Engine.

Catena provides out-of-the-box support for configuration management, structured logging, authentication and session management, network transport between clients and servers, network transport between Catena services, database interfaces, module/plugin registration, and service discovery. 

## Interoperable, Extensible, Modular

Catena is designed from the ground up to be interoperable, extensible, and modular. The “engine code” we provide is called “Catena Core”, which you will rarely need to touch or modify.

On top of Catena Core, we provide modular and interoperable plugins that can get you started with an array of common online features such as identity and access management, commerce, matchmaking, game server management, social features, and more. These plugins can be used as-is, can easily be swapped with plugins to interface with other popular backend service platforms (i.e. AWS GameLift) for certain portions of your backend, or can be replaced with custom plugins written entirely by you in order to meet your game’s specific needs.

## Easy to Integrate With Your Game

Catena provides SDKs for Unity, Unreal, or Proprietary Game Engines.

## Simple to Run Anywhere

You must run Catena yourself, but you have plenty of options for how to do that. It can be run as a modular monolith on your workstation, on a single bare metal machine, on a single VM in the cloud, or as a production grade distributed system with its modules broken up into microservices.

Get up and running in a few minutes with [Getting Started: How to Run Catena](../installation/index.md).
