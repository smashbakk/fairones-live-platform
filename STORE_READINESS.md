# Fair Ones Live — Store Readiness

## Implemented in this package

- Expo SDK 54 / React Native 0.81 baseline targeting Android API 36.
- Unique iOS bundle identifier and Android application ID: `com.fairones.live`.
- EAS development, internal preview, Android App Bundle production, and submission profiles.
- Camera and microphone purpose strings for iOS and scoped Android permissions.
- Dark-mode splash, 1024px icon, Android adaptive icon, version/build numbering, and portrait orientation.
- Edge-to-edge safe-area handling and Android predictive-back readiness.
- YouTube archive link: `https://www.youtube.com/@FaironesLive`.

## Required before store submission

1. Replace placeholder policy URLs in `app.json` with published Privacy Policy, Terms, Community Guidelines, Support, and Account Deletion pages.
2. Configure Apple Developer and App Store Connect agreements, app record, certificates, screenshots, age rating, privacy nutrition labels, and content-rights declarations.
3. Configure Google Play Console app record, Data Safety, content rating, ads declaration, app access instructions, privacy policy, tester track, and production access.
4. Add a real backend for accounts, moderation/reporting, blocking, event data, voting integrity, and account deletion.
5. Connect production LiveKit through an authenticated server-generated token endpoint. Never ship a public sandbox token-server ID.
6. If tokens, subscriptions, tips, or Battle Pass purchases unlock digital content, use Apple In-App Purchase and Google Play Billing. Do not route digital purchases to Cash App, Apple Pay, or an external checkout inside the app.
7. Obtain participant releases and licenses for every photo, stream, replay, logo, song, and event recording.
8. Test camera/microphone denial, poor-network recovery, live moderation, account deletion, and reporting on physical iOS and Android devices.

## Build commands

```bash
npm install
npm run typecheck
npx expo-doctor
eas build --profile preview --platform android
eas build --profile production --platform all
eas submit --profile production --platform android
eas submit --profile production --platform ios
```
