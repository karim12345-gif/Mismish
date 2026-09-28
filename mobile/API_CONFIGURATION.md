# Mobile API configuration

The mobile app requires `EXPO_PUBLIC_API_URL`. It deliberately has no localhost
fallback, so a release cannot silently ship with a backend address that only
works on the developer's computer.

## Local iPhone development

Copy `.env.example` to `.env` and replace `YOUR_COMPUTER_LAN_IP` with the Mac's
LAN address. The phone and Mac must be on the same network. Keep `/api` at the
end of the URL.

Example:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.20:4000/api
```

Run the local build with:

```sh
npx expo run:ios --device
```

## EAS builds

`eas.json` deliberately does not hardcode an API URL for development or preview
builds. Configure `EXPO_PUBLIC_API_URL` in the EAS `development` or `preview`
environment only after the staging API exists. Until then, preview/TestFlight
builds fail closed instead of silently using production data.

The production profile remains explicitly connected to the production Railway
API. Do not use that profile for QA.

```sh
eas build --profile preview --platform ios
eas build --profile production --platform ios
```

Before the first preview build, set this non-secret EAS environment value in
the Expo dashboard:

```text
Environment: preview
EXPO_PUBLIC_API_URL=https://<staging-api-host>/api
```

`EXPO_PUBLIC_*` values are compiled into the app and are not secrets. Provider
API keys and server credentials must remain in backend environment variables.
