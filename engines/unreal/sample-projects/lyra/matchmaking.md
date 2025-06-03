# Matchmaking in Lyra

This documentation shows you the steps for building out a client & server game package to running each executable for successfully matchmaking two client instances to a server instance all within the Lyra sample game.

## Setup

{% admonition type="info" name="Lyra Setup" %}
<!-- Todo: Add link to setting up lyra project once made. -->
To follow this documentation you will need the Catena Lyra project downloaded and ready to run.
{% /admonition %}

Some requirements to follow this documentation is to have the following:

<!-- Todo: Add docs for creating server api key and setting it in Unreal. Link to those in #2. -->
1. You must be running Catena. It must be run locally or you must have it deployed somewhere. [Instructions for doing so can be found here](../../../../installation/index.md).
2. Have a valid server api key set in the `CatenaConfig.ini` file found in `<path-to-lyra-repo>\Samples\Games\Lyra\Plugins\OnlineServicesCatena\Source\OnlineServicesCatena\Config\CatenaConfig.ini`
   1. Once you have a server api key set the server will be able to make authenticated requests to the backend.

Assuming that you have installed Lyra successfully, be sure that you have a local instance of the backend running 
the only setup required is to make sure you have a destination directory for where packaged projects will be placed.

Navigate to where the Lyra project is stored `<path-to-lyra-repo>\Samples\Games\Lyra` and create a folder named `Packaged`.

You will then be able to store packaged projects within this directory without affecting the git diff as this folder is ignored.

## Package Builds

Next, we will need to build packages of Lyra for a server build and client build to run the proper code.

### Building Server

To build the server follow these steps:

1. Run the editor.
2. On the main editor window, click the `Platforms` dropdown. Found under the window tabs selection and right of the play button.
3. Hover over the Window platform selection.
4. Check that the `Binary Configuration` is set to `Development` & `Build Target` is `LyraServer`.
5. On the same drop-down, click `Package Project`.
6. Select the destination for the build to `<path-to-lyra-repo>\Samples\Games\Lyra\Packaged`.
7. Wait for the package to complete.

### Building Client

To build the client follow these steps:

1. Run the editor.
2. On the main editor window, click the `Platforms` dropdown. Found under the window tabs selection and right of the play button.
3. Hover over the Window platform selection.
4. Check that the `Binary Configuration` is set to `Development` & `Build Target` is `LyraClient`.
5. On the same drop-down, click `Package Project`.
6. Select the destination for the build to `<path-to-lyra-repo>\Samples\Games\Lyra\Packaged`.
7. Wait for the package to complete.

## Running Executables

Next, we will run two clients and a server for simulating a match in Lyra.

### Running Server

To run the server, navigate to where the LyraServer executable was placed in a command-line prompt. In this case you can find it at `<path-to-lyra-repo>\Samples\Games\Lyra\Packaged\WindowsServer\LyraClient.exe`.

Once you have navigated to this directory, run once instance of the server with the connection details the clients will use to connect by running the following command:

- `./LyraServer.exe -log --ConnectionDetails="127.0.0.1"`

You may change out the `ConnectionDetails` parameter based on the connection url for the server you are trying to connect to.

### Running Clients

To run the clients, navigate to where the LyraClient executable was placed in a command-line prompt. In this case you can find it at `<path-to-lyra-repo>\Samples\Games\Lyra\Packaged\WindowsClient\LyraClient.exe`.

Once you have navigated to this directory, run two instances of the client with different accounts by using the following commands:

- `./LyraClient.exe --UsernameOverride=test01`
- `./LyraClient.exe --UsernameOverride=test02`

## Matchmaking

Once each client and server are stood-up you will want to have both clients connect to the same match by pressing `Play Lyra` on the main menu, then press `Matchmaking`, and finally one of the two maps to being matchmaking.

{% admonition type="warning" name="Matchmaking Note" %}
As of this moment the map selected by the clients is not considered and only one map will be selected for play. There is work to be done on the server for dynamically selecting the map based on client search parameters.
{% /admonition %}

This will initiate matchmaking to the backend and the two clients should be paired to the polling server. If you are having issues connecting it may be that the backend hit a deadline for finding a match and tried to fill the requests.  

## Developer Notes

The server will load into the map `L_Server_Init` and found on the level blueprint is the code to kick off making match requests. The map to load is hard-coded in this blueprint code. There should be work tracked for making this a dynamically set map.

The client code for start matchmaking and handling a match found can be seen in blueprints in the `W_CatenaMatchmakingScreen` asset widget.
