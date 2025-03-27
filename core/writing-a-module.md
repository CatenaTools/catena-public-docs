{% partial file="/_partials/more-modules-info.md" /%}

# Writing a new module or service

The most basic module or service will be a class that has a simple `CatenaModule` attribute. By default, this will be a
transient service which is typical and recommended.

```C#
[CatenaModule]
public class ExampleTransientService
{
    private readonly Serilog.ILogger _logger = Log.Logger.ForContext<ExampleTransientService>();

    public ExampleTransientService()
    {
        _logger.Information("Created new ExampleTransientService instance");
    }
}
```

This service may be selected by adding it to the <tooltip term="services list">services list</tooltip> by name,
ex: `--services SomeOtherService,ExampleTransientService`.

{% admonition type="info" %}
It is recommended that each module or service set up its own logger context using Serilog as shown in the example
above.
{% /admonition %}

{% admonition type="info" %}
Some example modules are available that may be used as templates: `ExampleTransientService`
and `ExampleSingletonService`
{% /admonition %}