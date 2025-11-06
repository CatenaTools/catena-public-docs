# Running From Source on Your Machine

## Estimated Time
Starting from scratch, running Catena from source on your machine is estimated to take **<10 minutes**.

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
        1. Open Powershell.
        2. Run Catena using the .NET SDK you installed.
        ```bash
        dotnet run ctc --configEnv Development --project catena-tools-core
        ```

        3. Check that Catena is running either by sending a request from this page using the provided interactive API or by using cURL

        #### Send Request from This Page
        {% replay-openapi operationId="catena.catena_node_inspection.CatenaNodeInspection_NodeIsHealthy" descriptionFile="../apis/catena-tools-core.yaml" /%}

        #### Use cURL
        {% openapi-code-sample operationId="catena.catena_node_inspection.CatenaNodeInspection_NodeIsHealthy" descriptionFile="../apis/catena-tools-core.yaml" /%}
    {% /tab %}

    {% tab label="macOS" %}
        {% partial file="/_partials/install-catena/obtain-catena-source.md" /%}

        ### 2. Installing Required Dependencies
        #### .NET 8 SDK
        Catena is built with .NET 8.

        1. Download the installer for the .NET SDK from [this page](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
            1. If you are running an Apple processor, such as an **M1** or an **M3 Pro**, select Arm64
            2. If you are running an Intel processor, select x64
        2. Once you have downloaded the SDK Installer, run it

        ### 3. Run Catena
        1. Open your Terminal
        2. Update installed workloads
            1. *Note: This only needs to be run once. The next time you run Catena, you can skip to step 3*

        ```bash
        sudo dotnet workload update
        ```

        3. Run Catena using the .NET SDK you installed

        ```bash
        dotnet run ctc --configEnv Development --project catena-tools-core
        ```

        4. Check that Catena is running either by sending a request from this page using the provided interactive API or by using cURL

        #### Send Request from This Page
        {% replay-openapi operationId="catena.catena_node_inspection.CatenaNodeInspection_NodeIsHealthy" descriptionFile="../apis/catena-tools-core.yaml" /%}

        #### Use cURL
        {% openapi-code-sample operationId="catena.catena_node_inspection.CatenaNodeInspection_NodeIsHealthy" descriptionFile="../apis/catena-tools-core.yaml" /%}
    {% /tab %}

    {% tab label="Linux" %}
        {% partial file="/_partials/install-catena/obtain-catena-source.md" /%}

        ### 2. Installing Required Dependencies
        #### .NET 8 SDK
        Catena is built with .NET 8.

        1. Install .NET using your distro package manager or manually download and install. [More information is available from Microsoft](https://learn.microsoft.com/en-us/dotnet/core/install/linux)

        ### 3. Run Catena
        1. Open your terminal

        2. Run Catena using the .NET SDK you installed

        ```bash
        dotnet run ctc --configEnv Development --project catena-tools-core
        ```

        3. Check that Catena is running either by sending a request from this page using the provided interactive API or by using cURL

        #### Send Request from This Page
        {% replay-openapi operationId="catena.catena_node_inspection.CatenaNodeInspection_NodeIsHealthy" descriptionFile="../apis/catena-tools-core.yaml" /%}

        #### Use cURL
        {% openapi-code-sample operationId="catena.catena_node_inspection.CatenaNodeInspection_NodeIsHealthy" descriptionFile="../apis/catena-tools-core.yaml" /%}
    {% /tab %}
{% /tabs %}

## What Next?
{% partial file="/_partials/install-catena/what-next.md" /%}