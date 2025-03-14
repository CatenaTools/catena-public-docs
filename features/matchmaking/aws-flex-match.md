---
markdown:
  toc:
    depth: 4
---

# Catena - AWS FlexMatch

AWS FlexMatch is responsible for grouping players together to form games or matches. Catena's integration into FlexMatch currently supports FlexMatch's "standalone" configuration, meaning that it only supports making matches and does not support provisioning game servers via AWS GameLift.

If you would like to learn more about how Catena handles dedicated game servers, refer to the [Match Broker](../game-servers/index.md) documentation.

## Engine Integration

{% partial file="/_partials/matchmaking/engine-integration.md" /%}

## What is AWS FlexMatch?
[AWS FlexMatch](https://docs.aws.amazon.com/gamelift/latest/flexmatchguide/match-intro.html), also known as "Amazon GameLift Servers FlexMatch" is Amazon's offering for matchmaking players.

## Getting Started

{% partial file="/_partials/install-catena/obtain-catena-source.md" /%}

To configure FlexMatch, you will also need to clone Catena's Infrastructure as Code repository.

```bash
git clone git@github.com:CatenaTools/infrastructure.git
```

### 2. Prep Work

#### 2a. Create an AWS Account
{% partial file="/_partials/aws/create-an-aws-account.md" /%}

#### 2b. Create Credentials
{% partial file="/_partials/aws/create-credentials.md" variables={
    iam_username: "catena_matchmaking"
} /%}

#### 2c. Install Dependencies

##### AWS CLI
{% partial file="/_partials/aws/install-aws-cli.md" variables={
    profile_name: "catena_gamelift"
} /%}

##### Terraform
{% partial file="/_partials/aws/terraform.md" /%}

### 3. Configure FlexMatch
Now that you have everything prepped, it's time to configure FlexMatch in your AWS account. We will be using Terraform to configure the various components necessary for FlexMatch to operate. These include:

**Matchmaking Ruleset(s)**

[FlexMatch Rulesets](https://docs.aws.amazon.com/gamelift/latest/flexmatchguide/match-rulesets.html) define your game's team structure, size, and how to group players together for the best possible match.

**Matchmaking Configuration(s)**

[FlexMatch Configurations](https://docs.aws.amazon.com/gamelift/latest/flexmatchguide/match-create-configuration.html) expose matchmaking functionality to the outside world. These are how Catena makes matchmaking requests to AWS.

**Simple Notification Service (SNS) Topic**

[AWS SNS](https://aws.amazon.com/sns/) gives FlexMatch a place to post matchmaking events as they occur (i.e. match created).

**Simple Queue Service (SQS) Queue**

[AWS SQS](https://aws.amazon.com/sqs/) gives applications a way to subscribe to events that are sent to SNS topics. This is how Catena listens for matchmaking events for specific matchmaking tickets.

#### 3a. Provision Resources
1. Navigate to the Catena Infrastructure repository you cloned earlier.
2. Navigate to the `aws/flex-match/` directory
3. Initialize Terraform

```bash
terraform init
```

4. If you would like to customize the matchmaking queues that are available, edit the `matchmaking_queues` variable in `variables.tf`. For every queue name, you will need to define a corresponding ruleset in the `rule_sets/` directory. For more information on rule sets, refer to the [match rulesets](https://docs.aws.amazon.com/gamelift/latest/flexmatchguide/match-rulesets.html) documentation from Amazon.

5. (Optional) Run a Terraform plan. This will preview all of the AWS resources that are about to be provisioned.

```bash
terraform plan
```

6. Run a Terraform apply. This will preview all of the AWS resource that are about to be provisioned, and prompt you if you'd like to proceed.

```bash
terraform apply
```

You should see a long list of output, with something resembling the following code block at the end.

_Note: This is just example output._

```bash
Apply complete! Resources: 6 added, 0 changed, 0 destroyed.

Outputs:

sqs_queue_url = "https://sqs.us-east-1.amazonaws.com/000000000000/matchmaking-events"
```

7. Keep note of the `sqs_queue_url` that it output, as it will be used to configure your running instance of Catena.

#### 3b. Configure Catena
Once you have your resources provisioned, you can configure Catena. Catena is configured using appsettings files in `catena-tools-core`. You will need the following items for Catena to work with FlexMatch:

```json
{
    "Catena": {
        ...
        "Matchmaker": {
            "FlexMatch": {
                "SQSQueueUrl": "<your_sqs_url_from_terraform_output>",
                "GameLiftConfig": {
                    "Profile": "<your_aws_profile_from_aws_cli>",
                    "Region": "<your_aws_region_from_aws_cli>"
                }
            }
        }
        ...
    },
    "PreferredImplementations": {
        ...
        "ICatenaMatchmaker": "!AwsFlexMatch"
        ...
    }
}
```

Alternatively, you can expose your access key/secret key directly, though you _should not_ check these values into source control.

```json
{
    "Catena": {
        ...
        "Matchmaker": {
            "FlexMatch": {
                "SQSQueueUrl": "<your_sqs_url_from_terraform_output>",
                "GameLiftConfig": {
                    "AccessKey": "<your_aws_access_key>",
                    "SecretKey": "<your_aws_secret_key>",
                    "Region": "<your_aws_region_from_aws_cli>"
                }
            }
        }
        ...
    },
    "PreferredImplementations": {
        ...
        "ICatenaMatchmaker": "!AwsFlexMatch"
        ...
    }
}
```

## How The Matchmaker Works

### Tickets
{% partial file="/_partials/matchmaking/tickets.md" /%}

The `queue_name` you provide in your ticket will be used to determine the FlexMatch Matchmaking Configuration to use when entering matchmaking.

### Events
As **matchmaking tickets** progress through Catena and ultimately through FlexMatch, events are emitted that either game clients or other Catena Services who are subscribed can ingest.

{% partial file="/_partials/matchmaking/events.md" /%}

## What Next?
{% partial file="/_partials/matchmaking/what-next.md" /%}