# API Keys

API keys are typically used to authorize services instead of users and exist until they are revoked. An API key is
created with a policy - a set of permissions that are granted to that API key.

## Requiring an API key

A service RPC method can require an API key by utilizing the `AuthRequired` attribute with a set of permissions. When a service RPC
requiring an API key is called, the Catena node will first look at the permissions of this attribute and compare each to
the policy applied to the API key sent with the request. The RPC method will only be called if at least one required
permission is in the policy.

{% admonition type="info" %}
When the `AuthRequired` attribute is used with an empty permission set, then any valid API key will
be accepted regardless of policies or permissions. This can be useful for a test method or simple implementations.
{% /admonition %}

Example requiring _any_ API key:

```C#
[AuthRequired([])]
public override Task<TestApiKeyResponse> TestApiKey(
    TestApiKeyRequest request,
    ServerCallContext context
)
```

Example requiring an API key whose policy includes the `super-secure` permission:

```C#
[AuthRequired(["super-secure"])]
public override Task<SuperSecureThingResponse> SuperSecureThing(
    TestApiKeyRequest request,
    ServerCallContext context
)
```

Example requiring an API key whose policy includes either the `pretty-secure` permission or the `super-secure`
permission (or both):

```C#
[AuthRequired(["pretty-secure", "super-secure"])]
public override Task<SuperSecureThingResponse> SuperSecureThing(
    TestApiKeyRequest request,
    ServerCallContext context
)
```

## Defining a permission

A service may implement a `TrustedServerPermissions` method to return a set of `TrustedServerPermission`s with
descriptions that may be used in `AuthRequired` attributes.

Typically, a service managing API keys, such as the CatenaApiKeysService, will collect all the available permissions
which can then be used to build policies that are applied to API keys.

<!-- TODO: need a section on building policies -->