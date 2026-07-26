# FairOnes production web

Editable reconstruction of the current faironeslive.com web UI, kept separate from the Expo/native app.

## Run

```bash
cd web-production
npm install
npm run dev
```

## Live lobby

The Live tab connects to the Azure FairOnes API and joins `fairones-live-lobby` as a listen-only participant. YouTube subscription verification requests `youtube.readonly`; verified subscribers receive a speaker grant and reconnect with microphone-only publish permission.

Expected API routes:
- `POST /api/livekit/token`
- `POST /api/youtube/subscription`

Google OAuth origin must include the deployed web origin.
