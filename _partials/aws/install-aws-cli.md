The AWS CLI is a tool that allows users to manage AWS resources through the command line. With it, you can expose credentials to Terraform in future steps.

1. To install the AWS CLI, refer to [their installation documentation](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
2. Once the CLI is installed, add your credentials that you created earlier. We'll be adding them to a specific profile called "{% $profile_name %}", but you can use whatever profile name you'd like.
    - For a list of available regions you can provide when prompted for the default region, refer to [available regions](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-available-regions). We recommend using the same region your S3 bucket was created in.

```bash
aws configure --profile {% $profile_name %}

# Interactive Input
# AWS Access Key ID [None]: <YOUR_ACCESS_KEY>
# AWS Secret Access Key [None]: <YOUR_SECRET_ACCESS_KEY>
# Default region name [None]: <YOUR_DEFAULT_REGION> (i.e. 'us-east-1', 'us-east-2', 'us-west-1', 'eu-west-1`, etc.)
# Default output format [None]: json
```

    {% admonition type="info" %}
    Note: This is going to store the credentials on your local machine in `~/.aws/credentials` on Linux or `%USERPROFILE%\.aws\credentials` on Windows.
    {% /admonition %}

We recommend periodically rotating this credential to practice good security hygiene. 

To do so, generate a new `AccessKey` in [AWS IAM User Console](https://us-east-1.console.aws.amazon.com/iam/home?region=us-east-1#/users) for the IAM user. Then again re-run:

```bash
aws configure --profile {% $profile_name %}
```

Fill in the new `AccessKey`/`SecretKey` values when prompted. Be sure to deactivate the old `AccessKey` in the AWS IAM User Console after rotation. 