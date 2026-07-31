---
markdown:
  toc:
    depth: 4
---

# Catena - AWS FlexMatch

AWS FlexMatch is responsible for grouping players together to form games or matches. Catena's integration into FlexMatch currently supports FlexMatch's "standalone" configuration, meaning that it only supports making matches and does not support provisioning game servers via AWS GameLift.

If you would like to learn more about how Catena handles dedicated game servers, refer to the [Match Broker](../game-servers/index.md) documentation.

## Engine Integration

{% partial file="/_partials/matchmaking/engine-integration.md" variables={implementation: "AWS FlexMatch" } /%}

## What is AWS FlexMatch?

[AWS FlexMatch](https://docs.aws.amazon.com/gamelift/latest/flexmatchguide/match-intro.html), also known as "Amazon GameLift Servers FlexMatch" is Amazon's offering for matchmaking players.

### A Note on AWS Service Limits and Costs

GameLift matchmaking configurations and rule sets are subject to account-level quotas. If you plan to run many logical matchmaking queues, check your current limits in the [Service Quotas console](https://console.aws.amazon.com/servicequotas/home/services/gamelift/quotas/) before provisioning.

FlexMatch also bills for usage, even in standalone mode with no GameLift-hosted servers involved — you're charged for matchmaking hours and player packages processed, not just for the AWS resources this guide provisions. See [FlexMatch pricing](https://aws.amazon.com/gamelift/servers/pricing/flexmatch-pricing/) for current rates, and note that costs scale with matchmaking traffic, not with how this deployment is configured. To determine exact costs, you can use the [Cost Calculator provided by AWS](https://calculator.aws/#/) to detmine exact pricing for your targeted region(s).

If you're deploying FlexMatch alongside a new `catena-core` EC2 deployment, also see the [service limits note in the AWS EC2 guide](../../installation/aws-ec2.md#a-note-on-aws-service-limits) — the same Elastic IP/VPC quotas apply there.

## Getting Started

{% partial file="/_partials/install-catena/obtain-catena-source.md" /%}

To configure FlexMatch, you will also need to clone Catena's Infrastructure as Code repository.

```bash
git clone git@github.com:CatenaTools/infrastructure.git
```

##### Terraform
{% partial file="/_partials/aws/terraform.md" /%}

**Matchmaking Ruleset(s)**

[FlexMatch Rulesets](https://docs.aws.amazon.com/gamelift/latest/flexmatchguide/match-rulesets.html) define your game's team structure, size, and how to group players together for the best possible match.

**Matchmaking Configuration(s)**

[FlexMatch Configurations](https://docs.aws.amazon.com/gamelift/latest/flexmatchguide/match-create-configuration.html) expose matchmaking functionality to the outside world. These are how Catena makes matchmaking requests to AWS.

**Simple Notification Service (SNS) Topic**

[AWS SNS](https://aws.amazon.com/sns/) gives FlexMatch a place to post matchmaking events as they occur (i.e. match created).

**Simple Queue Service (SQS) Queue**

[AWS SQS](https://aws.amazon.com/sqs/) gives applications a way to subscribe to events that are sent to SNS topics. This is how Catena listens for matchmaking events for specific matchmaking tickets.

## How The Matchmaker Works

### Tickets
{% partial file="/_partials/matchmaking/tickets.md" /%}

The `queue_name` you provide in your ticket will be used to determine the FlexMatch Matchmaking Configuration to use when entering matchmaking.

### Events
As **matchmaking tickets** progress through Catena and ultimately through FlexMatch, events are emitted that either game clients or other Catena Services who are subscribed can ingest.

{% partial file="/_partials/matchmaking/events.md" /%}

## What Next?
{% partial file="/_partials/matchmaking/fresh-new.md" /%}