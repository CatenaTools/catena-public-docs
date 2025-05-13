# Running With Docker on Your Machine

## Estimated Time
Starting from scratch, running Catena on your machine using Docker is estimated to take **10-20 minutes**.

## What Is Docker?
Docker is a tool used to create, deploy, and run applications using containers. Containers are similar to virtual machines, but they don’t create an entire virtual operating system. Once an application is built and packaged into a container alongside its dependencies, it can be run quickly and reliably from different computing environments. For more information about Docker and containers, you can refer to [this piece of documentation from Docker](https://docs.docker.com/get-started/docker-overview/).

## Installation Instructions
{% tabs %}
    {% tab label="Windows" %}
        {% partial file="/_partials/install-catena/obtain-catena-source.md" /%}

        ### 2. Install WSL
        There are two options for running with Docker: with Docker Desktop, or by using Docker Engine directly. Both options will require you to install WSL on your machine.

        {% partial file="/_partials/install-catena/install-wsl.md" /%}

        ### 3. Install Docker
        #### Using Docker Desktop
        [Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/) is the easiest way to install Docker onto a Windows machine, though it requires a paid license for commercial use. If you prefer to register for a license, follow the instructions below. Otherwise, skip to [Using Docker Engine Directly](./docker.md#using-docker-engine-directly).

        1. [Download Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/)
        2. Begin installation
            - Ensure you select **Use WSL 2 instead of Hyper-V**
        3. Once complete, [start Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/#start-docker-desktop)
        4. From Powershell, check that Docker is working correctly:
        {% code-snippet file="/_partials/install-catena/validate-docker-installation.md" title="validate-docker-installation" language="bash" /%}
        5. Proceed To [Run Catena](./docker.md#4.-run-catena)

        #### Using Docker Engine Directly
        1. Open the **Ubuntu-24.04** application, or whichever distro you chose when installing WSL
        2. Install Docker Engine using the `apt` repository [using these instructions](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository)
        3. Install Docker Compose [using these instructions](https://docs.docker.com/compose/install/linux/#install-using-the-repository)
        4. If you have not already, verify that Docker is working correctly
        {% code-snippet file="/_partials/install-catena/validate-docker-installation.md" title="validate-docker-installation" language="bash" /%}
        {% admonition type="warning" name="Troubleshooting" %}
            If either Docker or Docker Compose do not appear to be installed correctly, restart WSL, remove the packages, and go back to step 2.

            ```bash
            sudo apt-get remove docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            ```
        {% /admonition %}

        5. Add your user to the docker group

        ```bash
        sudo usermod -aG docker $USER
        ```

        6. Tell Docker Engine you are not using Docker Desktop by replacing the automatically defined credential helper with empty JSON in Docker's config.

        ```bash
        echo '{}' | sudo tee ~/.docker/config.json
        ```

        7. Proceed To [Run Catena](./docker.md#4.-run-catena)

        ### 4. Run Catena
        1. Depending on how you installed Docker, use the corresponding command prompt to navigate to the root directory of the Catena Project:
            - **Docker Desktop:** Powershell
            - **Docker Engine:** WSL
                {% admonition type="info" %}
                To navigate to a drive from WSL, such as your `C:\` drive, you will need to `cd /mnt/c/<YOUR_INSTALLATION_DIRECTORY>`
                {% /admonition %}
        2. Use Docker Compose to run the project (this may take a while)

        ```bash
        docker compose up
        ```

        3. Check that Catena is running either by sending a request from this page using the provided interactive API, or by using cURL.

        #### Send Request From This Page
        {% replay-openapi operationId="catena.catena_node_inspection.CatenaNodeInspection_NodeIsHealthy" descriptionFile="../apis/catena-tools-core.yaml" /%}

        #### Use cURL
        {% openapi-code-sample operationId="catena.catena_node_inspection.CatenaNodeInspection_NodeIsHealthy" descriptionFile="../apis/catena-tools-core.yaml" /%}
    {% /tab %}

    {% tab label="macOS" %}
        {% partial file="/_partials/install-catena/obtain-catena-source.md" /%}

        ### 2. Install Docker
        There are two options for running with Docker, with Docker Desktop or by using Docker Engine directly.

        #### Using Docker Desktop
        [Docker Desktop](https://docs.docker.com/desktop/setup/install/mac-install/) is the easiest way to install Docker onto macOS, though it requires a paid license for commercial use. If you prefer to register for a license, follow the following instructions. Otherwise, skip to [Using Docker Engine Directly](./docker.md#using-docker-engine-directly-1).

        1. [Download Docker Desktop](https://docs.docker.com/desktop/setup/install/mac-install/)
        2. Install Docker
        3. Launch the Docker Application to finish setting up Docker Desktop
        4. Proceed to [Run Catena](./docker.md#3.-run-catena)

        #### Using Docker Engine Directly
        The underlying Docker Engine that Docker Desktop provides is under the Apache License and is free to use. If you prefer to use Docker for free, you can install Docker Engine directly and run Catena using the following steps.

        1. Install [Homebrew](https://brew.sh), a package manager for macOS

        ```bash
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        ```

        2. Install the Docker CLI and [Docker Compose](https://formulae.brew.sh/formula/docker-compose), which will allow for us to run multiple Docker containers at the same time with a single command

        ```bash
        brew install docker
        brew install docker-compose
        ```

        3. Install and start [Colima](https://github.com/abiosoft/colima), a lightweight virtual machine that will run the Docker daemon

        ```bash
        brew install colima
        colima start

        # Ensure colima is always running, even after restarting your machine
        brew services start colima
        ```

        4. Restart your Terminal
        5. Check that Docker is working correctly

        ```bash
        docker run hello-world
        # Expected output should include:
        # Hello from Docker!
        # This message shows that your installation appears to be working correctly.

        docker-compose version
        # Expected output should include something similar to:
        # Docker Compose version v2.32.1
        ```

        6. Proceed to [Run Catena](./docker.md#3.-run-catena)

        ### 3. Run Catena

        1. Open your Terminal
        2. Navigate to the root directory of the Catena Project
        3. Use Docker Compose to run the project (this may take a while)

        ```bash
        docker-compose up
        ```

        4. Check that Catena is running either by sending a request from this page using the provided interactive API or by using cURL

        #### Send Request from This Page
        {% replay-openapi operationId="catena.catena_node_inspection.CatenaNodeInspection_NodeIsHealthy" descriptionFile="../apis/catena-tools-core.yaml" /%}

        #### Use cURL
        {% openapi-code-sample operationId="catena.catena_node_inspection.CatenaNodeInspection_NodeIsHealthy" descriptionFile="../apis/catena-tools-core.yaml" /%}
    {% /tab %}


    {% tab label="Linux" %}
        {% partial file="/_partials/coming-soon.md" /%}
    {% /tab %}
{% /tabs %}

## What Does Docker Compose Run?
By default, running Docker Compose from Catena’s root directory will run a few different containers:

- `catena-tools-core`
    
    This is the Catena backend. The base `docker-compose.yaml` file will run with an assortment of Catena plugins enabled.
- `kafka`

    One configuration of Catena will use [Apache Kafka](https://kafka.apache.org/) to send messages between services. This is not a requirement to run Catena, but we run it alongside Catena in case you decide to use it.
- `init-kafka`

    Kafka requires “topics” to be created in order to send messages. The `init-kafka` container handles creating these topics before Catena is started.
- `redis`

    Catena uses [Redis](https://redis.io/) for ephemeral storage, such as a session store. This is not a requirement to run Catena, but we run it alongside Catena in case you decide to use it.

## What Next?
{% partial file="/_partials/install-catena/what-next.md" /%}