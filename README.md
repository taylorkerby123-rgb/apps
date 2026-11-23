# Ate Your Homework apps

Each app lives in its own folder as a Capacitor project (iOS and Android). Cloud builds for iOS are defined in `codemagic.yaml`, one workflow per app.

| Folder | Home-screen name | Bundle ID | Codemagic workflow |
|---|---|---|---|
| `tempo/` | Tempo | com.ateyourhomework.tempo | Tempo iOS to TestFlight |
| `checkers/` | Checkers | com.ateyourhomework.checkers | Checkers iOS to TestFlight |
| `codebreaker/` | Codebreaker | com.ateyourhomework.codebreaker | Codebreaker iOS to TestFlight |
| `labyrinth-run/` | Labyrinth Run | com.ateyourhomework.labyrinthrun | Labyrinth Run iOS to TestFlight |
| `marble-drop/` | Marble Drop | com.ateyourhomework.marbledrop | Marble Drop iOS to TestFlight |
| `toilet-flush/` | Toilet Flush | com.ateyourhomework.toiletflush | Toilet Flush iOS to TestFlight |
| `cat-box/` | Cat Box | com.ateyourhomework.catbox | Cat Box iOS to TestFlight |
| `disappointed-abe/` | Abe | com.ateyourhomework.disappointedabe | Disappointed Abe iOS to TestFlight |
| `power-scan/` | Power Scan | com.ateyourhomework.powerscan | Power Scan iOS to TestFlight |
| `pill-box/` | Pill Box | com.ateyourhomework.pillbox | Pill Box iOS to TestFlight |

## Ads
Every app uses AdMob with Google's TEST IDs. Before release, for each app:
1. `src/ads.js`: put the real banner and interstitial unit IDs in `IDS` and set `USE_TEST_ADS = false`.
2. `ios/App/App/Info.plist`: set `GADApplicationIdentifier` to the app's real iOS AdMob App ID.
3. `android/app/src/main/AndroidManifest.xml`: set the `APPLICATION_ID` meta-data to the real Android AdMob App ID.

Games show a top banner, and an interstitial after a finished round (at most once every 3 rounds and 3 minutes). Toilet Flush and Abe have no rounds, so they show the banner only.

## Adding a new app to the cloud build
1. Register the bundle ID at developer.apple.com (Identifiers) and create the app in App Store Connect.
2. Copy one of the workflow blocks in `codemagic.yaml`, then change the name, `working_directory` and `BUNDLE_ID`.
