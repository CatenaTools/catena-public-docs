# API Keys

API keys are typically used to authorize services rather than users. Each API key is
created with a [policy](#policies), which grants a set of permissions to services using the key.

For information on the RPCs for the API key service, see [API Keys](../../core/auth/api-keys.md).

## Create an API key

Creating a new API key may be done in the admin dashboard or by calling `AdminCreateApiKey`. A new API key needs a unique name and a single policy. Assigning a policy an API key grants the key all of the permissions associated with that policy.

{% admonition type="info" %}
In order to create an API key, at least one policy must be available (see [Creating a policy](#creating-a-policy)).
{% /admonition %}

Policies are associated with keys via unique IDs. When creating an API key in the dashboard, a dropdown list of the currently available policies will be displayed. This list can also be obtained by calling `AdminGetApiKeyPolicies`.

## Update or delete API keys

API keys can be updated and deleted from the admin dashboard, or by calling `AdminUpdateApiKey`/`AdminDeleteApiKey`.

{% admonition type="warning" %}
When you change the policy associated with an API key, the permissions granted to that key will change. When you delete an API key, all services currently using that key will lose API access. These changes will go into effect immediately.
{% /admonition %}

## Policies

Policies to API keys is a one-to-many relationship. 

### Permissions

Typically, a service managing API keys, such as the `CatenaApiKeysService`, will collect all the available permissions,
which can then be used to build policies that are applied to API keys.

### Creating a policy

<!-- TODO -->