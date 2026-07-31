# Troubleshooting and Fault Recovery

This page covers common failure modes for an AWS EC2 deployment of Catena, how to diagnose, and how to resolve them.

## Interrupted Deploys

If a `git push dokku main` is interrupted mid-transfer (a cancelled command, a dropped connection), Dokku leaves the app locked to prevent a second deploy from starting concurrently and corrupting the running state. A subsequent push will fail with a message telling you to run `apps:unlock`.

### **Recovery:**
```bash
ssh -i <path-to-your-ssh-key> dokku@<your-domain> apps:unlock <app-name>
ssh -i <path-to-your-ssh-key> dokku@<your-domain> ps:report <app-name>
```
Check `ps:report` to see whether the app is still running the previous, working build or is in a partially-deployed state. Either way, redeploy cleanly and let it complete without interruption this time:
```bash
git push dokku main
```
This rebuilds and restarts the app from your current branch, replacing whatever partial state the interruption left behind.

## App Crash-Looping or Failing to Start

### **Diagnosis:**
```bash
ssh -i <path-to-your-ssh-key> dokku@<your-domain> ps:report <app-name>
ssh -i <path-to-your-ssh-key> dokku@<your-domain> logs <app-name> --num 500
```
Look for an exception or stack trace near the point the app attempts to start. 

Common causes and their fixes:
 
### **Cause:** A required configuration value is missing or empty. 
 A `System.ArgumentException` or similar referencing a null/empty config path is a strong signal here. 

First, confirm what's actually set before assuming a value:
```bash
  ssh -i <path-to-your-ssh-key> dokku@<your-domain> config:show <app-name>
```
  It's also worth confirming the value is actually visible inside the running container, not just recorded in Dokku's config store. A value can be set but might not be picked up by the app yet if it hasn't been restarted since it was set:
```bash
  ssh -t -i <path-to-your-ssh-key> dokku@<your-domain> enter <app-name> web
```
  ### **Recovery:** Set the missing value via your secrets script 
  See [Managing Application Secrets](../installation/aws-secret-management.md) for more details:
```bash
  ./set-dokku-secrets.sh <your-domain>
```
  This restarts the app automatically with the corrected value — no redeploy needed, since environment variables aren't part of the deployed image.

### **Cause:** A configuration key is set via environment variable, but the key path doesn't exactly match what the application expects. 
Nested configuration sections require every level of the path to be present in the environment variable name, including any intermediate segment that isn't obvious from the equivalent `appsettings.json` structure. A value that looks like it should map correctly can silently fail to bind if one segment is missing. The property simply keeps its default (often empty value). 

### **Fix:** Verify the expected config value and update

Validate the value in the actual C# configuration class that drives `appsettings.json`. Confirm the full key path, and correct the environment variable name via your secrets script. (If you can't confirm from `appsettings.json` itself)

It will be a `*config.cs` class that is associated with the service you are having issues with. For example, `Services\CatenaMatchmaking\Config\MatchmakerConfig.cs` associated with matchmaking configurations.

Once resolved and values are set in your env file, run the script:

  ```bash
  ./set-dokku-secrets.sh <your-domain>
  ```
No redeploy needed. This restarts the app with the corrected variable name.

See [Managing Application Secrets](../installation/aws-secret-management.md) for more details

### **Cause:** An `AWS.AccessDenied` or `AmazonServiceException` at startup

### **Recovery:** Update IAM policies
See [Permission and Credential Failures](#permission-and-credential-failures) below for diagnosing and fixing the underlying IAM issue. Once the policy is corrected, restart the app to pick it up. No redeploy needed, since this is an infrastructure-side fix, not a code or config change:
  ```bash
  ssh -i <path-to-your-ssh-key> dokku@<your-domain> ps:restart <app-name>
  ```

**In general:** a fix that changes IAM policy, security groups, or other AWS-side infrastructure only requires a restart. A fix that changes application code or `appsettings.json` requires a commit and redeploy (`git push dokku main`). A fix that only changes an environment variable's value can be applied via the secrets script alone, with no redeploy.

## SSH Connection Dropped Mid-Provisioning

During `terraform apply`, the `remote-exec` provisioner (which SSHes into a freshly-launched instance to run setup steps) can fail with:
```
Error: remote-exec provisioner error
error executing "/tmp/terraform_<id>.sh": wait: remote command exited without exit status or exit signal
```
This means the SSH session was cut off before the script finished, it doesn't necessarily mean that the script itself failed.

### **Diagnosis:** Debug your deployment machine and EC2 machine
Check your deployment machines sleep settings. Deployment here could take upwards of 20-30 min. Make sure your machine doesn't go to sleep in that time period or this deployment will fail.
 
If your machine isn't causing the issue, you can debug the remote machine. 
1. View your [AWS EC2 instances](https://us-east-1.console.aws.amazon.com/ec2/home)
2. Find the Catena instance and Connect via Session Manager. 
3. Once in, check whether the pushed script is still present:
```bash
ls -la /tmp/terraform_*.sh
```
If it exists, run it directly to see the real failure without Terraform's SSH session as an intermediary:
```bash
sudo bash /tmp/terraform_<id>.sh
```
Also check whether the instance rebooted unexpectedly during setup (a common cause of a dropped session e.g. if the install process restarts networking):
```bash
uptime
```

### **Recovery:** 
If the manual run surfaces the actual error (out-of-memory, a package install failure, a networking restart mid-script), address that specific cause. For an undersized instance, increase `catena_ec2_instance_size` in `vars.tfvars` before reapplying. For a transient issue, simply re-running `terraform apply` (which re-triggers the provisioner) is often sufficient, since a dropped connection doesn't necessarily indicate a repeatable failure:
```bash
terraform apply -var-file="vars.tfvars"
```
If the instance is in a partially-provisioned state and reapplying doesn't cleanly recover it, taint the resource to force a clean recreation:
```bash
terraform taint module.ec2.null_resource.setup_catena
terraform apply -var-file="vars.tfvars"
```

## Instance or Infrastructure Failure

If the EC2 instance itself is unresponsive (health check failing, SSH/Session Manager unreachable):

### **Diagnosis:** Check EC2 status
```bash
aws ec2 describe-instances --instance-ids <your-instance-id> --profile <your-deploy-profile> --query "Reservations[].Instances[].State"
```
Confirm the instance is actually `running`. Check for drift between Terraform's state and the real infrastructure:
```bash
terraform plan -var-file="vars.tfvars"
```
A plan showing unexpected changes (especially destroy/recreate on resources you didn't touch) indicates the instance was modified manually or by something outside Terraform's awareness.

### **Recovery:** Reboot or Re-deploy
if the instance is unresponsive but Terraform sees no drift, a reboot via the AWS console or CLI is the least disruptive first step:
```bash
aws ec2 reboot-instances --instance-ids <your-instance-id> --profile <your-profile>
```
If that doesn't resolve it, or the instance is genuinely unrecoverable, `terraform apply` will recreate it from the existing configuration:
```bash
terraform apply -var-file="vars.tfvars"
```
Be aware this replaces the SQLite database on the root volume — see Backup and Recovery documentation before doing this on any deployment holding real data. After recreation, you'll also need to redeploy the app itself and re-set application secrets, since neither is tracked by Terraform state:
```bash
ssh-keygen -R <your-domain>
git push dokku main
./set-dokku-secrets.sh <your-domain>
```

## State Save Failures During Apply or Destroy

Occasionally `terraform apply` or `terraform destroy` will fail partway through with something like:
```
Error: Failed to save state
Error saving state: failed to upload state: operation error S3: PutObject, https response error
StatusCode: 0, RequestID: , HostID: , request send failed, Put
"https://catena-terraform-state.s3.us-east-1.amazonaws.com/...": dial tcp: lookup catena-terraform-state.s3.us-east-1.amazonaws.com: no such host
```
This is a DNS resolution failure — Terraform couldn't reach S3 at all to persist its state, typically due to a transient network issue, a VPN or corporate DNS interfering with resolution, or a brief AWS-side disruption. This is distinct from an `AccessDenied` error (see [Permission and Credential Failures](#permission-and-credential-failures) below): here, Terraform never got far enough to even attempt authorization.

**The immediate risk:** if the underlying `apply`/`destroy` operation itself succeeded or partially succeeded against AWS, but the state save failed, Terraform's local understanding of your infrastructure is now out of sync with what's actually deployed. Terraform handles this by writing the current state to a local `errored.tfstate` file and telling you to push it back manually. **Do NOT ignore this message or delete the file**, since it may be the only record of changes that already happened in AWS but were never recorded in the real state backend.

### **Diagnosis:** confirm basic connectivity to S3 before assuming anything is broken on the AWS side:
```bash
nslookup catena-terraform-state.s3.us-east-1.amazonaws.com
```
If this fails to resolve, the problem is local network/DNS, not AWS or your credentials — check VPN status, try a different network, or wait and retry, since this class of failure is usually transient.

### **Recovery:** Push the locally-saved error state back to the real backend:
once connectivity is confirmed working again, push the locally-saved error state back to the real backend, exactly as Terraform's own error message instructs:
```bash
terraform state push errored.tfstate
```
This reconciles the backend with whatever Terraform's local process actually knew at the moment of failure. After it succeeds, run a plan to confirm state and reality now agree before making any further changes:
```bash
terraform plan -var-file="vars.tfvars"
```
A clean plan (no unexpected changes) confirms the push fully resolved the drift. If the plan still shows unexpected differences, treat it the same as **Instance or Infrastructure Failure** below — verify the real state of resources in the AWS console directly rather than trusting either local state blindly.

## Permission and Credential Failures

An `AccessDenied` error, whether from Terraform during `plan`/`apply`, or from the running application in its logs, always follows the same shape:
```
User: arn:aws:iam::<account>:<user-or-role> is not authorized to perform: <action> on resource: <resource> because no identity-based policy allows the <action> action
```

### **Diagnosis:** Confirm expected principal/action involved and update policy.
The error tells you exactly which principal, action, and resource are involved.

Confirm what's currently attached to that principal:
```bash
aws iam list-attached-user-policies --user-name <user> --profile <profile>
aws iam list-attached-role-policies --role-name <role> --profile <profile>
```
Then inspect the specific policy for the missing action:
```bash
aws iam get-policy-version --policy-arn <policy-arn> --version-id <version> --profile <profile>
```

### **Recovery:** Update the IAM policy with the requested permission/resource
Naivagate to the AWS web page and go to `IAM` -> `Policies`. 

Find `CatenaDeploymentPolicy`, add the missing action to the relevant statement, scoped to the specific resource named in the error. 

Do not widen resource to `"Resource": "*"` unless the action genuinely doesn't support resource-level scoping (as is the case for most GameLift actions).

Retry the original `terraform apply`, `plan`, or application action that triggered the error.

## Matchmaking Ticket Failures

A ticket that never leaves `SEARCHING` has typically exceeded its `request_timeout_seconds` without finding a match, and will move to `TIMED_OUT`. This is expected behavior when there aren't enough compatible players — the documented recovery is resubmission, not a permission or configuration problem.

### **Diagnosis:** Check status of current matchmaking configs
```bash
aws gamelift describe-matchmaking --ticket-ids <ticket-id> --profile <profile> --region <region>
```
Check the `Status` and `StatusMessage` fields directly rather than relying solely on what the application surfaces, since an underlying `AccessDeniedException` from GameLift can sometimes be caught and re-presented by the application as a more generic failure (such as "queue does not exist") rather than propagated as-is.

### **Recovery, if tickets fail immediately rather than timing out normally:** 
Confirm the runtime role or user has all four required GameLift actions (`StartMatchmaking`, `StopMatchmaking`, `DescribeMatchmaking`, `DescribeMatchmakingConfigurations`) and that the SQS notification queue permissions (`ReceiveMessage`, `DeleteMessage`, `GetQueueAttributes`) are present. See [Setting Up AWS FlexMatch](../features/matchmaking/aws-flex-match.md) and [Permission and Credential Failures](#permission-and-credential-failures) above for the expected values here. Once corrected, no redeploy or restart is needed, IAM changes take effect on the next API call.

**Confirming the notification pipeline is working**, independent of the application's own logs:
```bash
aws sqs get-queue-attributes --queue-url <your_sqs_queue_url> --attribute-names ApproximateNumberOfMessages ApproximateNumberOfMessagesNotVisible --profile <profile>
```
A message stuck in the queue (nonzero count that doesn't drain over time) points at a problem reading from SQS specifically, distinct from the GameLift-side matchmaking calls. Check the application's logs for an `AccessDenied` on `sqs:ReceiveMessage` at the time a match completes.


## References: Where to look and What to Run
 
The scenarios above cover specific failures. This section is a general-purpose reference for direct debugging, independent of any particular error.

### Finding Things in the AWS Console
 
| What you need | Where to find it |
|---|---|
| Instance state, public IP, instance ID | [EC2 → Instances](https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1#Instances:) |
| A shell on the instance, without SSH | Select the instance → **Connect** → **Session Manager** tab → **Connect** |
| IAM role/user policies | [IAM → Roles](https://us-east-1.console.aws.amazon.com/iamv2/home#/roles) or [IAM → Users](https://us-east-1.console.aws.amazon.com/iam/home#/users) → select the role/user → **Permissions** tab |
| A role's trust policy | IAM → Roles → select the role → **Trust relationships** tab |
| DNS records | [Route53 → Hosted zones](https://us-east-1.console.aws.amazon.com/route53/v2/hostedzones) → select your zone |
| Matchmaking configurations and rule sets | [GameLift → Matchmaking configurations](https://us-east-1.console.aws.amazon.com/gamelift/home?region=us-east-1#/r/matchmaking/configurations) |
| SQS queue contents/attributes | [SQS → Queues](https://us-east-1.console.aws.amazon.com/sqs/v2/home?region=us-east-1#/queues) → select your queue |
| Current quota usage and limits | [Service Quotas](https://us-east-1.console.aws.amazon.com/servicequotas/home) → select the relevant service |
| Terraform state file (raw) | [S3 → your state bucket](https://s3.console.aws.amazon.com/s3/home?region=us-east-1) → browse to the workspace/module path |
 
### Where Things Are Defined for deployment
 
The table above is for finding a resource's *current, live* state in the console. This table below is for finding where that resource is *defined* in Terraform during deployment. These are the value you need to know if you want to actually make lasting changes to the infrastructure.
 
| Concept | Defined in code |
|---|---|
| EC2 instance (size, AMI, root volume) | `aws/catena-core/ec2/main.tf` |
| EC2 runtime IAM role (SSM, FlexMatch permissions) | `aws/catena-core/iam/main.tf` |
| EC2 runtime role's trust policy | `aws/catena-core/iam/main.tf`, the `assume_role_policy` block |
| Deploy-time user policy (`CatenaDeploymentPolicy`) | Not managed by Terraform — created and edited manually in the console per [the AWS EC2 guide](../installation/aws-ec2.md) |
| VPC, subnet, internet gateway, route table | `aws/catena-core/network/` (or the equivalent path under `aws/ec2-gameserver/`) |
| Security group / open ports | `aws/catena-core/network/security_groups/main.tf` |
| Elastic IP | `aws/catena-core/main.tf`, the `eip` module |
| Route53 domain / DNS records | `aws/catena-core/dns/main.tf` |
| SQS notification queue | `aws/flex-match/main.tf`, `aws_sqs_queue.notifications_queue` |
| SNS notification topic | `aws/flex-match/main.tf`, `aws_sns_topic.catena_flex_match_sns` |
| GameLift matchmaking configurations / rule sets | `aws/flex-match/main.tf`, `awscc_gamelift_matchmaking_configuration` / `_rule_set` |
| FlexMatch runtime policy | `aws/flex-match/main.tf`, `aws_iam_policy.catena_flexmatch_runtime_policy` |
| Backup S3 bucket | `aws/catena-core/main.tf` (or wherever the backup bucket resource is defined) |
| Terraform state bucket itself | Not managed by this Terraform config — created once, manually, as a prerequisite |
| SSH keypair | `aws/catena-core/ec2/main.tf`, `ssh_public_key_path` / `ssh_private_key_path` variables |
| IMDSv2 enforcement | `aws/catena-core/ec2/main.tf`, the `metadata_options` block |
| Which Terraform workspace maps to which resource names | `aws/catena-core/main.tf` (and equivalent in `flex-match`/`ec2-gameserver`), the `workspace_prepend` local |

If you edit any of the files, you will need to run `terraform apply --var-file="vars.tfvars"` to apply the changes

## Helpful commands and tools

Here are some helpful processes to get you insight on your current deployment for debugging.

### Accessing the Instance Directly
 
**Session Manager** (no SSH key needed, works even if SSH itself is broken):

Go to AWS and access via the [AWS Console](https://us-east-1.console.aws.amazon.com/console/home?region=us-east-1#)

Via the console, `EC2` → `<your instance>` → `Connect` → `Session Manager tab` → `Connect`
 
**SSH via Dokku's restricted user** (runs a single Dokku command, does not give a shell) Lets you run comands as the dokku instance:
```bash
ssh -i <your-key> dokku@<your-domain> <dokku-command>
```
 
**A shell inside the running app's container**:

Goin one deeper, actually connecting the the running app container. Opens a shell to run commands directly.
```bash
ssh -t -i <your-key> dokku@<your-domain> enter <app-name> web
```
 
### Common Commands From Your Machine

Examples of some commands to run from your machine for debugging or common gotchas.
 
**App status and health:**

Prints a report on the app status and health
```bash
ssh -i <your-key> dokku@<your-domain> ps:report <app-name>
```
 
**Logs — recent history:**

This will print the recent logs in the shell, 500 lines worth
```bash
ssh -i <your-key> dokku@<your-domain> logs <app-name> --num 500
```
 
**Logs — live tail:**

Starts showing the live tail of logs from the active instance
```bash
ssh -i <your-key> dokku@<your-domain> logs <app-name> --tail
```
 
**Logs — save to a local file for searching:**

Save the logs to a local file called `catena-logs.txt`. Good for text search
```bash
ssh -i <your-key> dokku@<your-domain> logs <app-name> --num 5000 > catena-logs.txt
```
 
**All environment variables currently set:**

Prints all environment variables currently set on the machine.
```bash
ssh -i <your-key> dokku@<your-domain> config:show <app-name>
```
 
**A single environment variable:**

Print a specific environment variable
```bash
ssh -i <your-key> dokku@<your-domain> config:get <app-name> <KEY_NAME>
```
 
**Restart the app** 

picks up new environment variables or IAM changes; **does not** redeploy code.
```bash
ssh -i <your-key> dokku@<your-domain> ps:restart <app-name>
```


**Clear a stale SSH host key** — needed any time an instance is recreated (`terraform destroy` + `apply`, or a `terraform apply` that replaces the instance). 

The new instance has a different underlying SSH host key even if the domain stays the same, and your local machine will refuse to connect with a `REMOTE HOST IDENTIFICATION HAS CHANGED` warning until the stale entry is cleared:

```bash
ssh-keygen -R <your-domain>
```
 This removes the cached entry for that hostname from your local ~/.ssh/known_hosts file. On a new deployment the new isntance generates a brand new SSH host key at boot but keeps the domain the same. So domain and key are legitimate but it doesnt match the _old_ key our machine knew. Your machine will cache the new version after clearing the old values.

**Domain and TLS configuration:**
```bash
ssh -i <your-key> dokku@<your-domain> domains:report <app-name>
```
 
**Confirm which AWS identity a command is running as:**
```bash
aws sts get-caller-identity --profile <profile>
```
 
**Confirm Terraform's state matches real infrastructure:**

Validate infrastructure hasn't drifted from whats deployed.
```bash
terraform plan -var-file="vars.tfvars"
```

# Backup and Recovering Catena

This guide walks through backing up, tearing down and rebuilding a Catena deployment, restoring your data from an existing backup afterward. Assuming some fault or error state that occured. 

## 1. Create or Confirm You Have a Backup

Before tearing anything down, confirm or create a backup. See [Backup and Recovery](../installation/aws-backup-management.md) for how backups are created and managed (manual `sqlite3 .backup`, or automatic EBS snapshots).

## 2. Tear Down the Existing Deployment

```bash
cd aws/catena-core
terraform destroy -var-file="vars.tfvars"
```

## 3. Redeploy

```bash
terraform apply -var-file="vars.tfvars"
```

Follow the standard post-deploy steps:
```bash
ssh-keygen -R <your-domain>
git push dokku main
./set-dokku-secrets.sh <your-domain>
```

## 4. Restore Your Backup

Follow the restore steps for whichever backup method you used — see [Backup and Recovery](../installation/aws-backup-management.md):

- **Manual backup**: restore the SQLite database file to the new instance.
- **EBS snapshot**: attach the snapshot as the instance's data volume.

## 5. Confirm Recovery

Restart the app and confirm it starts cleanly with the restored data:
```bash
ssh -i <your-key> dokku@<your-domain> ps:restart <app-name>
ssh -i <your-key> dokku@<your-domain> ps:report <app-name>
```

## Support

Catena does not currently offer set technical support tiers or standard Service Level Agreements (SLAs). Support, response times, and any associated terms are arranged on a per-contract basis.

To request support, contact [it@wolfjawstudios.com](mailto:it@wolfjawstudios.com).