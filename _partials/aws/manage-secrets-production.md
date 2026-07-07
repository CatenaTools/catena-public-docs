For a live production deployment, you don't want to expose your secrets in the appsettings file. 

Catena provides 2 potential solutions for this.
- [Inline Encryption](../../features/inline-encryption/index.md) - This allows you to encrypt values in your `appsettings.json` so it can be commited and shared across the team with only one shared password stored offline.
- [Configuring Dokku Secrets](../../installation/aws-secret-management.md) - Using dokku, setup environment variables that are read in by the app

When using Dokku secrets, you can map the nested JSON values to a new environment variable. 

For example, ClientID maps too:

```
{% $json_path %}__ClientID
```

Then Client Secret maps too:

```
{% $json_path %}__ClientSecret
```

If deploying via the [AWS deployment guide](../../installation/aws-ec2.md), add these to your `dokku-secrets.env` file and run `./set-dokku-secrets.sh`. For more details and instructions on how to rotate secrets, view the [Secrets management page](../../installation/aws-secret-management.md). 