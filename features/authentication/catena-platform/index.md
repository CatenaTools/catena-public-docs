# Managing Catena standalone authentication

Some Catena standalone or authoritative authentication mechanisms such as [device](../device.md) and [email/signup](../email_sign_up.md) require some additional management and configuration.

## Email/signup

Players will only be able to sign up for an account using an email address when `CatenaPlatformAuthService` is enabled and email sign up is configured and enabled.

{% admonition type="warning" %}
The `ConnectionString` used by the Catena platform auth service for email sign up must match the `ConnectionString` used by the [EMAIL_SIGN_UP auth validator](../email_sign_up.md).
{% /admonition %}

```json
{
  "Catena": {
    "PlatformAuth": {
      "AllowEmailSignUp": true,
      "Email": {
        "Host": "mail.local",
        "FromAddress": "noreply@mail.local"
      },
      "EmailSignUp": {
        "ConnectionString": "Data Source=Build/SqliteDatabase/email_sign_up.db;Foreign Keys=True"
      }
    }
  }
}
```

## Device

{% admonition type="warning" %}
The `ConnectionString` used by the Catena platform auth service for devices must match the `ConnectionString` used by the [DEVICE auth validator](../device.md).
{% /admonition %}

```json
{
  "Catena": {
    "PlatformAuth": {
      "Devices": {
        "ConnectionString": "Data Source=Build/SqliteDatabase/devices.db;Foreign Keys=True"
      }
    }
  }
}
```