1. Log in to your AWS account that was created in the previous step.
2. Navigate to the [Identity and Access Management (IAM)](https://us-east-1.console.aws.amazon.com/iam/home?region=us-east-1#/home) portion of the AWS console.
3. Navigate to the [Users](https://us-east-1.console.aws.amazon.com/iam/home?region=us-east-1#/users) section of the IAM console.
4. Select "Create user".
5. Name your user. For the purposes of these instructions, we'll call ours "{% $iam_username %}".
    - Leave the "Provide user access to the AWS Management Console" option unchecked. This user will only require programmatic access to AWS.
6. On the next step, select "Attach policies directly"
    - In the policies list, check the `AdministratorAccess` policy.
7. Proceed to the "Review and create" step. Your user should look something like this:

[ ![review and create user](/images/install-catena/review-and-create-user.png) ](/images/install-catena/review-and-create-user.png)

8. Create the user
9. Navigate to the user's details
10. Select "Security credentials"
11. Under the "Access keys" section, select "Create access key"
12. Select "Third-party service"
    {% admonition type="info" %}
    Note: AWS will recommend an alternative option. For ease, we will ignore this for the time being. Select "I understand the above recommendation and want to proceed to create an access key".
    {% /admonition %}
13. Proceed to the next step and set an optional description tag
14. Create your access key
{% admonition type="warning" %}
**Make note of your "Access key" and "Secret access key". You will need them later.**
{% /admonition %}