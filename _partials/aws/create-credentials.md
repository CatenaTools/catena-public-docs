1. Log in to your AWS account that was created in the previous step.
2. Navigate to the [Identity and Access Management (IAM)](https://us-east-1.console.aws.amazon.com/iam/home?region=us-east-1#/home) portion of the AWS console.
3. Navigate to the [Users](https://us-east-1.console.aws.amazon.com/iam/home?region=us-east-1#/users) section of the IAM console.
4. Select "Create user".
5. Name your user. For the purposes of these instructions, we'll call ours "{% $iam_username %}".
    - Leave the "Provide user access to the AWS Management Console" option unchecked. This user will only require programmatic access to AWS.
6. On the next step, select "Attach policies directly"
    - In the policies list, select the `CatenaDeploymentPolicy` you made in the previous step.

7. Proceed to the "Review and create" step. Your user should look something like this:

[ ![review and create user](/images/install-catena/review-and-create-user.png) ](/images/install-catena/review-and-create-user.png)

8. Create the user
9. Navigate to the user's details
10. Select "Security credentials"
11. Under the "Access keys" section, select "Create access key" to create secret keys for the "{% $iam_username %}" IAM user
    - These keys will later be passed to the AWS CLI (and by extension Terraform) so that the IAM user can authenticate as "{% $iam_username %}" when provisioning resources in AWS.
12. Select "Third-party service"
    {% admonition type="info" %}
    Note: AWS will recommend an alternative option. For ease, we will ignore this for the time being. Select "I understand the above recommendation and want to proceed to create an access key".
    {% /admonition %}
13. Proceed to the next step and set an optional description tag
14. Create your access key
    - Make note of the "Access key" and "Secret access key" as you will need these later.
{% admonition type="warning" %}
**Treat these credentials like a password — anyone with them can act as the "{% $iam_username %}" user in your AWS account. Never paste these into chat messages, tickets, or plaintext notes. If your organization uses a password manager (1Password, Bitwarden, etc.), we suggest storing them there rather than in a temporary note.**
{% /admonition %}