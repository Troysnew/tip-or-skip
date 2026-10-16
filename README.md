# Tip or Skip

Tipping calculator plus "should I tip for this?" guidance for 61 US services. Built with Expo SDK 58 (React Native 0.88).

## Test on your Android phone (Expo Go)

You need a computer with Node.js 20 or newer, and your phone on the same Wi-Fi network.

1. Install **Expo Go** on your phone from the Google Play Store.
2. Unzip this folder on your computer, open a terminal in it, and run:
   ```bash
   npm install
   npx expo start
   ```
3. A QR code appears in the terminal. Open Expo Go on your phone and scan it.

The app loads on your phone. Saving a file on the computer reloads the app automatically.

If the phone can't connect (office or guest Wi-Fi often blocks it), stop the server and run `npx expo start --tunnel` instead.

## Build an installable APK

This builds in Expo's cloud, so you don't need Android Studio. It requires a free Expo account (expo.dev).

```bash
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview
```

When the build finishes, EAS gives you a link to download the `.apk`. Open it on your phone to install. Android will ask you to allow installs from that source.

## Project layout

```
App.tsx                     tab bar, shared calculator state, service sheet
src/data/services.ts        the service catalog (verdict, norm, notes, sources)
src/data/surveys.ts         Pew 2023 and Bankrate 2025 figures
src/lib/tip.ts              tip math, rounding, split, tip button options
src/lib/search.ts           fuzzy search over names and aliases
src/lib/storage.ts          on-device storage for poll answers and requests
src/screens/                Calculator, Services, Data, ServiceSheet
src/components/ui.tsx       shared buttons, inputs, pills, bar charts
```

## Before launch

- Entries tagged "Common US guidance" in `services.ts` need a source check.
- Poll answers and service requests are stored on the phone only. A backend (Supabase is a good fit) is needed for shared community stats.
- App icon and splash are still the Expo defaults in `assets/`.
