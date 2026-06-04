# MedicSync-Parkinson-s-App-Prototype
MedicSync is a calm, warm medication-management app for people with Parkinson's. Meal-anchored alarms, NFC tap-to-confirm with a smart pill box, and gentle follow-ups for "okay to eat." Built in React Native with Expo.

# MedicSync

## Features

- Meal-anchored dose scheduling (30 min before / 1 hour after meals)
- NFC tap-to-confirm with a smart pill box — the alarm only stops on confirmation
- Manual per-medication checklist as a deliberate fallback, deep-linked from the lock-screen notification
- Daily routine adjustments: shift meal times today without changing the default schedule
- Per-dose silence (silence one alarm independently of the others)
- Two configurable alarm profiles (Home / Outdoors) with sound, volume escalation speed, and sound pattern (constant / intervals / every 30 sec / every minute)
- Alarm sound plays even when the iOS ringer is off
- "Okay to eat" follow-up notification after the meal interval
- Dose taken early: log a dose retroactively with the actual time taken
- Configurable missed-dose threshold (5 min / 15 min / 30 min / 1 hour)
- History with status breakdown (taken via pill box, taken manually, missed), with "Clear history" action
- Pill box location screen with a "Find AirTag in Find My" deep link
- Fully offline — no account required
- Full English and Danish localisation, switchable at any time
- All icons are custom SVG; no emoji used as UI content

## Installation & Setup

### Prerequisites

- Node.js 20 LTS or newer
- Xcode (for iOS builds) or Android Studio (for Android builds)
- A paid Apple Developer account for the NFC entitlement on iOS
- An iOS or Android phone for device testing

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd medicsync

# Install dependencies
npm install --legacy-peer-deps

# Generate the native iOS project (regenerates ios/ folder)
npm run prebuild:ios

# Build and run on a connected iOS device via EAS development build
npx expo run:ios --device
```

The app uses EAS development builds rather than Expo Go because `expo-av` and `react-native-nfc-manager` are not available in Expo Go. The development build is installed on the device once; from then on, `npx expo start` connects to the existing build over Wi-Fi for fast iteration.

### Re-applying the iOS Podfile patch

After every `npx expo prebuild --clean`, the `post_install` hook in `ios/Podfile` that sets `SWIFT_STRICT_CONCURRENCY = minimal` and `SWIFT_VERSION = 5.0` for all targets must be re-added. Without it, the build fails under Xcode 26.5 / Swift 6.

### Viewing the design prototype

The HTML prototype runs entirely in a browser — no build step required:

```bash
open medicsync.html   # macOS
# or double-click the file in your file manager
```

### NFC testing

Tap any NDEF-compatible NFC tag against the back of the phone while the alarm screen is active. The iOS system NFC sheet appears automatically about 1.2 seconds after the screen mounts.


# Project Background
This prototype was developed as part of a university thesis project exploring how technology can support medication management for people living with Multiple Sclerosis.

# License
This project is intended for academic and research purposes only.
