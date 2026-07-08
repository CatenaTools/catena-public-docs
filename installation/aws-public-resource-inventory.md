## Public Resources Created by This Deployment

This AWS deployment creates a single public Catena endpoint backed by one EC2
instance.

The following resources may be publicly reachable or may participate in public
network access:

| Resource | Purpose | Public exposure |
|---|---|---|
| EC2 instance | Runs Dokku and the Catena application | Receives inbound traffic allowed by the security group |
| Elastic IP | Provides a stable public IPv4 address for the EC2 instance | Public IPv4 address |
| Route53 records | Maps the configured domain name to the Catena deployment | Public DNS resolution |
| Security group ingress rules | Controls inbound access to the EC2 instance | Any rule allowing traffic from `0.0.0.0/0` or `::/0` is publicly reachable |
| Internet Gateway | Allows the VPC to communicate with the internet | Enables internet routing for public subnets |
| Public subnet / route table | Places the EC2 instance on an internet-routable network path | Enables public access when combined with a public IP and permissive security group rules |
| TLS certificate | Secures HTTPS access to the Catena endpoint | Public certificate for the configured hostname |

Catena does not require unrestricted inbound access from the internet. Customers
should expose only the ports required for their deployment and restrict
administrative access to trusted networks.

Redis and SQLite are installed on the EC2 instance for this deployment. They
should not be directly exposed to the public internet.

## AWS Architecture Diagram for Resources Created by This Deployment

![Catena AWS Architecture Diagram](/images/CatenaAwsArchitecture.jpg)

_For a bigger image, right click and "Open Image in New Tab"_
