---
markdown:
  toc:
    depth: 3
---

# Catena Upgrade Procedure

In the event a new version of Catena is released and needs to be patched or upgraded, the following steps can be followed:  

1. Follow instructions to [manually bmackup Catena data](../installation/aws-backup-management)  
2. Destroy the existing Catena infrastructure  
    In the `infrastructure` repo, under `aws/catena-core-tools`, issue the command:  
        `terraform destory`  
3. Re-deploy the Catena infrastructure following the same deployment steps as [initial setup](../installation/aws-ec2#3.-deploy-catena)
4. Follow instructions to [restore the Catena database backups](../installation/aws-backup-management) from the previous Catena installation  
    Any needed database migrations required by the new Catena installation will be automatically applied at runtime

Note about EC2 host OS upgrades:  
    The EC2 host OS should be kept up-to-date through the standard [AWS System Manager (SSM) automatic update best practices and procedures](https://ubuntu.com/aws/docs/aws-how-to/instances/automatically-update-ubuntu-instances/)  

Note about downtime:  
    For a typical upgrade procedure, it's recommended to plan a maintenance window of about two hours