# Fair Ones Live — LiveKit + Azure setup

## What this stage adds

- Native Expo LiveKit client for iOS and Android development builds.
- An Azure Functions v4 TypeScript token endpoint at `POST /api/livekit/token`.
- Room allowlisting and short-lived viewer tokens.
- Host publishing tokens protected by `FAIRONES_ADMIN_KEY`.
- No LiveKit API secret in the mobile application.

## 1. Create the LiveKit project

Create a LiveKit Cloud project and copy its secure WebSocket URL, API key, and API secret. Keep the API secret only in Azure application settings.

## 2. Configure and deploy Azure Functions

Create a Node.js 22 Azure Function App. From `api/`, install and build:

```bash
npm install
npm test
npm run build
```

Add these Function App configuration values:

```text
LIVEKIT_URL=wss://YOUR-PROJECT.livekit.cloud
LIVEKIT_API_KEY=YOUR_LIVEKIT_API_KEY
LIVEKIT_API_SECRET=YOUR_LIVEKIT_API_SECRET
LIVEKIT_ALLOWED_ROOMS=fairones-main-event
LIVEKIT_TOKEN_TTL=10m
FAIRONES_ALLOWED_ORIGIN=https://YOUR-WEB-ORIGIN.example
FAIRONES_ADMIN_KEY=GENERATE_A_LONG_RANDOM_SECRET
```

Deploy the `api` folder with the Azure Functions Core Tools or the VS Code Azure Functions extension. The resulting endpoint is:

```text
https://YOUR-FUNCTION-APP.azurewebsites.net/api/livekit/token
```

For the current Fair Ones Azure resource, the expected endpoints are:

```text
https://fairones-live-api-smashbakk.azurewebsites.net/api/health
https://fairones-live-api-smashbakk.azurewebsites.net/api/livekit/token
```

The repository includes `.github/workflows/deploy-azure-api.yml`. Before running it, download the Function App publish profile and save its complete contents in the GitHub Actions repository secret `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`.

## 3. Configure the Expo application

Copy `.env.example` to `.env` and set the deployed endpoint:

```text
EXPO_PUBLIC_LIVEKIT_TOKEN_ENDPOINT=https://YOUR-FUNCTION-APP.azurewebsites.net/api/livekit/token
```

Never place `LIVEKIT_API_SECRET` or `FAIRONES_ADMIN_KEY` in an `EXPO_PUBLIC_` value.

## 4. Build the native app

LiveKit requires native WebRTC code and does not run in Expo Go:

```bash
npm install
npx expo prebuild
eas build --profile development --platform android
eas build --profile development --platform ios
```

Install the development build on physical devices. Use two devices: a host authenticated by the admin key and a viewer using the app's Live tab.

## Production hardening still required

- Move host authorization behind a real Fair Ones administrator login before distributing host controls.
- Add Azure API Management or Front Door rate limiting and abuse protection.
- Add application monitoring and alerts without logging tokens or secrets.
- Add recording/egress only after participant releases and storage retention rules are finalized.
