# Rules from Troy for this repo

- Never start paid app builds on your own: Expo/EAS iPhone or Android builds, or App Store or TestFlight submissions. That includes dispatching `.github/workflows/ios-testflight.yml`. Batch changes, ask Troy first, and only build when he says so.
- Pushing to `main` runs the free Android APK workflow on GitHub (`android-apk.yml`, no Expo credits). Ask before pushing if Troy wants Android builds held too.
