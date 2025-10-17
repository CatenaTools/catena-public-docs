# Inline config secret encryption

Catena supports encrypting secrets within its configuration ("inline"). This allows easy management of secrets:

* Configuration files with secrets can be kept in version control
* Configuration files can be moved or copied between nodes
* No additional tools or infrastructure are necessary

Any string value may be encrypted and stored inline in the Catena configuration file. Typically, these will be API keys,
database passwords, cluster keys, etc.

## Using inline encryption

To enable encrypting and decrypting secrets, start by placing a master key in a file. The master key can be a password,
a phrase, or random bytes but should be kept on a single line.

{% admonition type="warning" %}
The master key file should never be committed to version control and should be kept absolutely secret. It can be used to
decrypt any other secrets store using inline encryption.
{% /admonition %}

Then, use `catena-cli-tool` to encrypt any strings that must be kept secret in the configuration file. For example:

```shell
catena-cli-tool encrypt-string --keyfile=catena-tools-core/keyfile "<the original secret API key>"

# output: MDo0MUEzOTBERTY2NEQyQkIyRDc5RUVBMDJGRTZFQUI0MDo6OkMzNEEwMkQzMzUzMUYzQTQ3QkJFQUM0NkQzRDUzMzRC
```

Place the output from `catena-cli-tool` inside the configuration in place of the original string. For example, in
`appsettings.Development.json`, there may be a service configuration that takes a secret:

```json
{
  "ServiceConfig": {
    "Secret": "MDo0MUEzOTBERTY2NEQyQkIyRDc5RUVBMDJGRTZFQUI0MDo6OkMzNEEwMkQzMzUzMUYzQTQ3QkJFQUM0NkQzRDUzMzRC"
  }
}
```

Encrypt any other string and place them in the configuration file as well. They must all be encrypted with the same
master key file.

Finally, to allow the Catena node to decrypt this secret (and any others using the same key), make sure it is started
with an option to use the same master key file.

```shell
catena-tools-core --configEnv Development --config-encryption-key-file keyfile
```

{% admonition type="info" %}
When working with independent deployments or environments it may be beneficial to use a separate master key file for
each deployment. This can help protect each deployment's master key file, but it will also prohibit the free movement
of configuration files from one deployment to the other.
{% /admonition %}

### Partial string encryption

Databases like PostgreSQL, Redis, Valkey, etc often have connection strings that contain a password field. Inline
encryption can be used on the entire connection string, however, this renders the configuration less readable.

Instead, Catena contains specific support for decrypting just the password field of connections strings for the
databases it supports.

For Redis and Valkey, any database which is written to use `ConnectionStringAsRedisConnectionString` will have the
password decrypted automatically. This includes any Catena database implementations that use Redis.

For PostgreSQL, any database written to use `IDatabaseAccessor` (or a derivative like
`IDelayedMigrationDatabaseAccessor`), will have the password decrypted automatically. This includes any Catena database
implementations that use PostgreSQL.
