# Fair Ones Live

Fair Ones is a mobile-first live competition platform for rap battles, 1-on-1 basketball, chess, and debates — **where things get settled**.

This reconstructed Expo project implements the approved combined UI direction:

- premium black and metallic-gold broadcast palette;
- pink/blue competitor presentation and event photography;
- clean five-item native bottom navigation;
- working live-room preview, voting, schedule, matchup details, competition submission preview, and official YouTube archive link.
- native LiveKit viewer room backed by a secure Azure Functions token service.

## Run locally

```bash
npm install
npm start
```

The iOS and Android development builds now connect to LiveKit through the server-issued token flow in `api/`. The web build retains the broadcast preview. Add your Azure and LiveKit settings by following `LIVEKIT_AZURE_SETUP.md`; secrets must never be placed in the Expo application.
