# Catena Public Docs
This repository houses Catena's public facing documentation. We use [Redocly's Realm](https://redocly.com/docs/realm) to build and host these docs.

## Getting Started
### Dependencies
- NodeJS, v18 or later

### Running Locally
1. Install Node Modules
```
npm install
```

2. Run The Project
```
npm run start
```

3. Navigate to http://127.0.0.1:4000

### Iterating
Realm uses hot reloading, so changes that you make should be reflected in near real-time in your browser.

## Deployment
We use Redocly's cloud platform to host our docs. Access is limited, but our org can be found here: https://app.cloud.redocly.com/org/wolfjaw-studios/project/catena-tools

The `main` branch of this repository is automatically synced and deployed to https://catena-tools.redocly.app/ whenever there are updates.