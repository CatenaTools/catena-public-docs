# Deploying to AWS on a Single EC2 Instance

## Estimated Time
Starting from scratch, deploying Catena to AWS on a single EC2 instance is estimated to take **30-45 minutes**.

## What Is Amazon EC2?
[Amazon EC2](https://aws.amazon.com/ec2/) stands for Amazon Elastic Cloud Compute. It is Amazon's offering for creating and running virtual machines, called instances, in the cloud.

## Deployment Instructions
{% partial file="/_partials/install-catena/obtain-catena-source.md" /%}

To deploy to AWS, you will also need to clone Catena's Infrastructure as Code repository.

```bash
git clone git@github.com:CatenaTools/infrastructure.git
```

### 2. Prep Work

#### 2a. Create an AWS Account
To create an AWS account, follow [these instructions from AWS](https://aws.amazon.com/resources/create-account/).

#### 2b. Create Credentials
1. Log in to your AWS account that was created in the previous step.
2. Navigate to the Identity and Access Management (IAM) portion of the AWS console. [Here is a link](https://us-east-1.console.aws.amazon.com/iam/home?region=us-east-1#/home).
3. Navigate to the "Users" section of the IAM console. [Here is a link](https://us-east-1.console.aws.amazon.com/iam/home?region=us-east-1#/users).
4. Select "Create user".
5. Name your user. For the purposes of these instructions, we'll call ours `catena_deployment`.
    1. Leave the "Provide user access to teh AWS Management Console" option unchecked. This user will only require programmatic access to AWS.
6. On the next step, select "Attach policies directly"
    1. In the policies list, check the `AdministratorAccess` policy
7. Proceed to the "Review and create" step. Your user should look something like this:

[ ![review and create user](/images/install-catena/review-and-create-user.png) ](/images/install-catena/review-and-create-user.png)

8. Create the user
9. Navigate to the user's details
10. Select "Security credentials"
11. Under the "Access keys" section, select "Create access key"
12. Select "Third-party service"
    1. *Note: AWS will recommend an alternative option. For ease of use, we will ignore this for the time being. Select "I understand the above recommendation and want to proceed to create an access key"*
13. Proceed to the next step and set an optional description tag
14. Create your access key
15. **Make note of your "Access key" and "Secret access key". You will need them later**

#### 2c. Configure Your Domain
This guide requires using [Route53](https://aws.amazon.com/route53/) for your domain name.

1. Register a new domain name or migrate an existing one
    1. If you need to register a new domain name, refer to [this Route53 documenation about registering new domains](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/domain-register.html#domain-register-procedure-section)
    2. If you have an existing domain name, refer to [this Route53 documentation about making Route53 the DNS service for an existing domain](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/MigratingDNS.html)
2. If a "Hosted Zone" for your domain was not automatically created, refer to [this Route53 documentation about creating hosted zones](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/CreatingHostedZone.html)

#### 2d. Create an S3 Bucket
[S3](https://aws.amazon.com/s3/), or Simple Storage Service, is where Catena's Infrastructure as Code will store information about the state of your deployment. This state can be accessed by other developers on your team to ensure that updates they make to your infrastructure are compatible with what is currently deployed.

1. Navigate to the S3 portion of the AWS console. [Here is a link](https://us-east-1.console.aws.amazon.com/s3/home).
2. Click "Create bucket"
3. Keep the default settings for all options
4. Name your bucket. We'll call ours `catena-terraform-state`
5. **Make note of the AWS Region on this page, you will need it later**

#### 2e. Install Dependencies

##### AWS CLI
The AWS CLI is a tool that allows users to manage AWS resources through the command line. With it, you can expose credentials to Terraform in future steps.

1. To install the AWS CLI, refer to [their installation documentation](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
2. Once the CLI is installed, add your credentials that you created earlier. We'll be adding them to a specific profile called `catena_deploy`, but you can use whatever profile name you'd like.
    1. For a list of available regions you can provide when prompted for the default region, refer to [available regions](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-available-regions). We recommend using the same region your S3 bucket was created in.

```bash
aws configure --profile catena_deploy

# Interactive Input
# AWS Access Key ID [None]: <YOUR_ACCESS_KEY>
# AWS Secret Access Key [None]: <YOUR_SECRET_ACCESS_KEY>
# Default region name [None]: <YOUR_DEFAULT_REGION> (i.e. 'us-east-1', 'us-east-2', 'us-west-1', 'eu-west-1`, etc.)
# Default output format [None]: json
```

##### Terraform
[Terraform](https://www.terraform.io/) is an infrastructure-as-code (IaC) tool created by HashiCorp. It allows users to develop, modify, and version infrastructure components. With it, we can deploy Catena to AWS in a handful of commands.

To install Terraform, refer to [their installation documentation](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli).

##### SSH Key
In order to deploy Catena, you will need to generate an SSH key.

{% tabs %}
    {% tab label="Windows" %}
        ```bash
        cd %USERPROFILE%/.ssh/
        ssh-keygen -t rsa -b 2048 -m PEM -f catena_deploy_key
        ```
    {% /tab %}

    {% tab label="Unix Based Command Prompts" %}
        ```bash
        cd ~/.ssh/
        ssh-keygen -t rsa -b 2048 -m PEM -f catena_deploy_key
        ```
    {% /tab %}
{% /tabs %}

This will generate two files, each of which will be used by Terraform when deploying Catena:
* `catena_deploy_key`
* `catena_deploy_key.pub`

### 3. Deploy Catena
Now that you have everything prepped, it's time to actually deploy Catena.

This deployment configuration utilizes [Dokku](https://dokku.com/), which allows us to use Git to make deployments to our AWS Instance.

1. Depending on your operating system, open Windows Command Prompt, Powershell, Terminal, or Command Line.
2. Navigate to the Catena Infrastructure repository you cloned earlier.
3. Navigate to the `aws/catena-core/` directory.
4. Copy `backend.hcl.example` to `backend.hcl` and `vars.tfvars.example` to `vars.tfvars`

{% tabs %}
    {% tab label="Windows" %}
        ```bash
        copy backend.hcl.example backend.hcl
        copy vars.tfvars.example vars.tfvars
        ```
    {% /tab %}

    {% tab label="Unix Based Command Prompts" %}
        ```bash
        cp backend.hcl.example backend.hcl
        cp vars.tfvars.example vars.tfvars
        ```
    {% /tab %}
{% /tabs %}

5. Modify `backend.hcl` with your S3 bucket name, the region of your S3 bucket, and the profile you created when configuring the AWS CLI
6. Modify `vars.tfvars` with your own values for your deployment
7. Initialize Terraform

```bash
terraform init -backend-config="backend.hcl"
```

8. (Optional) Run a Terraform plan. This will preview all of the AWS resources that are about to be provisioned.

```bash
terraform plan -var-file="vars.tfvars"
```

9. Run a Terraform apply. This will preview all of the AWS resource that are about to be provisioned, and prompt you if you'd like to proceed.

```bash
terraform apply -var-file="vars.tfvars"
```

You should see a long list of output, with something resembling the following code block at the end.

_Note: This is just example output._

```bash
Apply complete! Resources: 26 added, 0 changed, 0 destroyed.

Outputs:

add_dokku_remote_command = "git remote add dokku dokku@catenatools.com:platform"
catena_url = "https://platform.catenatools.com"
ec2_instance_id = "i-07f061200fdc6daf9"
ec2_instance_ssh_command = "aws ec2-instance-connect ssh --os-user ubuntu --instance-id i-07f061200fdc6daf9 --profile catena_deploy"
ec2_ip = "3.218.158.134"
is_healthy = "https://platform.catenatools.com/api/v1/node_inspection/is_healthy"
powershell_deploy_command = "$env:GIT_SSH_COMMAND='ssh -i ~/.ssh/catena_deploy_key -o IdentitiesOnly=yes'; git push dokku main"
unix_deploy_command = "GIT_SSH_COMMAND='ssh -i ~/.ssh/catena_deploy_key -o IdentitiesOnly=yes' git push dokku main"
windows_deploy_command = "set \"GIT_SSH_COMMAND=ssh -i ~/.ssh/catena_deploy_key -o IdentitiesOnly=yes\" && git push dokku main"
```

{% admonition type="warning" name="Troubleshooting" %}
    If this step fails during the `(remote-exec)` step, you should tear down your resources and re-do step 9.

    ```bash
    terraform destroy -var-file="vars.tfvars"
    ```
{% /admonition %}

10. Navigate to the Catena Core repository you cloned earlier.
11. Use the `add_dokku_remote_command` that was output from when you ran `terraform apply` to add the Dokku remote.

```bash
git remote add dokku dokku@<your-url>:platform
```

12. Use the appropriate command that was output from when you ran `terraform apply` to deploy Catena (this may take a while)
    1. Options Include:
        1. `powershell_deploy_command` if you are using Powershell
        2. `windows_deploy_command` if you are using Windows Command Prompt
        3. `unix_deploy_command` if you are using a Unix Based Command Prompt
    2. When prompted if you'd like to continue connecting, select "yes"

13. Check that Catena is running, by navigating to the URL specified in the `is_healthy` output from when you ran `terraform apply`

## How Does This Work?
Terraform creates an array of resources in your AWS account. These include:
* [Identity and Access Management (IAM)](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html) roles necessary for your EC2 instance to operate
* A [Virtual Private Cloud (VPC)](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html) to house your EC2 instance in its own dedicated network
* [Subnets](https://docs.aws.amazon.com/vpc/latest/userguide/configure-subnets.html) to define IP address ranges that an EC2 instance can use
* An [Internet Gateway](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html) to allow our VPC to communicate with the outside internet
* A [Security Group](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) containing rules that restrict inbound traffic to what is necessary and open outbound traffic to allow communication with the outside internet
* An [Elastic IP](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html) that gives our EC2 instance a static IPv4 address
* [Route53](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html) records that update DNS resolution for our deployment
* An [EC2 Instance](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html) that Catena is deployed to

If you would like to see the details for each of these resources, you can look through the `aws/catena-core/main.tf` file in the Catena Infrastructure repository for more details.

Once these resources are provisioned, an init script is run on the EC2 instance that:
1. Installs [Dokku](https://dokku.com/)
2. Configures Dokku to recognize your domain name
3. Installs [LetsEncrypt](https://letsencrypt.org/), to enable SSL
    1. Generates a cert for your deployment
4. Creates a Catena app within Dokku
    1. Configures a few necessary environment variables
    2. Exposes this app to the outside world
5. Installs Redis and runs it
6. Configures persistent database storage (SQLite)

If you would like to see the details for this init script, you can view it at the `aws/catena-core/ec2/templates/init.sh.tftpl` file in the Catena Infrastructure repository for more details.

The final step is the `git push` that you manually complete, pushing a version of Catena to your instance. Dokku builds the source and runs it.

## What Next?
{% partial file="/_partials/install-catena/what-next.md" /%}