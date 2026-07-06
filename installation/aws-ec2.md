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

## What is an Amazon VPC?
[VPC](https://aws.amazon.com/vpc/) stands for Virtual Private Cloud. It is an Amazon service that allows users to create isolated virtual networks within the Amazon Web Services (AWS) cloud. It provides control over network configuration, including IP address management, subnets, and security settings for AWS resources.

## What is an Elastic IP?
An [Elastic IP address](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html) is a static, public IPv4 address that stays fixed even if the EC2 instance behind it is stopped, restarted, or replaced. This deployment uses one so your domain always resolves to the same address, regardless of what happens to the underlying instance.

## A Note on AWS Service Limits

New AWS accounts have default quotas you might run into over time, especially if you're running multiple parallel deployments.

- **Elastic IPs: quota of 5 per Region by default** for any new account. If we try a 6th parallel deployment in the same account/region, it will fail to provision until we either request an increase or free up an existing EIP. You can request a higher quota anytime via the [Service Quotas console](https://console.aws.amazon.com/servicequotas/home/services/ec2/quotas/). **Note:** Quota increase is free, however you will be charged for each allocated EIP.
- **VPCs: 5 per Region by default**, also adjustable with no direct per-VPC charge.
- **On-Demand EC2 vCPUs**: new accounts often start with a low default. Check your account's current value before choosing a larger instance size than the default `t2.small`. `t2.small` itself is not in the free tier so be aware of that cost before deployment.

Check your current usage and request increases in advance via the [Service Quotas console](https://console.aws.amazon.com/servicequotas/home/services/ec2/quotas/) — approval isn't always instant.


## Where can Catena be Deployed?
Catena can be deployed into any AWS region that supports Amazon EC2 instances running in an Amazon VPC. AWS Regions that support both Amazon EC2 and Amazon VPC include US East (N. Virginia), US West (N. California), AWS GovCloud (US-East), AWS GovCloud (US-West), Asia Pacific (Hong Kong), and South America (São Paulo).

    {% admonition type="info" %}
    **Running this guide as instructed will incur charges.** Free Tier EC2 coverage applies only to `t2.micro` instance sizes. We recommended `t2.small` for this deployment. `t2.small` and any larger size incurs cost from the first hour it runs. Budget accordingly if you're running this alongside other AWS usage, and tear down deployments you're no longer using (`terraform destroy`) rather than leaving them running idle
    {% /admonition %}

## Deployment Instructions
{% partial file="/_partials/install-catena/obtain-catena-source.md" /%}

To deploy to AWS, you will also need to clone Catena's Infrastructure as Code repository.

```bash
git clone git@github.com:CatenaTools/infrastructure.git
```

### 2. Preparations

#### 2a. Create an AWS Account
{% partial file="/_partials/aws/create-an-aws-account.md" /%}

#### 2b. Create IAM Policy

{% partial file="/_partials/aws/examples-catena-deploy-policy.md" /%}

#### 2c. Create Credentials
We are going to setup the catena_deployment IAM user. The catena_deployment user will be used by Terraform to provision your AWS infrastructure — it's only used at deploy/update time and will never be used by the running Catena application.

> **Do not use the AWS account root user!**
>
> Do not use the AWS account root user to deploy or operate Catena. The root user has unrestricted access to all AWS services and resources in the account, including billing and account-level settings. Catena does not require root user privileges for deployment or operation.

{% partial file="/_partials/aws/create-credentials.md" variables={
    iam_username: "catena_deployment"
} /%}

#### 2d. Configure Your Domain
This guide requires using [Route53](https://aws.amazon.com/route53/) for your domain name.

1. Register a new domain name or migrate an existing one
    - If you need to register a new domain name, refer to [this Route53 documenation about registering new domains](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/domain-register.html#domain-register-procedure-section).
    - If you have an existing domain name, refer to [this Route53 documentation about making Route53 the DNS service for an existing domain](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/MigratingDNS.html).
2. If a "Hosted Zone" for your domain was not automatically created, refer to [this Route53 documentation about creating hosted zones](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/CreatingHostedZone.html).

#### 2e. Create an S3 Bucket
[S3](https://aws.amazon.com/s3/), or Simple Storage Service, is where Catena's Infrastructure as Code will store information about the state of your deployment. This state can be accessed by other developers on your team to ensure that updates they make to your infrastructure are compatible with what is currently deployed.

1. Navigate to the [S3 portion](https://us-east-1.console.aws.amazon.com/s3/home) of the AWS console
2. Click "Create bucket"
3. Keep the default settings for all options
   * Amazon S3 encrypts new objects at rest by [default using server-side encryption with Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingServerSideEncryption.html) managed keys, also known as SSE-S3.
   * This will provide Encryption at Rest for your S3 bucket out of the box.
4. Name your bucket. We'll call ours `catena-terraform-state`
{% admonition type="warning" %}
**Make note of the AWS Region on this page. You will need it later.**
{% /admonition %}

#### 2f. Install Dependencies

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
* `catena_deploy_key` - Private Key that stays local to your machine, will be referenced later when deploying to the instance (see step 3 below).
* `catena_deploy_key.pub` - Public Key that Terraform uploads to AWS as an EC2 key pair during `terraform apply`, provisioning SSH access to the instance it creates.

These files will be created on your local machine in `%USERPROFILE%\.ssh\` on Windows or `~/.ssh/` on Linux

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
6. Modify `vars.tfvars` with your own values for your deployment.

A few of these configuration values are worth a closer look before you proceed:

### ec2_instance_size

This deployment runs Catena Core, Redis, and SQLite together on a single instance, so sizing depends primarily on expected concurrent session load rather than heavy compute needs.

The default value set, t2.small (2 vCPU / 2 GB RAM), is suitable for development, staging, and small-scale production.

| Instance Size                       | vCPU / RAM                                 | Recommended For                                                                     |
|------------------------------------|-----------------------------------------|---------------------------------------------------------------------------------|
| `t2.small` (default)                       | 2 vCPU / 2 GB                          | Development, staging, small production workloads                                    |
| `t2.medium`                           | 2 vCPU / 4 GB                             | Early production with moderate concurrent sessions                                              |
| `t2.large`           | 2 vCPU / 8 GB                | Higher player counts or additional plugins/modules                                          |
**Remember** None of these sizes come with the free AWS tier, running with the default value will incur charges here

If you consistently exhaust CPU credits (visible via the `CPUCreditBalance` CloudWatch metric once deployed), move up a size.

### ec2_ami
The default value is the Ubuntu 22.04 LTS AMI ID for `us-east-1`. AMI IDs are region-specific — if you set aws_region to anything other than `us-east-1`, you'll need to find the matching Ubuntu 22.04 LTS AMI ID for your chosen region (e.g. via the [AWS AMI Locator](https://cloud-images.ubuntu.com/locator/ec2/) or run `aws ec2 describe-images` in the CLI), or Terraform will fail to find that AMI in your target region.

#### Root Volume Size
The EC2 instance's root EBS volume is fixed at 50 GB and is not currently exposed as a `vars.tfvars` variable. That 50 GB covers the OS, Dokku, your application, and SQLite database growth for most basic deployments.

If you need a different size, edit the `root_block_device` size value directly in `main.tf` (in the `aws/catena-core` module) before running `terraform apply`. EBS also supports resizing an existing volume without downtime if you need to grow it later — see [AWS's guide on modifying EBS volumes](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/requesting-ebs-volume-modifications.html).


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
* An encrypted Amazon EBS volume used by that EC2 instance for operating system, application, and local data-store files.
  * This deployment encrypts its local database files at rest by storing them on an encrypted Amazon EBS volume.

Catena stores data in both it's SqlLite and Redis running in it's EC2 instance.
The following services store data that may be considered sensitive:

| Catena Service       | Storage Location |
|----------------------|------------------|
| CatenaAccounts       | SqlLite          |
| CatenaApiKeys        | SqlLite          |
| CatenaPlatformAuth   | SqlLite          |
| CatenaSessions       | SqlLite / Redis  |

If you would like to see the configuration for each of these resources, you can look through the `aws/catena-core/main.tf` file in the [Catena Infrastructure repository](https://github.com/CatenaTools/infrastructure) for more details.

Once these resources are provisioned, an init script is run on the EC2 instance that:
1. Installs [Dokku](https://dokku.com/)
2. Configures Dokku to recognize your domain name
3. Installs [LetsEncrypt](https://letsencrypt.org/), to enable SSL (generates a cert for your deployment)
4. Creates a Catena app within Dokku
    - Configures a few necessary environment variables
    - Exposes this app to the outside world
5. Installs Redis and runs it
6. Configures persistent database storage using SQLite on the encrypted EBS volume

If you would like to see the details for this init script, you can view it at the `aws/catena-core/ec2/templates/init.sh.tftpl` file in the Catena Infrastructure repository for more details.

The final step is the `git push` that you manually complete, pushing a version of Catena to your instance. Dokku builds the source and runs it.

## What Next?
{% partial file="/_partials/install-catena/what-next.md" /%}
