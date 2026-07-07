---
markdown:
  toc:
    depth: 3
---

# Managing API secrets on AWS

When integrating third party APIs or Authentication tools (such as Epic Games auth or Twitch drop integration), you will typically be provided a API key and/or clientID. This key and ID is what your application will use to verify itself against these third party tools.

Anyone with access to that key can impersonate your application and incur unwanted charges or changes against your application. Because of that, we want to make sure this keys stay private to just us developers.

These should never be stored plaintext directly in `appsettings.json`, since that file is committed to your repository and deployed via `git push dokku main` — anything in it is visible to anyone with repo access. 

Catena provides 2 potential solutions for this.
- [Inline Encryption](../features/inline-encryption/index.md) - This allows you to encrypt values in your `appsettings.json` so it can be commited and shared across the team with only one shared password stored offline.
- **Dokku Environment Variables** — Set values as environment variables on your Dokku host, which override the matching `appsettings.json` keys at runtime. Secrets never touch git at all.

## Configuring Dokku Secrets

`catena-tools-core` includes a script to push these values directly onto your Dokku host as environment variables, which override the matching `appsettings.json` keys at runtime — no need to redeploy, and secrets never have to touch git.

1. Create a copy of `dokku-secrets.env.example` called `dokku-secrets.env`. Open the new copy and fill in the config with your real values. 

2. Add `dokku-secrets.env` to your projects `.gitignore` — it should never be committed to a repo.

3. Run:

```bash   
./set-secrets-dokku.sh <your-domain>
``` 
{% admonition type="warning" %}
**Make sure you add dokku-secrets.env to your .gitignore**
{% /admonition %}

using the same domain configured in route_53_record_name. This restarts the app with your secrets applied.

To rotate secrets later, update dokku-secrets.env and re-run the same command — no git push required.

### Adding new secrets
Typically these keys are stored as variables in nested JSON structures in appsettings.json. Dokku allows us to map these to environemnt variables using double underscores formatting (__) in place of each level of nesting — for example:

```json
{ 
"Catena": { 
    "Authentication": { 
        "Validators": { 
            "PROVIDER_DISCORD": { 
                "ClientSecret": "..." 
                } 
            }
            
        } 
    } 
}
```
maps to:
```
Catena__Authentication__Validators__PROVIDER_DISCORD__ClientSecret
```

So Catena will read in the environment variable set there first. Therefore no need to include it in appsettings at all.


### Authenticating with AWS services

For AWS credentials, Catena supports using either static secret keys or you can use the AWS default credential chain (Recommended for EC2 deployments).

AWS provides `AccessKey`/`SecretKey` but if these are left unset during deployment, Catena will fall back on AWS SDKs default credential provider chain. The chain first checks environment variables, config files, container credentials, until finally checking the EC2 attached IAM role and it's permissions.

This is recommended for production environments. It avoids storing long-lived credentials in your configs/environment at all. No need to manually rotate them on expiration either. The instance can access your IAM role directly so you can just grant the needed permissions to that role.

To do this:
1. Leave `AccessKey`/`SecretKey` unset and do not run the `config:set` command.
2. Attach necessary permissions for your AWS features to the IAM role associated with the EC2 instance (`<CATENA_EC2_ROLE_NAME>`) 


#### Using manual AWS Secret Keys

If you would still like to use the manual `SecretKey` and `Accesskey` approach, you can do so by following the instructions for [Configuring Dokku Secrets](./aws-secret-management.md#configuring-dokku-secrets) to add them in.

Catena expects the AWS keys to be filed as these environment variables:

- `Catena__S3Client__AccessKey`

- `Catena__S3Client__SecretKey`

If going this route, make sure you ocassionally rotate your access keys and rerun the `set-dokku-secrets.sh` script after doing so.