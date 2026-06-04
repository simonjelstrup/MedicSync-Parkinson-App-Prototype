# MedicSync — Project Specification

> A medication management app for people with Parkinson's disease, built around a meal-anchored alarm system and a phone-to-pillbox NFC confirmation pattern.

This document is the source of truth for the MedicSync mobile app. It is written for an AI coding assistant (Claude Code) to build the app phase by phase using React Native and Expo. The companion file `medicsync.html` is an interactive design prototype — refer to it for visual appearance, layout, and exact interaction behaviour.

---

## 1. Product context

### 1.1 Who this is for

People living with Parkinson's disease who take multiple medications throughout the day, often timed around meals (most commonly Levodopa, taken 30 minutes before or 1 hour after a meal). The user group experiences:

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

The user can also take a dose *earlier* than scheduled — for example, if they know they will be unable to confirm at the scheduled time. The Home screen offers a "Take dose now" action on the next-dose card that pre-confirms the dose, prevents the alarm from firing later, and logs the dose with the actual confirmation time. This is treated as a legitimate path, not an exception.

### 2.6 Behavioural design

Encourage adherence without being intrusive. Reminders escalate in volume if ignored. The NFC tap creates a habit loop. The manual path is honest about being a fallback but does not shame the user. The alarm cannot be dismissed without intent.

### 2.7 Responsiveness to changes

The app reacts immediately to any change the user makes. Editing a medication in Settings, changing a meal time, switching alarm profiles, adjusting the dose timeslots — all of these update across every relevant screen in real time. The user never has to reload, refresh, or navigate away and back to see their change reflected. This is achieved through reactive state (Zustand stores in section 8). Stale views are bugs.

### 2.8 Tone

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

**Purpose:** Show today at a glance. Allow quick adjustment of today's lunch time, early dose intake, and silence settings.

**Layout, top to bottom:**
- Greeting: "Good morning," / Name / Date
- Section: "Next dose"
  - Expanded card showing next dose:
    - "In 1h 25m" eyebrow text (live computed)
    - Medication names (one per line)
    - "Reminder at HH:MM · lunch at HH:MM" line
    - Chevron button to collapse
    - Primary "Take dose now" button — pre-confirms the dose proactively, before the alarm has fired
    - When expanded:
      - Sub-label "Shift lunch time"
      - Three buttons: +15 min, +30 min, +45 min (mutually exclusive selection)
      - "Set exact time" button → opens time picker bottom sheet
      - Feedback strip "Lunch shifted to HH:MM" with Reset button (only when shift active)
      - Sub-label "Alarm sound"
      - Two buttons: Home / Outdoors (mutually exclusive selection)
      - Silence row: bell icon, "Silence this alarm" label, toggle. When on: bell icon shows diagonal line through it, label changes to "This alarm is silenced", row darkens.
- Section: "All doses today"
- List of all doses for today, each row:
  - Status dot (done / active / future / missed)
  - Time + dose name
  - **Silence bell button** — small bell icon for that specific dose. Tapping it toggles silence for just that dose. When silenced, the bell shows a diagonal line through it.
  - Status badge

**Behaviours:**
- Tapping the chevron collapses or expands the next-dose card
- Tapping "Take dose now" triggers the manual confirmation flow for the upcoming dose. Once confirmed, the dose is logged with the actual confirmation time, the scheduled alarm for that dose is cancelled, and the "okay to eat" follow-up is scheduled based on the actual confirmation time.
- Tapping a +15/+30/+45 button selects it and updates the reminder time. Selecting another shift deselects the previous one (mutually exclusive).
- Tapping Reset clears any shift and returns to the default lunch time.
- Tapping "Set exact time" opens the bottom sheet time picker. Saving a custom time clears any +15/+30/+45 selection.
- Silence toggle on the next-dose card silences only that one alarm.
- Tapping the bell icon on any "All doses today" row toggles silence for that specific dose. Each dose is silenced independently. There is no global silence-all switch on this screen.

**Edge cases:**
- After midnight, the day's shift adjustments and per-dose silence states reset.
- If a dose is silenced, the alarm uses vibration only when it fires.
- If the user takes a dose early via "Take dose now", the next dose card automatically updates to show the following dose.

### 5.2 Schedule

**Purpose:** Give the user a transparent overview of their daily routine. Read-only summary, not a configuration screen, but allows per-dose silence toggling.

**Layout, top to bottom:**
- Greeting: "My Schedule" / "Your daily routine"
- Section: "Daily doses"
- Four routine cards, one per dose:
  - Time (large, bold)
  - Label ("Morning", "Lunch", "Afternoon", "Night")
  - Meal anchor pill (e.g. "30 min before lunch")
  - Medications list grouped by dose
  - Silence bell icon on the card — tapping toggles silence for that specific dose for today. Same per-dose silence state as on the Home screen — toggling here updates the matching row on Home, and vice versa.
- Footer line: "To change your routine, go to Settings."

**Behaviours:**
- Tapping a silence bell on any dose card silences only that dose for today. Resets at midnight.
- Per-dose silence state is shared with the Home screen — both screens reflect the same underlying state in real time.

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
- Eat ring containing a custom SVG icon (fork and plate, designed in the same line-art style as the other icons in the app — terracotta or sage stroke colour, no emoji). Match the visual weight and style of the pill icon used on the alarm screen and the home/outdoors profile icons.
- "All clear" eyebrow
- "Time to eat!"
- Body: "It has been 30 minutes since your last medication dose. Enjoy your lunch."
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

**Purpose:** Configure the user's routine, medications, alarm profiles, and relatives setup. All changes propagate in real time to every other screen.

**Sections, top to bottom:**

1. **Your medication doses** — the user's complete dose schedule lives here. Each dose is editable.
   - List of dose entries (Morning, Lunch, Afternoon, Night, etc.). Each entry shows the dose label, meal anchor (e.g. "30 min before lunch"), and the list of medications for that dose.
   - Each entry is tappable, opening a dose editor where the user can:
     - Rename the dose label
     - Set the meal anchor (which meal, before or after, how many minutes)
     - Add, remove, or edit medications and dosages within this dose
   - "Add a dose" button at the bottom of the list to create a new dose entry.
   - Any change here updates the Home screen, Schedule screen, and the alarm scheduling in real time. If the user removes a dose that was scheduled to fire later today, that alarm is cancelled. If they add one, an alarm is scheduled.

2. **Medication timing** — radio: "30 min before meal" / "1 hour after meal". This is the default that applies to new doses but can be overridden per-dose in section 1.

3. **Default meal times** — three rows: Breakfast, Lunch, Dinner. Each tappable, opens bottom sheet time picker. Changes here recompute every dose anchored to that meal in real time.

4. **Alarm profiles** — two rows: Home, Outdoors. Each tappable, opens profile editor.

5. **Language** — row showing the current language (e.g. "English" / "Dansk"). Tappable, opens language picker. Changing the language updates the entire app immediately, no restart required.

6. **Account** — sign in or create an account (optional in v1, see section 10). When signed out, this row reads "Sign in or create an account". When signed in, shows the user's email and a sign-out option.

7. **Relatives** — toggle for "Notify if dose missed", row to view relatives view. Note: requires a signed-in account if the relative is to receive remote notifications. Without an account, the relatives view works as a local-only proof-of-concept.

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
  silenced?: boolean;    // silence just this dose for today
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
  language: 'en' | 'da';
  mealTimes: { breakfast: string; lunch: string; dinner: string };
  defaultMealRelation: 'before' | 'after';
  defaultMealMinutes: 30 | 60;
  profiles: { home: AlarmProfile; outdoors: AlarmProfile };
  relativesNotifyMissedAfterMin: 15 | 30;
  relativeContact: { name: string; method: string } | null;
};

type AccountState = {
  signedIn: boolean;
  email: string | null;
  userName: string | null;     // optional, used for greeting
};
```

All data is local to the device when the user has not created an account. When signed in, settings, schedule, and history sync to the user's account. No data is shared between users without an explicit relatives connection.

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
- Body: "It has been [X] minutes since your last medication dose."
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

### Phase 1 — Design system, primitives, and localisation foundation

Deliverable: theme tokens, typography, localisation infrastructure, and reusable components in isolation.

- Set up Manrope font loading
- Create `theme.ts` with colour tokens, type scale, spacing, radii
- Set up `react-i18next` with English and Danish locale files. Even at this stage, every string in primitive components must use the `t()` function. This prevents retrofit work later.
- Build primitive components: `Button` (primary, secondary, tertiary, destructive), `Card`, `Toggle`, `Radio`, `Badge` (for all status types), `IconButton`, `BottomSheet`
- Build a single "component showcase" screen that displays all primitives, used only for development verification. Include a language switcher in the showcase to confirm strings swap correctly.
- No screens, no navigation yet

End-of-phase test: every visual element from `medicsync.html` renders correctly in isolation. Switching the locale in the showcase flips all primitive labels between English and Danish.

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

Deliverable: alarms actually fire on schedule. Manual confirmation works end to end. "OK to eat" follow-up fires. Lock screen card displays correctly.

- Request notification permissions on first launch (with explanation)
- Schedule local notifications based on the active routine
- Build the alarm screen as a full-screen modal that opens when a notification fires (or when the user taps it)
- Build the lock-screen notification card matching the design in `medicsync.html` (use the "Lock screen view" demo button to see the target). The card must show:
  - App icon and "MedicSync" label
  - "Time for your dose" title
  - Medication names and meal context
  - The NFC tap action panel (visual only — actual NFC handled in Phase 6)
  - Hint text: "Open MedicSync to confirm without pill box"
  - This is a notification category with rich content, not a custom UI we render. Configure the iOS notification category and Android notification layout to display this rich content. On iOS, this means using a Notification Content Extension if needed for the custom layout.
- Keep screen awake during alarm (when app is open)
- Play sound with volume escalation
- Handle silent mode (per-dose silence)
- Wire up the manual confirmation flow → calls `confirmDose(id, 'manual')`
- Wire up the "Take dose now" action on Home → triggers manual confirmation flow proactively, cancels the scheduled alarm for that dose
- Implement `confirmDose`: log to history, stop alarm, schedule "ok to eat", navigate to Confirmed screen
- Schedule "ok to eat" notification 30 min after confirmation (or 1 hour, per setting)
- Mark missed doses after 30 minutes of no confirmation

End-of-phase test: schedule a dose for 1 minute from now, lock the phone, wait. Notification fires on lock screen with rich card. Tap the notification, alarm screen opens. Confirm manually. App returns to home. 1 minute later (or your test interval), "ok to eat" fires.

### Phase 5 — Onboarding, polish, and edge cases

- First-launch onboarding flow per section 10.2 (welcome → language → account choice → schedule setup → notification permission → profile setup → done)
- The "Continue without an account" path is fully functional; the "Create an account" and "Sign in" paths are stubbed with a "coming soon" screen at this phase (real implementation in Phase 7)
- Empty states (no doses today, no history yet)
- Error states (notification permission denied, time picker validation)
- Late dose logging (confirm hours after due)
- Day rollover during active alarm
- Multi-medication grouping verification
- History view with last 30 days
- Animations: alarm pulse, NFC waves, confirmation pop
- Dynamic type and accessibility audit
- Full Danish translation review by a native speaker

### Phase 6 — NFC integration

- Switch from Expo Go to development builds (required for native modules)
- Add `react-native-nfc-manager`
- Implement NFC listener that runs only while an alarm is active
- On NFC tag read: call `confirmDose(id, 'nfc')`
- Test with a physical NFC tag standing in for the pill box
- Update Alarm screen to indicate NFC listener is active

### Phase 7 — Accounts and backend

Deliverable: optional account creation, sign-in, and cloud backup of user data.

- Choose backend service (recommended: Supabase for EU hosting, GDPR compliance, and minimal code)
- Implement authentication: email + password, email verification, password reset
- Implement data sync: backup of settings, schedule, and dose history to the user's account
- Implement upload-on-account-creation flow for users who started locally
- Privacy policy and terms of service in English and Danish
- GDPR compliance: account export, account deletion
- Wire up the previously-stubbed "Create account" and "Sign in" buttons in onboarding and Settings
- Account-aware relatives notifications (still placeholder for actual sending — that requires the relative to also have the app)

### Phase 8 — Hardware integration (future)

- Pairing flow with the actual pill box hardware
- Validation that the tapped tag matches the user's paired box (not just any tag)

---

## 10. Account creation and authentication

Accounts are **optional in v1**. The first-launch flow gives the user a "Continue without an account" path so they can start using the app immediately. Accounts can be created later when the user wants features that require one (currently: relatives view with remote notifications; in future: cross-device sync).

### 10.1 Why accounts are optional

Adherence to medication is the product's purpose. Friction at first launch is friction that may stop a user from ever experiencing the core flow. Forcing account creation before they can configure their first dose puts a barrier between the user and the product.

By making accounts optional, a user can:
1. Open the app
2. Set up their schedule
3. Receive their first alarm
4. Confirm a dose

…all on day one, with zero account friction. They are nudged toward creating an account when they choose to share with a relative, not before.

### 10.2 First-launch flow

When the app launches for the first time:

1. **Welcome screen** — short app introduction, tagline, "Get started" button
2. **Language picker** — defaults to system language if English or Danish, otherwise English. User can confirm or change.
3. **Account choice** — three buttons:
   - "Create an account"
   - "Sign in"
   - "Continue without an account" (slightly less prominent — secondary button styling)
4. **Schedule setup** — wizard to add the user's first medication doses. Same UX as the "Your medication doses" section in Settings, but presented as a guided flow.
5. **Notification permission request** — with a brief explanation of why
6. **Profile setup** — choose Home and Outdoors alarm sounds (use sensible defaults so this can be skipped)
7. **Done** — drops the user on the Home screen

### 10.3 Account creation flow

For users who choose "Create an account":

1. Email address
2. Password (with confirm)
3. Optional: name (used for greeting on Home screen)
4. Email verification (a code sent to their email)
5. Continue to schedule setup

For users who choose "Sign in":

1. Email + password
2. Forgot password flow (email-based reset)
3. After successful sign-in: if they have data already on this device, ask whether to upload it to their account or replace it with their account data
4. Continue to schedule setup if no schedule yet, or Home screen if they have one

### 10.4 Adding an account later

A user who started without an account sees in Settings: "Sign in or create an account" at the Account row. Tapping it opens the same flow as above. After creation, their existing local data is uploaded to their account. No data is lost.

### 10.5 Sign-out

Signing out keeps local data on the device but stops syncing. The user can sign back in to resume sync. Signing out does not delete local data.

### 10.6 Backend

V1 backend can be minimal:
- Authentication (email + password, email verification)
- A single endpoint to back up and restore the user's settings, schedule, and dose history
- A privacy policy and terms of service (required for handling health-adjacent data, especially for Danish/EU users under GDPR)
- Use Supabase, Firebase, or a similar managed service to keep this lightweight in v1

Account-related backend work happens in **Phase 7**, after the core app is feature-complete. See section 9 (Build phases).

### 10.7 GDPR and Danish privacy considerations

Health-related data (which medications a person takes, when, how reliably) is special category personal data under GDPR. For Danish users specifically:

- The privacy policy and terms must be available in Danish
- The user must give explicit consent to data processing on account creation
- The user must be able to export and delete their account at any time
- Data should be hosted in the EU
- The app should function offline for users who choose not to create an account, since their data never leaves their device in that case

---

## 11. Localisation

The app supports **English** and **Danish** in v1. Language selection is available:

- During first-launch onboarding (section 10.2)
- In Settings → Language at any time
- Defaults to system language if it is English or Danish, otherwise defaults to English

### 11.1 What gets translated

Every user-facing string: screen titles, labels, body text, button text, notification titles and bodies, error messages, the "okay to eat" notification body, status badges, alarm contract text, and onboarding flow.

### 11.2 What does not get translated

- Medication names (these are proper nouns set by the user themselves)
- User-entered text (dose labels, names)
- Time formats follow the user's system locale
- The app brand name "MedicSync"

### 11.3 Implementation

Use `i18n-js` or `react-i18next` with locale files in JSON. Structure:

```
locales/
├── en.json
└── da.json
```

Every string in the codebase is referenced by a key (e.g. `t('home.greeting.morning')`). The store holds the active language; switching it triggers an immediate re-render of every screen via the reactive state described in section 2.7.

### 11.4 Tone in Danish

Danish translations should match the warm, calm, non-clinical tone of the English copy. Use the informal "du" form (Denmark uses this universally in app interfaces and consumer products). Avoid medical jargon. Translate meaning, not words — for example, "Time for your dose" in Danish is best rendered as "Tid til din medicin" (more natural than a literal translation of "dose").

A native Danish speaker should review all translations before release. Machine translation is acceptable as a first pass but not for the final product.

---

## 12. Out of scope for v1

These are explicitly excluded from the initial build:

- Multi-device sync or cloud backup beyond account-level data sync
- Real relative notifications (only logged events for v1; relative notifications require backend, see Phase 7)
- Pill box hardware pairing (NFC only reads tags in v1)
- Languages beyond English and Danish
- Dark mode — light theme only for v1 (can be added later)
- Apple Watch or other wearables
- Integration with health platforms (Apple Health, Google Fit)
- Sharing or exporting history data
- Doctor or pharmacy integration

---

## 13. Definition of done for v1

The app is feature-complete when:

- A user can install the app, complete first-launch setup, and have their schedule running
- A user can choose to use the app without creating an account, OR create an account during onboarding or later
- Alarms fire reliably on schedule, even with the app closed, including a rich lock-screen notification card
- The user can confirm a dose manually with full intent through the checklist
- The user can take a dose proactively early via "Take dose now"
- The "okay to eat" notification fires correctly based on user setting
- Daily adjustments (shifts, per-dose silence) work and reset correctly at midnight
- History accurately reflects taken (manual), missed, and upcoming doses
- All settings persist across app restarts and sync to the user's account when signed in
- Edits in Settings (medications, meal times, language, profiles) propagate immediately to every screen — no stale views
- The full app is available in English and Danish, with language switchable at any time
- The app feels warm, calm, and unhurried — never clinical
- The codebase is structured so that NFC can be added in a single isolated module
- A privacy policy and terms of service are available in English and Danish, and GDPR-compliant export and delete flows work for accounts

---

## 14. Reference files

- `medicsync.html` — interactive prototype showing every screen, animation, and interaction
- This file (`SPEC.md`) — written specification of behaviour, data model, and build phases

When implementation details conflict, this document is authoritative. When visual details conflict, the HTML prototype is authoritative.
