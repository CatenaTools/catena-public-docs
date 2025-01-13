# Running From Source on Your Machine

## Installation Instructions
{% tabs %}
    {% tab label="Windows" %}
        {% partial file="/_partials/install-catena/obtain-catena-source.md" /%}

        ### 2. Installing Required Dependencies
        #### .NET 8 SDK
        Catena is built with .NET 8.

        1. Download the installer for the .NET SDK from [this page](https://dotnet.microsoft.com/en-us/download/dotnet/8.0). If you need to determine your computer's architecture (x64, x86, or Arm64) you can:
            1. Click Start
            2. Type “system” in the search box
            3. Click “System Information”
            4. Look at the “System Type” entry in the right pane
        2. Once you have downloaded the SDK Installer, run it.

        ### 3. Run Catena
        1. Open the Windows Command Prompt or Powershell.
        2. Run Catena using the .NET SDK you installed.
        ```bash
        dotnet run ctc --configEnv Development --project catena-tools-core
        ```

        3. Check that Catena is running either by using cURL or by sending a request from this page using the provided interactive API. When using the unsafe provider (`PROVIDER_UNSAFE`), you should receive back an empty body and a `catena-session-id` header.

        #### Use cURL
        {% openapi-code-sample operationId="catena.catena_authentication.CatenaAuthentication_LoginWithProvider" descriptionFile="../apis/catena-tools-core.yaml" /%}

        #### Send Request from This Page
        {% replay-openapi operationId="catena.catena_authentication.CatenaAuthentication_LoginWithProvider" descriptionFile="../apis/catena-tools-core.yaml" /%}
    {% /tab %}

    {% tab label="macOS" %}
        {% partial file="/_partials/coming-soon.md" /%}
    {% /tab %}

    {% tab label="Linux" %}
        {% partial file="/_partials/coming-soon.md" /%}
    {% /tab %}
{% /tabs %}

## What Next?
{% partial file="/_partials/install-catena/what-next.md" /%}