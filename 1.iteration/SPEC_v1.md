# MedicSync — Project Specification

> A medication management app for people with Parkinson's disease, built around a meal-anchored alarm system and a phone-to-pillbox NFC confirmation pattern.

This document is the source of truth for the MedicSync mobile app. It is written for an AI coding assistant (Claude Code) to build the app phase by phase using React Native and Expo. The companion file `medicsync.html` is an interactive design prototype — refer to it for visual appearance, layout, and exact interaction behaviour.

---

## 1. Product context

### 1.1 Who this is for

People living with Parkinson's disease or Multiple Sclerosis who take multiple medications throughout the day, often timed around meals (most commonly Levodopa, taken 30 minutes before or 1 hour after a meal). The user group experiences:

- Cognitive load and fatigue that make routines harder to maintain
- Possible tremor or reduced fine motor control
- Variability in daily life — meal times shift, activities take place outside the home, energy levels fluctuate
- Reliance on a stable medication routine for symptom management

### 1.2 What the app is for

The app helps the user adhere to their medication routine without becoming a daily-use dashboard. After the user sets up their schedule once, the app should fade into the background. The primary surfaces are:

1. **The alarm itself** — the main daily touchpoint
2. **Pre-alarm silence toggle** — used in social situations
3. **The "okay to eat" notification** — passive follow-up
4. **Onboarding / setup** — done once, done well

Home screen, History, and Schedule are *secondary surfaces*. A successful user might rarely open the app at all on a given day.

### 1.3 The core differentiating interaction

When an alarm fires, the only intended way to dismiss it is to bring the phone close to a connected pill box, where matching NFC tags trigger confirmation. This physical proximity requirement is a behavioural design choice, not a technical limitation: it prevents users from absent-mindedly silencing the alarm and forgetting to take their medication. The phone and pill box must come together for the alarm to stop.

A manual override exists for genuine edge cases (away from home, pill box temporarily unavailable). It is structurally subordinate but always accessible. It requires explicit per-medication confirmation through a checklist, and is logged distinctly from NFC-confirmed doses.

**For the initial build, NFC is deferred (see section 8.1). The codebase must be structured so that NFC can be added later without refactoring the rest of the app.**

---

## 2. UX principles

These principles are the lens for every implementation decision. When in doubt, return to these.

### 2.1 Readability and discoverability come first

This is the highest-priority UX parameter. Aesthetics serve readability, not the other way around. Specifically:

- Tap targets are minimum 54px in height. This is above Apple's 44px guideline because the user group may have reduced motor precision.
- Body text is minimum 17px. Card titles 20px or larger. Section labels are uppercase but legible.
- Status communication uses both colour AND text. Colour alone is never sufficient.
- Generous spacing. Nothing crowded. Cards have ~18px internal padding.
- High contrast. Dark text on warm cream background.

### 2.2 Simplicity

Minimise cognitive load. Use as few steps as possible. The Home screen should answer "what do I need to do next" in a single glance. Fewer screens, fewer decisions, more trust in defaults.

### 2.3 Clarity

Users must always know what to do next. Status badges show the state of every dose. The alarm screen has exactly one primary action. The "okay to eat" notification has one button.

### 2.4 Feedback

The app always shows whether medication has been taken. Doses are tagged in three distinct states in History: taken via pill box, taken manually, missed. All three are visually distinguishable.

### 2.5 Flexibility

Users can adjust today's routine without changing the underlying schedule. Meal time shifts (+15, +30, +45 min, or custom) apply only to today and reset overnight. The default routine is configured separately in Settings.

### 2.6 Behavioural design

Encourage adherence without being intrusive. Reminders escalate in volume if ignored. The NFC tap creates a habit loop. The manual path is honest about being a fallback but does not shame the user. The alarm cannot be dismissed without intent.

### 2.7 Tone

The app does not feel medical. It feels warm, calm, and domestic. No clinical blue or hospital green. The user should feel supported, not patronised. Language is plain and human ("Time to eat!", "Dose confirmed", not "Medication adherence event logged").

---

## 3. Design system

The complete design system is implemented in `medicsync.html`. Use this section as a quick reference and the HTML file as the authoritative source.

### 3.1 Typeface

**Manrope** (Google Fonts) for the entire UI. Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold). It is humanist, highly legible, and avoids any medical or corporate associations.

### 3.2 Colour tokens

```
Background warm cream       #FDF8F3   -- main app background
Background card             #FFFFFF   -- cards and surfaces
Background soft             #FDF0E4   -- secondary buttons, soft fills
Background positive         #EAF3DE   -- success states
Background error            #FCEDEC   -- missed dose backgrounds
Background neutral          #F1EFE8   -- silenced state, manual tag
Background eat              #F5FAF0   -- "okay to eat" screen tint

Primary terracotta          #C8914F   -- primary action, brand colour
Primary dark                #B07845   -- darker terracotta for text/borders
Primary soft                #E8C49A   -- soft amber, active states
Primary darker text         #7A4F20   -- text on soft primary
Primary darkest text        #5C3D1E   -- text on solid primary

Positive sage               #7DAF5A   -- confirmed, taken, "okay to eat"
Positive dark text          #27500A   -- text on positive
Positive mid                #5A9E35   -- "okay to eat" accents
Positive soft               #A8CC85   -- positive borders
Positive text               #2D4A20   -- positive screen titles
Positive sub                #6B9050   -- positive secondary text

Error red                   #D94F4F   -- missed dose
Error dark text             #8B1A1A   -- text on error tint

Text primary                #3D2B1F   -- main text
Text secondary              #8B6E52   -- supporting text
Text tertiary               #B07845   -- accent text, eyebrows
Text muted                  #5F5E5A   -- silent state, manual tag text
Text deep                   #4A3728   -- emphasis dark

Border                      #EDD9C4   -- card borders
Border strong               #D0B090   -- emphasised borders
Border divider              #F0E0CC   -- internal dividers
Border divider soft         #F5EAD8   -- subtle divider
```

### 3.3 Type scale

```
Screen title          26px / 700 / -0.01em letter-spacing
Card title (medication) 20-22px / 600
Body                  17px / 400 / 1.5 line-height
Section label         12-14px / 700 / 0.08-0.1em letter-spacing / uppercase
Helper / muted        13-15px / 500
Button label          16-17px / 600-700
```

### 3.4 Spacing and shape

- Tap target minimum: 54px height
- Card border radius: 18px
- Button border radius: 14-16px
- Pill / badge border radius: 20px
- Standard internal card padding: 18px
- Standard screen edge padding: 20px

### 3.5 Tone of motion

Animations are gentle and brief. The alarm pill ring uses a slow 2s pulse. NFC waves animate at 1.5s. Confirmation success uses a small pop (0.5s). No bouncy or playful easing — the app is calm. Use ease-out for entries, ease-in for exits.

---

## 4. Information architecture

### 4.1 Navigation

Bottom tab bar with four tabs:

1. **Today** — the Home screen (default landing)
2. **Schedule** — the user's full routine, read-only
3. **History** — past doses by day
4. **Settings** — configuration

**Relatives view** is a separate screen, accessed from Settings. Read-only.

**Alarm**, **Manual confirmation**, **Confirmed**, and **"OK to eat"** are full-screen overlay states that sit above the navigation. They are not tab destinations.

### 4.2 Screen list

| Screen | Type | Purpose |
|---|---|---|
| Home | Tab | Today's schedule, next dose card with daily adjustments |
| Schedule | Tab | Full routine overview, silence-all toggle |
| History | Tab | Past doses by day |
| Settings | Tab | Configuration: meal timing, meal times, alarm profiles, relatives |
| Profile editor | Sub-screen of Settings | Edit Home or Outdoors alarm profile |
| Relatives view | Sub-screen of Settings | Read-only companion view |
| Alarm | Overlay | Active alarm with NFC and manual options |
| Manual confirmation | Overlay | Per-medication checklist for non-NFC confirmation |
| Confirmed | Overlay | Post-confirmation success screen with "okay to eat" hint |
| OK to eat | Overlay | Follow-up notification when meal interval has passed |
| Bottom sheet: time picker | Modal | Used in multiple places to set meal times |

---

## 5. Detailed screen specifications

Refer to `medicsync.html` for visual reference of every screen below.

### 5.1 Home (Today)

**Purpose:** Show today at a glance. Allow quick adjustment of today's lunch time and silence settings.

**Layout, top to bottom:**
- Greeting: "Good morning," / Name / Date
- Section: "Next dose"
  - Expanded card showing next dose:
    - "In 1h 25m" eyebrow text (live computed)
    - Medication names (one per line)
    - "Reminder at HH:MM · lunch at HH:MM" line
    - Chevron button to collapse
    - When expanded:
      - Sub-label "Shift lunch time"
      - Three buttons: +15 min, +30 min, +45 min (mutually exclusive selection)
      - "Set exact time" button → opens time picker bottom sheet
      - Feedback strip "Lunch shifted to HH:MM" with Reset button (only when shift active)
      - Sub-label "Alarm sound"
      - Two buttons: Home / Outdoors (mutually exclusive selection)
      - Silence row: bell icon, "Silence this alarm" label, toggle. When on: bell icon shows diagonal line through it, label changes to "This alarm is silenced", row darkens.
- Section: "All doses today"
- Silence-all banner: bell icon, "Silence all alarms today" with sub-text describing current state, toggle. State synchronised with same toggle on Schedule screen.
- List of all doses for today, each row:
  - Status dot (done / active / future / missed)
  - Time + dose name
  - Status badge

**Behaviours:**
- Tapping the chevron collapses or expands the next-dose card
- Tapping a +15/+30/+45 button selects it and updates the reminder time. Selecting another shift deselects the previous one (mutually exclusive).
- Tapping Reset clears any shift and returns to the default lunch time.
- Tapping "Set exact time" opens the bottom sheet time picker. Saving a custom time clears any +15/+30/+45 selection.
- Silence toggle on the next-dose card silences only that one alarm.
- Silence-all toggle silences every alarm for today. Persists across app restarts but resets at midnight.

**Edge cases:**
- After midnight, the day's shift adjustments and silence-all toggle reset.
- If the next dose is the morning dose and silence is on, the alarm uses vibration only.

### 5.2 Schedule

**Purpose:** Give the user a transparent overview of their daily routine. Read-only summary, not a configuration screen.

**Layout, top to bottom:**
- Greeting: "My Schedule" / "Your daily routine"
- Section: "Today's settings"
- Silence-all banner (same as on Home, synchronised)
- Section: "Daily doses"
- Four routine cards, one per dose:
  - Time (large, bold)
  - Label ("Morning", "Lunch", "Afternoon", "Night")
  - Meal anchor pill (e.g. "30 min before lunch")
  - Medications list grouped by dose
- Footer line: "To change your routine, go to Settings."

### 5.3 Alarm overlay

**Purpose:** Prompt the user to take their medication. The only legitimate exits are NFC confirmation or manual confirmation.

**Layout:**
- Animated pulsing pill icon ring
- "Time for your dose" eyebrow
- Medication names (each on its own line)
- Meal context: "Before lunch · 12:00"
- (If silent mode active) Silent badge
- NFC card:
  - Bordered in primary terracotta to dominate visually
  - Animated icons: phone, NFC waves, pill box
  - "Tap phone to pill box"
  - "Bring them close together to confirm"
- Volume escalation indicator (5 bars, animating)
- Volume label: "Volume escalating" or "Silent — vibration only"
- "or" divider with text "not near your pill box?"
- Manual button: "Confirm without pill box" (visually subordinate, but always visible)
- Bottom contract line: "Alarm stays active until your dose is confirmed"

**Behaviours:**
- Screen must stay awake while alarm is active (use Expo's `expo-keep-awake` or equivalent)
- Tapping the NFC card simulates pill box confirmation (in production: triggered by actual NFC proximity)
- Tapping the manual button navigates to the manual confirmation flow
- The alarm cannot be dismissed by swiping away, hardware buttons, or any other means
- Volume escalation: starts at user's defined "starting volume", increases by one segment every X seconds based on the active profile's escalation speed (slow = 5min, medium = 3min, fast = 1min)

### 5.4 Manual confirmation

**Purpose:** Allow legitimate non-NFC confirmation, but require explicit intent.

**Layout:**
- Back button "Back to alarm"
- Question: "Did you take all your medications?"
- Hint: "Confirm each one before continuing. This will be logged as a manual confirmation."
- Checklist of all medications in this dose, each with a green check circle and the medication name
- Primary button: "Yes, I took them all"
- Secondary button: "Not yet — go back"

**Behaviours:**
- Back button returns to the alarm overlay; alarm is still active
- "Yes, I took them all" logs the dose as manual and goes to Confirmed screen
- "Not yet — go back" returns to the alarm overlay

### 5.5 Confirmed

**Purpose:** Provide closure after a dose is taken. Show the user when it is okay to eat.

**Layout:**
- Animated check ring (pop animation)
- "Dose confirmed"
- List of medications taken
- Tag: "Logged via pill box" (green tint) OR "Logged manually" (neutral grey)
- Hint: "You can eat at HH:MM. We'll let you know when it's time." (text adapts based on user's "30 min before" or "1 hour after" setting)
- Single button: "OK"

### 5.6 OK to eat

**Purpose:** Close the meal loop. Fires as a system push notification with a soft sound, and shows as overlay if the app is open.

**Layout:**
- Eat ring with fork-and-knife emoji
- "All clear" eyebrow
- "Time to eat!"
- Body: "It has been 30 minutes since your Levodopa dose. Enjoy your lunch."
- Single button: "OK, thank you"

### 5.7 History

**Purpose:** Show past medication adherence.

**Layout:**
- Greeting: "History" / "Last 30 days"
- One card per day, latest first
  - Day label (Today, Yesterday, then date)
  - Four-dot summary visualising the day's doses
  - Score (e.g. "3/4")
  - Expandable list of dose entries with time, name, and status badge

**Status badges:**
- Taken (green) — confirmed via pill box
- Manual (grey) — confirmed without pill box
- Missed (red) — never confirmed
- Upcoming (amber) — scheduled for today, not yet due
- Scheduled (grey) — scheduled for today, future

### 5.8 Settings

**Purpose:** Configure the user's routine, alarm profiles, and relatives setup.

**Sections:**

1. **Medication timing** — radio: "30 min before meal" / "1 hour after meal"
2. **Default meal times** — three rows: Breakfast, Lunch, Dinner. Each tappable, opens bottom sheet time picker.
3. **Alarm profiles** — two rows: Home, Outdoors. Each tappable, opens profile editor.
4. **Relatives** — toggle for "Notify if dose missed", row to view relatives view.

### 5.9 Profile editor

**Purpose:** Edit one alarm profile (Home or Outdoors).

**Layout:**
- Back button "Settings"
- Eyebrow + title: "Indoor alarm profile" / "Home" (or "Outdoor alarm profile" / "Outdoors")
- Sub-label: "Sound"
- List of sound options with radio buttons and play preview buttons (5 options: Gentle chime, Soft bells, Morning birds, Wind bells, Strong tone)
- Sub-label: "Volume escalation"
- Three options: Slow (over 5 min), Medium (over 3 min), Fast (over 1 min)
- Save button

### 5.10 Relatives view

**Purpose:** Read-only companion view for relatives. Proof-of-concept only — not the focus of v1.

**Layout:**
- Back button + "Sara's doses" + date
- Card with today's dose list, each row showing time, name, and status badge
- Footer: "Last updated just now · Read only"

### 5.11 Bottom sheet time picker

**Purpose:** Reusable modal for setting meal times.

**Layout:**
- Drag handle
- Title: "Set lunch time" (or breakfast / dinner)
- Sub-text describing scope: "Just for today · resets tomorrow" OR "Default for every day"
- Native time input
- Cancel / Save buttons

---

## 6. Data model

```typescript
type Medication = {
  id: string;
  name: string;          // "Levodopa"
  dosage: string;        // "100mg"
};

type DoseTime = {
  id: string;
  label: 'Morning' | 'Lunch' | 'Afternoon' | 'Night' | string;
  scheduledTime: string; // "08:00", computed from meal anchor
  mealAnchor: {
    meal: 'breakfast' | 'lunch' | 'dinner';
    relation: 'before' | 'after';
    minutes: number;     // 30 or 60
  };
  medications: Medication[];
};

type DailyAdjustment = {
  date: string;          // "2025-05-03"
  dose_id: string;
  shiftMinutes?: number; // +15, +30, +45
  customTime?: string;   // "12:30"
  silenced?: boolean;    // silence just this alarm
};

type DoseLog = {
  id: string;
  doseId: string;
  scheduledTime: string;
  takenAt: string | null;
  method: 'nfc' | 'manual' | null;
  status: 'taken' | 'missed' | 'pending';
};

type AlarmProfile = {
  id: 'home' | 'outdoors';
  sound: 'gentle-chime' | 'soft-bells' | 'morning-birds' | 'wind-bells' | 'strong-tone';
  escalation: 'slow' | 'medium' | 'fast';
};

type AppSettings = {
  mealTimes: { breakfast: string; lunch: string; dinner: string };
  defaultMealRelation: 'before' | 'after';
  defaultMealMinutes: 30 | 60;
  profiles: { home: AlarmProfile; outdoors: AlarmProfile };
  silenceAllToday: { date: string; on: boolean } | null;
  relativesNotifyMissedAfterMin: 15 | 30;
  relativeContact: { name: string; method: string } | null;
};
```

All data is local to the device. Use AsyncStorage or MMKV. No backend required for v1.

---

## 7. Behavioural specifications

### 7.1 The alarm contract

The alarm exists in exactly one of these states:
- **Inactive** — scheduled but not yet firing
- **Active** — currently firing, screen kept awake, sound or vibration playing
- **Resolved** — user has confirmed via NFC or manual flow

The active alarm has only two legitimate exits:
1. NFC proximity → logged as `method: 'nfc'`
2. Manual confirmation → logged as `method: 'manual'`

The user cannot:
- Dismiss the alarm by closing the app
- Silence it from outside the app
- Snooze it (no snooze functionality exists)
- Pause it

### 7.2 Volume escalation

When an alarm starts, the volume begins at a low level and increases over time based on the active profile's escalation setting:
- **Slow:** ramps to maximum over 5 minutes
- **Medium:** ramps to maximum over 3 minutes
- **Fast:** ramps to maximum over 1 minute

When in silent mode (per-alarm or silence-all): no sound. Vibration pattern ramps in intensity following the same curve.

### 7.3 The "okay to eat" notification

After a dose is confirmed (NFC or manual), if the user's setting is "30 min before meal", schedule a local notification to fire 30 minutes after confirmation. If the user's setting is "1 hour after meal", schedule it 1 hour after the meal time, not after the dose. Match the configured offset in both directions.

The notification:
- Fires as a local push notification (works when the app is closed)
- Plays a soft chime by default (different from the alarm sound)
- Title: "Time to eat"
- Body: "It has been [X] minutes since your [primary medication] dose."
- When app is opened, shows the OK to eat screen

### 7.4 Missed dose handling

If 15 minutes pass after a dose is due and no confirmation has occurred:
- Alarm continues to sound (it has not been silenced via NFC or manual confirmation)
- If the user has configured a relative, fire the missed-dose notification to the relative's contact (placeholder for v1 — log the event, do not actually send)
- After 30 minutes from due time without confirmation, mark the dose as missed in History
- Continue alarm escalation through this period

### 7.5 Day rollover

At midnight (or when the app first opens after midnight):
- All daily adjustments (shifts, custom times, silence-all) reset
- Today's dose entries become Yesterday's
- New day's dose entries are computed from default schedule

### 7.6 Late doses

If the user confirms a dose after the scheduled time (whether 5 minutes or 5 hours late), log it with:
- `takenAt` = actual confirmation time
- `status` = 'taken'

The app does not adjust the next dose's timing automatically. Doses are independent.

---

## 8. Technical implementation guidance

### 8.1 NFC abstraction (deferred)

NFC is not implemented in the initial build, but the codebase must be structured to accept it later without refactoring. Implement a confirmation service:

```typescript
// confirmationService.ts
type ConfirmationMethod = 'nfc' | 'manual';

export async function confirmDose(doseId: string, method: ConfirmationMethod) {
  // log to history with method
  // stop active alarm
  // schedule "okay to eat" notification
  // navigate to confirmed screen
}
```

In v1, only the manual path calls this function. In a later version, an NFC listener (running while an alarm is active) will also call it with `method: 'nfc'`. No screen logic, alarm logic, or history logic should change when NFC is added.

The Alarm screen's NFC card should still be visually present and tappable in v1 — tapping it can simply call `confirmDose(id, 'nfc')` for testing purposes. Add a comment indicating this is a placeholder for real NFC.

### 8.2 Recommended Expo libraries

- `expo-notifications` — scheduling local notifications, handling permissions
- `expo-keep-awake` — keep screen on during active alarm
- `expo-haptics` — vibration patterns
- `expo-av` — alarm sound playback with volume control
- `expo-router` or `@react-navigation/native` — navigation
- `@react-native-async-storage/async-storage` — local persistence
- `@gorhom/bottom-sheet` — for the time picker bottom sheet
- `react-native-svg` — for icons (recreate the SVGs from the prototype)
- `react-native-reanimated` — for the alarm pulse and confirmation pop animations

For state management, use Zustand. It is small, simple, and works well with React Native.

For NFC (later phase): `react-native-nfc-manager`. Not an Expo module, requires development builds. This is one reason NFC is deferred.

### 8.3 Project structure

```
medicsync/
├── app/                          # expo-router screens
│   ├── (tabs)/
│   │   ├── index.tsx             # Home
│   │   ├── schedule.tsx
│   │   ├── history.tsx
│   │   └── settings.tsx
│   ├── alarm.tsx                 # modal overlay
│   ├── manual-confirm.tsx        # modal overlay
│   ├── confirmed.tsx             # modal overlay
│   ├── ok-to-eat.tsx             # modal overlay
│   ├── profile-editor.tsx
│   └── relatives.tsx
├── components/
│   ├── primitives/               # Button, Card, Toggle, RadioGroup, etc.
│   ├── DoseRow.tsx
│   ├── DoseCard.tsx
│   ├── SilenceAllBanner.tsx
│   └── TimePickerSheet.tsx
├── lib/
│   ├── theme.ts                  # colour and type tokens
│   ├── confirmationService.ts
│   ├── alarmScheduler.ts
│   ├── notifications.ts
│   └── storage.ts
├── stores/
│   ├── settingsStore.ts          # Zustand stores
│   ├── scheduleStore.ts
│   ├── todayStore.ts
│   └── historyStore.ts
├── SPEC.md                       # this document
└── medicsync.html                # design reference
```

### 8.4 Accessibility

- All interactive elements must have an accessibility label
- Tap targets minimum 54px (already enforced by design)
- Dynamic Type support — wrap base font sizes so they respond to system text-size settings
- Screen reader: alarm screen must announce "Time for your dose" and the medication names when the alarm becomes active
- Avoid colour-only state — every status has both a colour and a label

---

## 9. Build phases

Build the app in phases. Each phase is a complete, testable milestone.

### Phase 1 — Design system and primitives

Deliverable: theme tokens, typography, and reusable components in isolation.

- Set up Manrope font loading
- Create `theme.ts` with colour tokens, type scale, spacing, radii
- Build primitive components: `Button` (primary, secondary, tertiary, destructive), `Card`, `Toggle`, `Radio`, `Badge` (for all status types), `IconButton`, `BottomSheet`
- Build a single "component showcase" screen that displays all primitives, used only for development verification
- No screens, no navigation yet

End-of-phase test: every visual element from `medicsync.html` renders correctly in isolation.

### Phase 2 — Static screens with mock data

Deliverable: every screen renders, navigation works, but no data persistence or alarms.

- Set up navigation (tab bar + modal overlays)
- Build all screens listed in section 4.2 with hard-coded data
- Implement screen-level interactions: card collapse/expand, shift selection, silence toggles, profile switches, etc.
- The bottom sheet time picker works for setting meal times in Settings (state lives in component memory, resets on reload)

End-of-phase test: tap through the entire app exactly as you can in `medicsync.html`.

### Phase 3 — State management and persistence

Deliverable: app remembers user data across restarts.

- Implement Zustand stores per the data model in section 6
- Wire up Settings → store → Home/Schedule
- Persist to AsyncStorage on every change
- Hydrate stores on app launch
- Implement day rollover logic
- Compute "next dose" dynamically from current time and schedule
- The user can configure their full routine, edit meal times, switch profiles, and the data persists

End-of-phase test: configure a full schedule, close and reopen the app, see your config preserved. Today's adjustments reset overnight (test by manipulating system clock).

### Phase 4 — Alarms and notifications

Deliverable: alarms actually fire on schedule. Manual confirmation works end to end. "OK to eat" follow-up fires.

- Request notification permissions on first launch (with explanation)
- Schedule local notifications based on the active routine
- Build the alarm screen as a full-screen modal that opens when a notification fires (or when the user taps it)
- Keep screen awake during alarm
- Play sound with volume escalation
- Handle silent mode (per-alarm and silence-all)
- Wire up the manual confirmation flow → calls `confirmDose(id, 'manual')`
- Implement `confirmDose`: log to history, stop alarm, schedule "ok to eat", navigate to Confirmed screen
- Schedule "ok to eat" notification 30 min after confirmation (or 1 hour, per setting)
- Mark missed doses after 30 minutes of no confirmation

End-of-phase test: schedule a dose for 1 minute from now, close the app, wait. Alarm fires. Confirm manually. App returns to home. 1 minute later (or your test interval), "ok to eat" fires.

### Phase 5 — Polish and edge cases

- Empty states (no doses today, no history yet)
- Error states (notification permission denied, time picker validation)
- First-launch onboarding (set up the schedule)
- Late dose logging (confirm hours after due)
- Day rollover during active alarm
- Multi-medication grouping verification
- History view with last 30 days
- Animations: alarm pulse, NFC waves, confirmation pop
- Dynamic type and accessibility audit

### Phase 6 — NFC integration (future)

- Switch from Expo Go to development builds (required for native modules)
- Add `react-native-nfc-manager`
- Implement NFC listener that runs only while an alarm is active
- On NFC tag read: call `confirmDose(id, 'nfc')`
- Test with a physical NFC tag standing in for the pill box
- Update Alarm screen to indicate NFC listener is active

### Phase 7 — Hardware integration (future)

- Pairing flow with the actual pill box hardware
- Validation that the tapped tag matches the user's paired box (not just any tag)

---

## 10. Out of scope for v1

These are explicitly excluded from the initial build:

- Multi-device sync or cloud backup
- Real relative notifications (only logged events for v1)
- Account creation or login
- Pill box hardware pairing (NFC only reads tags in v1)
- Localisation — English only for the prototype
- Dark mode — light theme only for v1 (can be added later)
- Apple Watch or other wearables
- Integration with health platforms (Apple Health, Google Fit)
- Sharing or exporting history data
- Doctor or pharmacy integration

---

## 11. Definition of done for v1

The app is feature-complete when:

- A user can install the app, complete first-launch setup, and have their schedule running
- Alarms fire reliably on schedule, even with the app closed
- The user can confirm a dose manually with full intent through the checklist
- The "okay to eat" notification fires correctly based on user setting
- Daily adjustments (shifts, silence) work and reset correctly at midnight
- History accurately reflects taken (manual), missed, and upcoming doses
- All settings persist across app restarts
- The app feels warm, calm, and unhurried — never clinical
- The codebase is structured so that NFC can be added in a single isolated module

---

## 12. Reference files

- `medicsync.html` — interactive prototype showing every screen, animation, and interaction
- This file (`SPEC.md`) — written specification of behaviour, data model, and build phases

When implementation details conflict, this document is authoritative. When visual details conflict, the HTML prototype is authoritative.
