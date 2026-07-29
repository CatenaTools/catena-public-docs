---
markdown:
  toc:
    depth: 4
---

# Catena - AWS FlexMatch - Exisitng deployment

This document assumes you've already deployed Catena tools to AWS using [AWS EC2 deplyoment docs](../../installation/aws-ec2.md), and have a working `catena_deployment` user and EC2 role.

If you have not deployed to AWS yet and this is your first time, please refer too [Flex Match New Deployment steps](./aws-flex-match-new-deployment.md)

AWS FlexMatch is responsible for grouping players together to form games or matches. Catena's integration into FlexMatch currently supports FlexMatch's "standalone" configuration, meaning that it only supports making matches and does not support provisioning game servers via AWS GameLift.

### 1. Preparations

#### 1a. Create an AWS Account
{% partial file="/_partials/aws/create-an-aws-account.md" /%}

#### 1b. Extend deployment IAM User and Policy

You don't need a new IAM user. We can use the identities we created earlier for deployment, and our EC2 instance role.

1. Log into AWS and navigate to `IAM` -> `IAM Policies`

2. Select your `CatenaDeploymentPolicy` we created to deploy Catena. (`CatenaDeploymentPolicy`, attached to `catena_deployment` IAM user). open the Json editor and add in these permissions: 

```json
{
  "Sid": "CloudControlApiForGameLiftResources",
  "Effect": "Allow",
  "Action": [
    "cloudformation:GetResource",
    "cloudformation:CreateResource",
    "cloudformation:UpdateResource",
    "cloudformation:DeleteResource",
    "cloudformation:ListResources",
    "cloudformation:GetResourceRequestStatus",
    "cloudformation:ListResourceRequests"
  ],
  "Resource": "*"
},
{
  "Sid": "ManageCatenaSnsNotificationTopic",
  "Effect": "Allow",
  "Action": [
    "sns:CreateTopic", 
    "sns:DeleteTopic", 
    "sns:GetTopicAttributes",
    "sns:SetTopicAttributes", 
    "sns:TagResource", 
    "sns:ListTagsForResource",
    "sns:Subscribe", 
    "sns:Unsubscribe", 
    "sns:GetSubscriptionAttributes"
  ],
  "Resource": "arn:aws:sns:*:*:*"
},
{
  "Sid": "ManageCatenaSqsNotificationQueue",
  "Effect": "Allow",
  "Action": [
    "sqs:CreateQueue", 
    "sqs:DeleteQueue", 
    "sqs:GetQueueAttributes",
    "sqs:SetQueueAttributes", 
    "sqs:TagQueue", 
    "sqs:ListQueueTags",
    "sqs:GetQueueUrl", 
    "sqs:AddPermission"
  ],
  "Resource": "arn:aws:sqs:*:*:*"
},
{
  "Sid": "ManageCatenaGameLiftMatchmakingRuleSets",
  "Effect": "Allow",
  "Action": [
    "gamelift:CreateMatchmakingRuleSet", 
    "gamelift:DeleteMatchmakingRuleSet",
    "gamelift:DescribeMatchmakingRuleSets", 
    "gamelift:TagResource", 
    "gamelift:ListTagsForResource"
  ],
  "Resource": "*"
},
{
  "Sid": "ManageCatenaGameLiftMatchmakingConfigurations",
  "Effect": "Allow",
  "Action": [
    "gamelift:CreateMatchmakingConfiguration", 
    "gamelift:UpdateMatchmakingConfiguration",
    "gamelift:DeleteMatchmakingConfiguration", 
    "gamelift:DescribeMatchmakingConfigurations"
  ],
  "Resource": "*"
}
```
> **Note:** GameLift matchmaking actions don't support resource-level ARN scoping — AWS requires `"Resource": "*"` for these specific actions.

There is one existing policy you will have to edit to add the ability to edit flexmatch runtime policies. Yuu should have this permission added from the `catena-tools-core` deployment to manage your backup permissions. 

We should add the 2nd resource arn to allow managing the runtime policy for FlexMatch as well:

```json
{
  "Sid": "ManageCatenaPolicies",
  "Effect": "Allow",
  "Action": [
    "iam:CreatePolicy",
    "iam:DeletePolicy",
    "iam:GetPolicy",
    "iam:GetPolicyVersion",
    "iam:ListPolicyVersions",
    "iam:CreatePolicyVersion",
    "iam:DeletePolicyVersion",
    "iam:TagPolicy",
    "iam:ListEntitiesForPolicy"
  ],
  "Resource": [
    "arn:aws:iam::<ACCOUNT_ID>:policy/*catena-backup-policy",
    "arn:aws:iam::<ACCOUNT_ID>:policy/*catena-flexmatch-runtime-policy" # Add this Resource ARN here
  ]
}
```

Once done, scroll down and click `Next`. Review your changes and once confirmed you can scroll down and `Save Changes`

This will enable `catena_deployment` to provision FlexMatch's resources.

Here is the breakdown of the deployment SIDs:
| SID                          | Purpose                                 | 
|--------------------------------------|-----------------------------------------|
| `CloudControlApiForGameLiftResources` | 		Create, read, update, delete, and poll the status of resources managed through AWS Cloud Control API. Terraforms awscc provider routes all operations through Cloud Control.  | 
| `ManageCatenaSnsNotificationTopic` | 	Create and configure the SNS topic FlexMatch uses to publish matchmaking events | 
| `ManageCatenaSqsNotificationQueue` | 	Create and configure the SQS queue subscribed to that topic, which Catena polls for matchmaking updates |                                            |
| `ManageCatenaGameLiftMatchmakingRuleSets` | 	Create/manage the GameLift rule sets defining team structure and match sizing|
| `ManageCatenaGameLiftMatchmakingConfigurations` | 	Create/manage the GameLift matchmaking configurations that expose matchmaking to players  | 
| `ManageCatenaPolicies` | 		Create, read, version, tag, and delete the FlexMatch runtime IAM policy  | 

Now that we have our deployment policy setup, we can apply our changes. Navigate to `aws/catena-core/` in the infrastructure repo and run:

```bash
terraform plan -var-file="vars.tfvars"
terraform apply -var-file="vars.tfvars"
```

Your deployment policies should be configured and you should now have flexmatch deployed

### 2. Configure FlexMatch
Now that you have everything prepped, it's time to configure FlexMatch in your AWS account. We will be using Terraform to configure the various components necessary for FlexMatch to operate. These include:

**Matchmaking Ruleset(s)**

[FlexMatch Rulesets](https://docs.aws.amazon.com/gamelift/latest/flexmatchguide/match-rulesets.html) define your game's team structure, size, and how to group players together for the best possible match.

**Matchmaking Configuration(s)**

[FlexMatch Configurations](https://docs.aws.amazon.com/gamelift/latest/flexmatchguide/match-create-configuration.html) expose matchmaking functionality to the outside world. These are how Catena makes matchmaking requests to AWS.

**Simple Notification Service (SNS) Topic**

[AWS SNS](https://aws.amazon.com/sns/) gives FlexMatch a place to post matchmaking events as they occur (i.e. match created).

**Simple Queue Service (SQS) Queue**

[AWS SQS](https://aws.amazon.com/sqs/) gives applications a way to subscribe to events that are sent to SNS topics. This is how Catena listens for matchmaking events for specific matchmaking tickets.

#### 2a. Provision Resources
1. Navigate to the Catena Infrastructure repository you cloned earlier.
2. Navigate to the `aws/flex-match/` directory
3. Initialize Terraform

```bash
terraform init
```

4. If you would like to customize the matchmaking queues that are available, edit the `matchmaking_queues` variable in `variables.tf`. For every queue name, you will need to define a corresponding ruleset in the `rule_sets/` directory. For more information on rule sets, refer to the [match rulesets](https://docs.aws.amazon.com/gamelift/latest/flexmatchguide/match-rulesets.html) documentation from Amazon.

5. (Optional) Run a Terraform plan. This will preview all of the AWS resources that are about to be provisioned.

```bash
terraform plan --var="catena_ec2_role_name=<your-ec2-role-name>"
```
Passing `catena_ec2_role_name` tells Terraform to attach the FlexMatch runtime policy to your existing EC2 instance role. Alongside that, it creates the SNS topic, SQS queue, GameLift rule sets, and matchmaking configurations.

Your role name follows the pattern `<workspace>-catena-ec2-role` — for the default workspace, it's just `catena-ec2-role`.

6. Run a Terraform apply. This will preview all of the AWS resource that are about to be provisioned, and prompt you if you'd like to proceed.

```bash
terraform apply --var="catena_ec2_role_name=<your-ec2-role-name>"
```

You should see a long list of output, with something resembling the following code block at the end.

_Note: This is just example output._

```bash
Apply complete! Resources: 6 added, 0 changed, 0 destroyed.

Outputs:

sqs_queue_url = "https://sqs.us-east-1.amazonaws.com/000000000000/matchmaking-events"
flexmatch_runtime_user_name = "my_workspace_catena_flexmatch_runtime_policy"
```

7. Keep note of the `sqs_queue_url` that it outputs, as it will be used to configure your running instance of Catena in the next step.

Running terraform Apply will have created a new IAM Policy titled `catena_flexmatch_runtime_policy`. Here is a breakdown of it's SIDS:

| SID                          | Purpose                                 | 
|--------------------------------------|-----------------------------------------|
| `CatenaRuntimeGameLiftMatchmaking` | Lets running Catena application start, stop, and check matchmaking status via GameLift | 
| `CatenaRuntimeSqsNotifications` | Lets the running application read and acknowledge matchmaking event messages from the FlexMatch notification queue | 

#### 2b. Configure Catena
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

## What Next?
{% partial file="/_partials/matchmaking/what-next.md" /%}