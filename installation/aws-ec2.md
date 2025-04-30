---
markdown:
  toc:
    depth: 3
---

# Deploying to AWS on a Single EC2 Instance

## Estimated Time
Starting from scratch, deploying Catena to AWS on a single EC2 instance is estimated to take **30-45 minutes**.

## What Is Amazon EC2?
[EC2](https://aws.amazon.com/ec2/) stands for Elastic Cloud Compute. It is Amazon's offering for creating and running virtual machines, called _instances_, in the cloud.

## Deployment Instructions
{% partial file="/_partials/install-catena/obtain-catena-source.md" /%}

To deploy to AWS, you will also need to clone Catena's Infrastructure as Code repository.

```bash
git clone git@github.com:CatenaTools/infrastructure.git
```

### 2. Preparations

#### 2a. Create an AWS Account
{% partial file="/_partials/aws/create-an-aws-account.md" /%}

#### 2b. Create Credentials
{% partial file="/_partials/aws/create-credentials.md" variables={
    iam_username: "catena_deployment"
} /%}

#### 2c. Configure Your Domain
This guide requires using [Route53](https://aws.amazon.com/route53/) for your domain name.

1. Register a new domain name or migrate an existing one
    - If you need to register a new domain name, refer to [this Route53 documenation about registering new domains](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/domain-register.html#domain-register-procedure-section).
    - If you have an existing domain name, refer to [this Route53 documentation about making Route53 the DNS service for an existing domain](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/MigratingDNS.html).
2. If a "Hosted Zone" for your domain was not automatically created, refer to [this Route53 documentation about creating hosted zones](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/CreatingHostedZone.html).

#### 2d. Create an S3 Bucket
[S3](https://aws.amazon.com/s3/), or Simple Storage Service, is where Catena's Infrastructure as Code will store information about the state of your deployment. This state can be accessed by other developers on your team to ensure that updates they make to your infrastructure are compatible with what is currently deployed.

1. Navigate to the [S3 portion](https://us-east-1.console.aws.amazon.com/s3/home) of the AWS console
2. Click "Create bucket"
3. Keep the default settings for all options
4. Name your bucket. We'll call ours `catena-terraform-state`
{% admonition type="warning" %}
**Make note of the AWS Region on this page. You will need it later.**
{% /admonition %}

#### 2e. Install Dependencies

##### AWS CLI
{% partial file="/_partials/aws/install-aws-cli.md" variables={
    profile_name: "catena_deploy"
} /%}

##### Terraform
{% partial file="/_partials/aws/terraform.md" /%}

##### SSH Key
In order to deploy Catena, you will need to generate an SSH key.

{% tabs %}
    {% tab label="Powershell" %}
        ```bash
        # This will fail if the directory exists, but is safe to run to ensure it does exist
        mkdir $env:USERPROFILE/.ssh/

        # Generate the SSH Key
        cd $env:USERPROFILE/.ssh/
        ssh-keygen -t rsa -b 2048 -m PEM -f catena_deploy_key
        ```
    {% /tab %}

    {% tab label="Unix Based Command Prompts" %}
        ```bash
        cd ~/.ssh/
        ssh-keygen -t rsa -b 2048 -m PEM -f catena_deploy_key
        chmod 600 catena_deploy_key
        ```
    {% /tab %}
{% /tabs %}

This will generate two files, each of which will be used by Terraform when deploying Catena:
* `catena_deploy_key`
* `catena_deploy_key.pub`

### 3. Deploy Catena
Now that you have everything prepped, it's time to actually deploy Catena.

This deployment configuration utilizes [Dokku](https://dokku.com/), which allows us to use Git to make deployments to our AWS Instance.

1. Depending on your operating system, open Powershell, Terminal, or Command Line.
2. Navigate to the Catena Infrastructure repository you cloned earlier.
3. Navigate to the `aws/catena-core/` directory.
4. Copy `backend.hcl.example` to `backend.hcl` and `vars.tfvars.example` to `vars.tfvars`

{% tabs %}
    {% tab label="Powershell" %}
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
    - Options Include:
        - `powershell_deploy_command` if you are using Powershell
        - `windows_deploy_command` if you are using Windows Command Prompt
        - `unix_deploy_command` if you are using a Unix Based Command Prompt
    - When prompted if you'd like to continue connecting, select "yes"

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
3. Installs [LetsEncrypt](https://letsencrypt.org/), to enable SSL (generates a cert for your deployment)
4. Creates a Catena app within Dokku
    - Configures a few necessary environment variables
    - Exposes this app to the outside world
5. Installs Redis and runs it
6. Configures persistent database storage (SQLite)

If you would like to see the details for this init script, you can view it at the `aws/catena-core/ec2/templates/init.sh.tftpl` file in the Catena Infrastructure repository for more details.

The final step is the `git push` that you manually complete, pushing a version of Catena to your instance. Dokku builds the source and runs it.

## What Next?
{% partial file="/_partials/install-catena/what-next.md" /%}