We'll be using a scoped IAM policy specifically for deployment in order to follow Least Privilege guidelines.
The `catena_deploy` user will have this `CatenaDeploymentPolicy` policy attached.

1. Log in to your AWS account that was created in the previous step.
2. Navigate to Access Management -> Policies
3. Create Policy
4. Use the `JSON` Editor to paste in the custom policy below.
5. Hit Next
6. Give the policy a name like `CatenaDeploymentPolicy`
7. Finish by creating the policy, then proceed to the next section.

Replace the following placeholders before attaching the policy:

| Placeholder                          | Example                                 | Description                                                                     |
|--------------------------------------|-----------------------------------------|---------------------------------------------------------------------------------|
| `<ACCOUNT_ID>`                       | `144518428993`                          | AWS account ID where Catena will be deployed                                    |
| `<REGION>`                           | `us-east-1`                             | AWS region used for the deployment                                              |
| `<TERRAFORM_STATE_BUCKET>`           | `catena-terraform-state`                | SS3 bucket used for Terraform remote state                                          |
| `<TERRAFORM_STATE_PREFIX>`           | `catena-core/*`                         | S3 prefix Terraform may list while checking state and lock objects              |
| `<TERRAFORM_STATE_KEY>`              | `catena-core/terraform.tfstate`         | Exact path used for this deployment’s Terraform state                           |
| `<CATENA_EC2_ROLE_NAME>`             | `catena-gameserver-ec2-role`            | IAM role name Terraform creates or uses for the Catena EC2 instance             |
| `<CATENA_EC2_INSTANCE_PROFILE_NAME>` | `catena-gameserver-ec2-instance-profile` | IAM instance profile name Terraform creates or uses for the Catena EC2 instance |

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "TerraformStateBucketList",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::<TERRAFORM_STATE_BUCKET>",
      "Condition": {
        "StringLike": {
          "s3:prefix": [
            "<TERRAFORM_STATE_PREFIX>"
          ]
        }
      }
    },
    {
      "Sid": "TerraformStateObjectAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::<TERRAFORM_STATE_BUCKET>/<TERRAFORM_STATE_KEY>"
    },
    {
      "Sid": "TerraformStateLockAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::<TERRAFORM_STATE_BUCKET>/<TERRAFORM_STATE_KEY>.tflock"
    },
    {
      "Sid": "ReadEC2State",
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*",
        "ec2:GetConsoleOutput"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ManageCatenaEC2VpcAndNetworkResources",
      "Effect": "Allow",
      "Action": [
        "ec2:CreateVpc",
        "ec2:DeleteVpc",
        "ec2:ModifyVpcAttribute",
        "ec2:CreateSubnet",
        "ec2:DeleteSubnet",
        "ec2:ModifySubnetAttribute",
        "ec2:CreateInternetGateway",
        "ec2:DeleteInternetGateway",
        "ec2:AttachInternetGateway",
        "ec2:DetachInternetGateway",
        "ec2:CreateRouteTable",
        "ec2:DeleteRouteTable",
        "ec2:CreateRoute",
        "ec2:DeleteRoute",
        "ec2:AssociateRouteTable",
        "ec2:DisassociateRouteTable",
        "ec2:CreateSecurityGroup",
        "ec2:DeleteSecurityGroup",
        "ec2:AuthorizeSecurityGroupIngress",
        "ec2:AuthorizeSecurityGroupEgress",
        "ec2:RevokeSecurityGroupIngress",
        "ec2:RevokeSecurityGroupEgress",
        "ec2:ModifySecurityGroupRules",
        "ec2:UpdateSecurityGroupRuleDescriptionsIngress",
        "ec2:UpdateSecurityGroupRuleDescriptionsEgress"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ManageCatenaEC2InstanceAndAddressResources",
      "Effect": "Allow",
      "Action": [
        "ec2:RunInstances",
        "ec2:TerminateInstances",
        "ec2:StartInstances",
        "ec2:StopInstances",
        "ec2:RebootInstances",
        "ec2:AllocateAddress",
        "ec2:AssociateAddress",
        "ec2:DisassociateAddress",
        "ec2:ReleaseAddress",
        "ec2:ImportKeyPair",
        "ec2:CreateKeyPair",
        "ec2:DeleteKeyPair",
        "ec2:CreateTags",
        "ec2:DeleteTags"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ManageCatenaRoute53Records",
      "Effect": "Allow",
      "Action": [
        "route53:GetHostedZone",
        "route53:ListHostedZones",
        "route53:ListHostedZonesByName",
        "route53:ListResourceRecordSets",
        "route53:ChangeResourceRecordSets"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ManageCatenaEc2IamRoleAndInstanceProfile",
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:GetRole",
        "iam:TagRole",
        "iam:UntagRole",
        "iam:UpdateAssumeRolePolicy",
        "iam:PutRolePolicy",
        "iam:GetRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:ListRolePolicies",
        "iam:CreateInstanceProfile",
        "iam:DeleteInstanceProfile",
        "iam:GetInstanceProfile",
        "iam:TagInstanceProfile",
        "iam:UntagInstanceProfile",
        "iam:AddRoleToInstanceProfile",
        "iam:RemoveRoleFromInstanceProfile"
      ],
      "Resource": [
        "arn:aws:iam::<ACCOUNT_ID>:role/<CATENA_EC2_ROLE_NAME>",
        "arn:aws:iam::<ACCOUNT_ID>:instance-profile/<CATENA_EC2_INSTANCE_PROFILE_NAME>"
      ]
    },
    {
      "Sid": "PassOnlyCatenaEc2Role",
      "Effect": "Allow",
      "Action": [
        "iam:PassRole"
      ],
      "Resource": "arn:aws:iam::<ACCOUNT_ID>:role/<CATENA_EC2_ROLE_NAME>",
      "Condition": {
        "StringEquals": {
          "iam:PassedToService": "ec2.amazonaws.com"
        }
      }
    },
    {
      "Sid": "UseEC2InstanceConnectForCatenaHost",
      "Effect": "Allow",
      "Action": [
        "ec2-instance-connect:SendSSHPublicKey"
      ],
      "Resource": "arn:aws:ec2:<REGION>:<ACCOUNT_ID>:instance/*",
      "Condition": {
        "StringEquals": {
          "ec2:osuser": "ubuntu"
        }
      }
    }
  ]
}
```

This policy is a starting point for the documented single-EC2 deployment. Your organization may need to adjust it based on the exact Terraform configuration, naming conventions, hosted zone setup, and security requirements.

If Terraform reports an access denied error during `terraform plan` or `terraform apply`, review the missing action and update the policy intentionally rather than attaching `AdministratorAccess`.