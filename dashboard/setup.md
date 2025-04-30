# Dashboard

The Catena admin dashboard is a [React](https://react.dev/reference/react) application that is intended to run at the same address as the `catena-tools-core` backend.

## Running the dashboard

There are four states the dashboard can run in:

1. Hosted by `catena-tools-core`
    - allows running the dashboard locally with "one command"
    - for using the dashboard to interface with Catena during development
2. Hosted by `catena-tools-core` and proxied to Vite
    - allows running the dashboard locally with "hot reload"
    - ideal for dashboard development (`npm run dev`) and testing
3. Proxied with [Caddy](https://caddyserver.com/docs/)
    - an alternative to option 2
    - (may eventually be deprecated)
4. Running on its own, served by a production-grade webserver

This page provides step-by-step guides to the four workflows.

## Dependencies

In order to compile and develop the dashboard, the following dependencies are required:

- Node.js
- npm

For all of the following workflows, the dashboard should be compiled using the following steps:

```bash
cd dashboard/
npm install
npm run build
```

Alternatively, you can use the Make target `build-dashboard` to build the dashboard:

```bash
make build-dashboard
```

After this, any of the following workflows will work.

## Workflows

### Development
#### 1. Built and hosted by catena-tools-core

This workflow utilizes the `CatenaDevelopmentDashboardService` to support running the dashboard locally. It requires that the dashboard has been compiled to work and that the compiled files are in `catena-tools-core/dashboard/dist`.

This is how the dashboard runs in the Docker image, and is ideal for simple, local testing & running in Dokku. It is also the simplest way to use the dashboard when working on backend-only features.

{% admonition type="warning" %}
This approach should not be used in workflows where high request volume is expected, or in production.
{% /admonition %}

##### How to use this workflow

- Follow the build steps above to build the dashboard: `make build-dashboard`
- Ensure the Catena Development Dashboard Service is enabled in appsettings (or `all` services are enabled):

```bash
{
  "Catena": {
    "Services": "CatenaDevelopmentDashboardService",
  }
}
```

- Run the platform: `make dev`

#### 2. Develop the dashboard with hot reload

Use this workflow when you want to work on dashboard-involved features (e.g. iterating on UX). It supports hot-reloading of the frontend to improve iteration speed.

##### How to use this workflow

- Follow the build steps above to install dependencies and ensure the dashboard is in a buildable state (`make build-dashboard`)
- In `appsettings.Development.json`, set `Catena:Dashboard:HotReload` to `true`
- Navigate to the root directory `catena-tools-core` and start the backend (`make dev`)
- Navigate to the dashboard directory `cd catena-tools-core/dashboard`
- Run `npm run dev`
- In a browser window, navigate to `localhost:5000/dashboard`

To shut down, first shut down the dashboard service, and then shut down the backend.

{% admonition type="info" %}
Remember to reset `Catena->Dashboard->HotReload` to `false` before pushing changes.
{% /admonition %}

#### 3. Develop the dashboard with hot-reload via Caddy

##### How to use this workflow

- Follow the build steps above to install dependencies (and ensure the dashboard is in a buildable state) `make build-dashboard`
- Start the backend
- Navigate to the dashboard directory
    - `cd catena-tools-core/dashboard`
- In one terminal start caddy with the development Caddyfile
    - `caddy run`
- In another window run `npm run dev` to actually run the dashboard.
- In a browser window, navigate to `localhost/dashboard`

#### Troubleshooting

If you are running the application from WSL, you may get a certificate-related warning in the browser. If so, click the "Advanced" button and allow redirection to localhost.

This workflow also expects that you are running the backend on the default http port `5000`. If you change this, the Caddyfile must be updated.

### Production

#### Run the dashboard in production via Caddy

Use this workflow when you need to run the dashboard in a production environment where reliability, availability, and request load are important concerns.

##### How to use this workflow

- Follow the steps above to build the dashboard
- Modify `Caddyfile.production` to match where your backend is running (specifically the `reverse_proxy`) item

```caddyfile
localhost {
    log {
        output stdout
        level  DEBUG
    }

    handle /api/* {
        # Proxy (HTTP) Api requests to the catena-tools-core backend. (Change this to match your config, ex https://platform.catenatools.com)
        reverse_proxy localhost:5000
    }

    # Handle all routes, which should route to index.html
    handle_path /dashboard/* {
        root * ./dist/
        try_files index.html
        file_server
    }

    # Serve the asset files from dist/
    file_server /* {
        root ./dist/
    }
}
```

- Ensure the backend is running
- Run `caddy run --config Caddyfile.production`
