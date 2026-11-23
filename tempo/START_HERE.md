# Tempo: iOS and Android app project

App ID (bundle ID): `com.ateyourhomework.tempo`
App name: Tempo Chess Tutor

## What's already done
- Tempo wrapped with Capacitor 8, with iOS (`ios/`) and Android (`android/`) projects.
- Fonts are bundled in the app (`www/fonts/`), so it works offline.
- Web ad boxes are hidden inside the app. Native AdMob ads replace them:
  - an adaptive banner at the top of the screen
  - an interstitial when the player leaves the result screen, at most once every 3 games and 3 minutes
- Launch order: GDPR consent form (only where required), then Apple's tracking prompt (iOS), then ads.
- AdMob App IDs, the tracking prompt text and Google's SKAdNetwork IDs are in the iOS and Android config.
- App icons and splash screens are generated for both platforms.
- Everything currently uses Google's TEST IDs, so you can tap the ads safely.

## One-time setup on your computer
1. Install Node.js (LTS) from nodejs.org.
2. Mac: install Xcode from the App Store, then open it once to accept the license.
3. Android (optional): install Android Studio.
4. Unzip this folder, open a terminal in it, and run: `npm install`

## Run it
- iOS (Mac only): `npx cap open ios`, then pick your iPhone or a simulator and press Run.
- Android: `npx cap open android`, then press Run with a phone plugged in or an emulator.

You should see a "Test Ad" banner at the top. Play 3 games and you'll get a test interstitial.

## Before release: swap in your real AdMob IDs
In AdMob, add the app twice: once for iOS and once for Android. Create a Banner unit and an Interstitial unit for each. Then:

1. `src/ads.js`: paste your 4 ad unit IDs (they contain a "/") into `IDS`, and set `USE_TEST_ADS = false`.
2. `ios/App/App/Info.plist`: replace the `GADApplicationIdentifier` value with your iOS App ID (it contains a "~").
3. `android/app/src/main/AndroidManifest.xml`: replace the `APPLICATION_ID` value with your Android App ID.
4. Rebuild and sync:
   ```
   npx esbuild src/ads.js --bundle --format=iife --minify --outfile=www/ads.bundle.js
   npx cap sync
   ```
5. In AdMob (Settings > Test devices), add your own phone so you never see or tap live ads by accident.

## If you change the game itself
Edit `www/index.html`, then run `npx cap sync`.
Note: this file came from Tempo's `app/index.html` with these changes: local fonts, app-only CSS (`html.in-app`), the interstitial hook in `showResult`, and the `ads.bundle.js` script tag. If you rebuild Tempo from `src/` with `build.py`, these changes have to be reapplied.

## Still to do when Apple approves you
- Register `com.ateyourhomework.tempo` under Identifiers in the Apple Developer portal.
- Create the app record in App Store Connect.
- In Xcode: Signing & Capabilities, choose your team, then Product > Archive > Distribute to App Store Connect.
