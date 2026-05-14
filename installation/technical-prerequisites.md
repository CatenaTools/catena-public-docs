# Technical Requirements

Catena is customer-hosted software and is not restricted to a specific cloud provider, hosting platform, or deployment strategy.

Catena can run locally, on bare metal, on virtual machines, in containers, on cloud infrastructure, or as a distributed production system. The exact requirements depend on whether you are building Catena, running Catena locally, or deploying Catena into a hosted environment.

For step-by-step setup instructions, see [How to Run Catena](../installation).

## Access Requirements

To build, run, or deploy Catena, you need access to the Catena source code.

Catena is distributed through Git. To gain access to the Catena source repository, contact Wolfjaw to obtain a license.

Most paths require:

| Requirement | Purpose |
|---|---|
| Git | Clone Catena source code |
| Catena source repository access | Build, run, or deploy Catena |
| Command-line access | Run local, Docker, cloud, or deployment commands |

Some deployment paths may also require access to the Catena infrastructure repository.

## Requirements to Build Catena

Building Catena from source requires:

| Requirement | Purpose |
|---|---|
| Git | Clone the Catena source repository |
| Catena source repository access | Obtain Catena source code |
| .NET 8 SDK | Build Catena |
| Local command-line environment | Run build and development commands |

Catena is built with .NET 8.

For step-by-step instructions, see [Running From Source](../installation/source).

## Requirements to Run Catena

Running Catena means starting the Catena application and any supporting services required by the selected configuration.

Catena can be run directly from source or through Docker.

### Running From Source

Running Catena from source requires:

| Requirement | Purpose |
|---|---|
| .NET 8 SDK or runtime | Build and run Catena locally |
| Local configuration | Provides environment-specific settings |
| Local storage | Stores local development data where applicable |

### Running With Docker

Running Catena with Docker requires:

| Requirement | Purpose |
|---|---|
| Docker-compatible runtime | Runs Catena containers |
| Docker Compose | Starts the documented local container stack |
| WSL | Required for the documented Windows Docker workflow |

The default Docker Compose configuration may start additional local containers, including:

| Container | Purpose |
|---|---|
| `catena-tools-core` | Catena backend |
| `kafka` | Optional message transport support |
| `init-kafka` | Kafka topic initialization |
| `redis` | Optional ephemeral/session storage |

For step-by-step instructions, see [Running With Docker](../installation/docker).

## Documented Deployment Path Requirements

The following requirements apply to deployment paths documented in this guide. They are not the only ways to deploy Catena.

### AWS EC2 Deployment Requirements

Deploying Catena to AWS on a single EC2 instance requires:

| Requirement | Purpose |
|---|---|
| AWS account | Owns the AWS resources used by the deployment |
| Scoped AWS IAM deployment identity | Used by Terraform/AWS CLI to provision resources |
| AWS CLI | Configures local AWS credentials and profile |
| Terraform | Provisions AWS infrastructure |
| Catena source repository access | Required to deploy Catena |
| Catena infrastructure repository access | Required for the AWS Terraform configuration |
| Route53 domain or hosted zone | Used for public DNS resolution |
| S3 bucket | Stores Terraform state |
| SSH key pair | Used for deployment and administrative access |
| Local command-line environment | Runs Terraform, AWS CLI, and Git deployment commands |

The AWS EC2 deployment provisions infrastructure in the customer’s AWS account. The current single-node deployment may create resources such as IAM roles, VPC networking, subnets, an Internet Gateway, a security group, an Elastic IP, Route53 records, and an EC2 instance.

For step-by-step instructions, see [Deploying to AWS](../installation/aws-ec2).

### Heroku Deployment Requirements

Deploying Catena to Heroku requires:

| Requirement | Purpose |
|---|---|
| Heroku account | Owns the Heroku application and add-ons |
| Heroku CLI | Creates and manages the Heroku app |
| Git | Pushes Catena to Heroku |
| Catena source repository access | Required to deploy Catena |
| Heroku PostgreSQL add-on | Persistent database storage |
| Heroku Redis add-on | Redis/session storage |
| Heroku-compatible buildpack | Builds and runs Catena |
| Payment method | Required by Heroku for the documented deployment path |

For step-by-step instructions, see [Deploying to Heroku](../installation/heroku).

### Custom Infrastructure Requirements

Catena is not restricted to the documented deployment paths.

When deploying Catena to custom infrastructure, customers are responsible for ensuring that the environment provides the compute, runtime, network access, persistence, configuration, secrets management, logging, monitoring, backup, and operational access required by their deployment.

Custom deployments may include bare metal servers, virtual machines, container platforms, Kubernetes, private cloud, public cloud, or customer-managed platform infrastructure.