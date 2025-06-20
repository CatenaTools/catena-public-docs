# Match Broker Allocators

A list of the available Catena Match Broker allocators and their configurations.

## Local Baremetal Allocator

The `CatenaLocalBareMetalAllocator` can start and manage game server processes alongside the Catena backend. It is great for early development and testing locally or on a cloud machine with the capacity to run one or more game server(s).

It is necessary to configure the full path to the game server executable and any arguments necessary to start with the correct options/map/configuration/etc.

If the game server takes longer than 30 seconds to start up and begin fetching matches, then `ReadyDeadlineSeconds` should be increased accordingly.

`MaxRunTimeMinutes` is the maximum amount of time that the game server process should be running before it is killed by the allocator. This is a fallback to the [`ServerMaxLifetimeMinutes`](match-broker.md#servermaxlifetimeminutes) configuration in the Match Broker and should be longer than that value.

```json
"MatchBroker": {
  "Allocators": [
    {
      "Allocator": "CatenaLocalBareMetalAllocator",
      "AllocatorDescription": "Local allocator",
      "Configuration": {
        "GameServerPath": "<the path to the game server>",
        "GameServerArguments": "<the server command-line arguments>",
        "ReadyDeadlineSeconds": 30,
        "ReaperConfiguration": {
          "AllocatorReaperPeriodSeconds": 10,
          "MaxRunTimeMinutes": 125
        }
      }
    }
  ]
}
```

## GameLift Allocator

The `CatenaGameLiftAllocator` handles several aspects of Amazon GameLift:

For game servers that already implement support for GameLift, it can proxy Catena matches into GameLift game sessions (when `ProxyMatchesToGameLift` is enabled). `ProxyMatchesToGameLift` should be disabled for game servers that implement the Catena (Server-Manager.md) APIs.

If enabled by `AllowFleetGrowth`, the allocator can automatically increase the maximum size of the GameLift fleet if necessary to support the game volume. This allocator will not decrease the maximum fleet size.

{% admonition type="info" %}
When using the Catena [Server Manager](server-manager.md) APIs to fetch matches and GameLift fleet auto-scaling, it is not necessary to use this allocator unless you want to automatically increase the maximum fleet size.
{% /admonition %}

It is suggested that `ReadyDeadlineSeconds` be set to the time required for the GameLift auto-scaler to start an additional game server and for that game server to start requesting matches that may total several minutes.

```json
"MatchBroker": {
  "Allocators": [
    {
      "Allocator": "CatenaGameLiftAllocator",
      "AllocatorDescription": "GameLift allocator",
      "Configuration": {
        "Profile": "<AWS credential profile>",
        "Region": "us-east-1",
        "ReadyDeadlineSeconds": 30,
        "FleetArn": "<the ARN of the GameLift fleet>",
        "FleetLocation": "<Fleet location, needed for Anywhere fleets>",
        "AllowFleetGrowth": false,
        "MaxFleetSize": 1,
        "ProxyMatchesToGameLift": true
      }
    }
  ]
}
```

## EC2 Direct Allocator

The `CatenaEc2DirectAllocator` can start and manage game servers by starting and terminating AWS EC2 instances.

It is necessary to configure the profile, region, and template ID to use this allocator. This allocator does not interact with or start game server processes directly, so it is necessary to [package the game server in an AMI](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html#creating-an-ami).

If the game server takes longer than 30 seconds to start up and begin fetching matches, then `ReadyDeadlineSeconds` should be increased accordingly.

`MaxRunTimeMinutes` is the maximum amount of time that the game server instance should be running before it is terminated by the allocator. This is a fallback to the [`ServerMaxLifetimeMinutes`](match-broker.md#servermaxlifetimeminutes) configuration in the Match Broker and should be longer than that value.

```json
"MatchBroker": {
  "Allocators": [
    {
      "Allocator": "CatenaEc2DirectAllocator",
      "AllocatorDescription": "EC2 direct allocator",
      "Configuration": {
        "Profile": "<AWS credential profile>",
        "Region": "us-east-1",
        "MaxInstanceCount": 1,
        "LaunchTemplateId": "<AWS launch template ID>",
        "ReadyDeadlineSeconds": 30,
        "ReaperConfiguration": {
          "AllocatorReaperPeriodSeconds": 10,
          "MaxRunTimeMinutes": 125
        }
      }
    }
  ]
}
```

## Unity Multiplay Allocator

The `MultiplayServerAllocator` can start and manage game servers by utilizing Unity Multiplay game server fleets.

The `RegionId` can be found in the fleet "Scaling settings" tab.

`ReadyDeadlineSeconds` should be set to the longest time that it takes to boot and make a new machine and game server
available. In testing, this has been found to be in excess of 7 minutes for Multiplay. It is recommended to keep some
minimum number of servers available.

```json
"MatchBroker": {
  "Allocators": [
    {
      "Allocator": "MultiplayServerAllocator",
      "AllocatorDescription": "Multiplay allocator",
      "Configuration": {
        "KeyId": "<key ID>",
        "SecretKey": "<secret key>",
        "ProjectId": "<project ID>",
        "EnvironmentId": "<environment ID>",
        "BuildConfigurationId": <build configuration ID>,
        "FleetId": "<fleet ID>",
        "RegionId": "<region ID>",
        "ReadyDeadlineSeconds": 480
      }
    }
  ]
}
```