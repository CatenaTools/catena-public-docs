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
| `<CATENA_EC2_ROLE_NAME>`             | `catena-ec2-role`            | IAM role name Terraform creates or uses for the Catena EC2 instance. following the pattern `<workspace_prepend>catena-ec2-role`. For a standard deployment using Terraform's default workspace, this value will be `catena-ec2-role.`    |
| `<CATENA_EC2_INSTANCE_PROFILE_NAME>` | `catena-ec2-instance-profile` | IAM instance profile name Terraform creates or uses for the Catena EC2 instance |

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "TerraformStateBucketManagement",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::<TERRAFORM_STATE_BUCKET>",
        "arn:aws:s3:::<TERRAFORM_STATE_BUCKET>/<TERRAFORM_STATE_KEY>",
        "arn:aws:s3:::<TERRAFORM_STATE_BUCKET>/<TERRAFORM_STATE_KEY>.tflock"
      ]
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
        "route53:ListTagsForResource",   
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
        "iam:ListAttachedRolePolicies",
        "iam:ListInstanceProfilesForRole",
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
      "Sid": "AttachOnlyCatenaManagedPolicies",
      "Effect": "Allow",
      "Action": [
        "iam:AttachRolePolicy", 
        "iam:DetachRolePolicy"
        ],
      "Resource": "arn:aws:iam::<ACCOUNT_ID>:role/*catena-ec2-role*",
      "Condition": {
        "ArnLike": {
          "iam:PolicyARN": [
        "arn:aws:iam::<ACCOUNT_ID>:policy/*catena*",
        "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
        ]
        }
      }
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
    },
    {
      "Sid": "ManageCatenaBackupBucket",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:GetBucketLocation",
        "s3:GetBucketVersioning",
        "s3:PutBucketVersioning",
        "s3:GetBucketPolicy",
        "s3:PutBucketPolicy",
        "s3:DeleteBucketPolicy",
        "s3:GetBucketTagging",
        "s3:PutBucketTagging",
        "s3:GetBucketPublicAccessBlock",
        "s3:PutBucketPublicAccessBlock",
        "s3:GetLifecycleConfiguration",
        "s3:PutLifecycleConfiguration",
        "s3:GetEncryptionConfiguration",
        "s3:PutEncryptionConfiguration"
      ],
      "Resource": "arn:aws:s3:::catena-backup"
    },
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
        "arn:aws:iam::<ACCOUNT_ID>:policy/*catena-backup-policy"
      ]
    },
    {
      "Sid": "CatenaBackupBucketManagement",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:DeleteBucket",
        "s3:GetBucketPolicy",
        "s3:GetBucketAcl",
        "s3:GetBucketCORS",
        "s3:GetBucketWebsite",
        "s3:GetBucketVersioning",
        "s3:GetAccelerateConfiguration",
        "s3:GetBucketRequestPayment",
        "s3:GetBucketLogging",
        "s3:GetLifecycleConfiguration",
        "s3:GetReplicationConfiguration",
        "s3:GetEncryptionConfiguration",
        "s3:GetBucketObjectLockConfiguration",
        "s3:GetBucketTagging"
      ],
      "Resource": "arn:aws:s3:::*-catena-backup"
    }
  ]
}
```

This policy is a starting point for the documented single-EC2 deployment. Your organization may need to adjust it based on the exact Terraform configuration, naming conventions, hosted zone setup, and security requirements.

Here is a table breaking down all the Sids used in the starting point deployment policy above:
| SID                          | Description                                                                     |
|--------------------------------------|---------------------------------------------------------------------------------|
| `TerraformStateBucketList`/ `TerraformStateObjectAccess`/ `TerraformStateLockAccess `   | Lets Terraform read/write its own state file and lock in S3
| `ManageCatenaEC2VpcAndNetworkResources ` | Create the VPC, subnets, gateway, routing, security group
| `ManageCatenaEC2InstanceAndAddressResources `  | Create/manage the EC2 instance and its Elastic IP  
| `ManageCatenaRoute53Records` | Point your domain at the new instance             |
| `ManageCatenaEc2IamRoleAndInstanceProfile `   | Create the second IAM role below 
| `ManageCatenaPolicies `   | 		Create, read, version, tag, and delete the runtime IAM policy for backup  | 
| `PassOnlyCatenaEc2Role `             | Lets Terraform hand that role to EC2 — scoped so it can't pass any other role
| `UseEC2InstanceConnectForCatenaHost ` | Lets you SSH in via EC2 Instance Connect later 
| `AttachOnlyCatenaManagedPolicies` | Lets terraform attach/detach policies to the EC2 instance role, but restricted to only Catena-managed policies and the specific AWS managed policy
| `ManageCatenaBackupBucket` | Create and configure the S3 bucket used for database backups (Versioning, lifecycle policy, encryption, public access)
| `ManageCatenaBackupBucketObjects` | Read, Write, delete, and list objects within the backup bucket


If Terraform reports an access denied error during `terraform plan` or `terraform apply`, review the missing action and update the policy intentionally rather than attaching `AdministratorAccess`.