# Writing a new auth validator

The Catena authentication service leverages pluggable auth validators/providers to verify credentials. Supporting a new platform or authentication mechanism only requires creating a new validator.

An auth validator implements `IAuthValidator` with just a few critical methods and properties:

* `Validate` - Called when performing a login or authentication. This is the main method of the validator.
* `GetRedirectUrl` - A URL to send the player to before performing validation. Only necessary for OAuth, OpenID, or any other two-phase authentication.
* `ProviderType` - The enum value that selects this validator. A new value must be added to the authentication service or `CUSTOM` may be used. 
* `PlatformType` - The enum value that identifies the platform the credential is relevant to. It may be necessary to add a new platform or `CUSTOM` may be used.

The credential or payload to validate is passed into the constructor of the validator.

{% admonition type="info" %}
The provider and platform are separate to permit more than one authentication mechanism per platform such as web-based OAuth login and native platform login for the same platform.
{% /admonition %}

## Single-phase example

This is an example of a single-phase validator, where a player's credentials are handled directly by the validator either because it's passing them through to another system or because it can validate the credentials itself.

```C#
public class ExampleAuthValidator : IAuthValidator
{
    private readonly string _playerCredential;
    private readonly Serilog.ILogger _logger;
    private readonly ValidatorConfig _validatorConfig;

    public ExampleAuthValidator(
        ValidatorConfig config,
        string playerCredential
    )
    {
        _logger = Log.Logger.ForContext<ExampleAuthValidator>();
        _playerCredential = playerCredential;
        _validatorConfig = config;
    }

    public Provider ProviderType => Provider.Example;
    public Platform PlatformType => Platform.Example;

    public async Task<AuthValidatorResponse> Validate(CancellationToken cancellationToken)
    {
        // Ensure the player credential/payload is valid by whatever means necessary (check locally, make HTTP call with credential, etc)
        
        // If validation is unsuccessful, throw AuthFailedException
        
        // Return a response that includes:
        // * the platform-specific account ID which identifies this player to this provider/platform
        // * the platform type (should be the same at the PlatformType property)
        // * optionally a display name (may be empty)
        // * optionally a profile picture URL (may be empty)

        string platformAccountId = "";
        string displayName = "";
        string profilePictureUrl = "";

        return new AuthValidatorResponse(
            platformAccountId,
            PlatformType,
            displayName,
            profilePictureUrl
        );
    }

    public Task<string> GetRedirectUrl(string sessionId, CancellationToken cancellationToken)
    {
        // This indicates no redirect should be performed
        return Task.FromResult("");
    }
}
```


## Two-phase example

This is an example of a two-phase validator, where a player is directed to log in with a 3rd party service and the result of that login is subsequently validated by Catena.

```C#
public class ExampleAuthValidator : IAuthValidator
{
    private readonly string _accessCode;
    private readonly Serilog.ILogger _logger;
    private readonly ValidatorConfig _validatorConfig;
    private readonly HttpClient _httpClient;

    const string AUTH_ENDPOINT = "https://example.com/authorize";

    public ExampleAuthValidator(
        ValidatorConfig config,
        string accessCode,
        HttpClient httpClient
    )
    {
        _logger = Log.Logger.ForContext<ExampleAuthValidator>();
        _accessCode = accessCode;
        _validatorConfig = config;
        _httpClient = httpClient;
    }

    public Provider ProviderType => Provider.Example;
    public Platform PlatformType => Platform.Example;

    private string PlatformRedirectUri =>
        $"{CatenaConfigReader.GetInstance().GetPlatformUrl()}{_validatorConfig.RedirectUri}";

    public async Task<AuthValidatorResponse> Validate(CancellationToken cancellationToken)
    {
        // When this is called the player has already logged in with the 3rd party.
        // The validator received an access code when the player was redirected to Catena which now needs to be validated with the 3rd party.
        // Make an HTTP call or similar to the 3rd party to validate and produce a response if successful.
        
        // If validation is unsuccessful, throw AuthFailedException
                
        // Return a response that includes:
        // * the platform-specific account ID which identifies this player to this provider/platform
        // * the platform type (should be the same at the PlatformType property)
        // * optionally a display name (may be empty)
        // * optionally a profile picture URL (may be empty)

        string platformAccountId = "";
        string displayName = "";
        string profilePictureUrl = "";

        return new AuthValidatorResponse(
            platformAccountId,
            PlatformType,
            displayName,
            profilePictureUrl
        );
    }

    public Task<string> GetRedirectUrl(string sessionId, CancellationToken cancellationToken)
    {
        // A URL to send the player to where they will actually login
        
        // This will often include a parameter for a URL which the player will be redirected back to after logging in.
        // This redirect URL should be Catena (specifically this validator) and include some reference to the session ID.
        return Task.FromResult(
            $"{AUTH_ENDPOINT}?"
                + $"client_id={_validatorConfig.ClientID}&"
                + $"redirect_uri={PlatformRedirectUri}?state={sessionId}"
        );
    }
}
```
