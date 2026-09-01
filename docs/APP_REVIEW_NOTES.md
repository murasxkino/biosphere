# App Review notes

Answers to the questions App Store Connect asks in the **App Review Information → Notes** field. Kept here so they are versioned and can be corrected rather than rewritten from memory each submission.

Written 2026-08-30 for version 1.0. **Facts, not marketing** — every claim below is checkable against this repository.

---

## 2. Devices and operating systems tested on

| Device | OS | Kind of testing |
|---|---|---|
| **iPhone 16** | iOS 26.6 | Physical device. Primary test target: full feature pass, audio behaviour, notifications, haptics, accessibility, and a three-minute frame-rate profile. |
| iPhone 17 Pro Max | iOS 26.5 | Simulator. Full walkthrough; store screenshots. |
| iPhone 17 Pro | iOS 26.5 | Simulator. Boot and navigation. |
| iPad Pro 13-inch (M5) | iOS 26.5 | Simulator. Layout verification; store screenshots. |

Minimum supported version is **iOS 15.0**; the app is universal (iPhone and iPad).

On the physical iPhone we specifically verified: audio continues with the ring switch silenced, audio survives the screen locking, audio recovers after an interrupting phone call, the focus-timer notification fires from the background and is cancelled on all three abandonment paths, both haptics fire, OS-level Reduce Motion stills every scene and makes transitions instant, and the scene loop holds 60 fps using about 6% of its frame budget.

## 3. What the app does, who it is for, and why

**BIOSPHERE turns a person's day into a sequence of landscapes they step into.**

The user divides their day into **biospheres** — named, timed stretches with a purpose, such as *Tundra · deep focus* in the morning or *Mountain · spiritual practice* in the evening. Habits live inside the biosphere where they belong, not in one undifferentiated list. Each biosphere is a full-screen animated scene with its own synthesized soundscape and recorded soundtrack. Optional focus timers are available for habits that want them.

There are **no completion controls during the day**. Nothing can be ticked off while living it. At an hour the user chooses, the **Grey Night** falls, and only then does the app ask, one habit at a time: *Did you complete this today?* — with room for a few words of reflection. The day is then **sealed**, and the journal records it permanently. A **Stillness** view shows streaks and a 28-day rhythm.

**The problem it solves.** Habit trackers optimise for streak pressure and notification volume, which makes people anxious about their tools rather than attentive to their lives. BIOSPHERE inverts that: it is quiet by construction, it refuses gamification, and it asks for honesty once a day rather than compliance all day.

**Who it is for.** People who want a calm, private daily practice — reflection, focus, spiritual habits, physical training — and who find conventional habit apps noisy or shaming.

**Deliberate non-features**, all permanent: no accounts, no social features or sharing, no streak-shaming, no advertising, no in-app purchases, no engagement notifications, no gamification (no points, badges, levels, or confetti). The single notification the app can send is the one the user asks for by starting a focus timer.

## 4. Setting up and accessing the main features

**No login, no account, no sample files, and no configuration are required.** There is nothing to sign up for and no server to reach. On first launch the app presents a short onboarding screen; tap **Enter** and it is fully usable. It ships with five example biospheres and habits so nothing is empty.

Three things are worth knowing in order to review it properly:

**To reach the Grey Night — the reflection and sealing flow, which is the core of the product.** It is time-gated and appears only after the hour the user sets. If you are reviewing during the day you will not see it by default. To reach it immediately:

> Tap the **sun icon** (rightmost of the four icons, top right of the home screen) to open **Settings** → scroll past the list of biospheres to the card labelled **Grey Night — *reflection begins*** → set its time to a few minutes **before the current time** → tap the back arrow → a **Grey Night** tile now appears at the bottom of the home timeline, reading *the day settles — enter to reflect* → tap it → **Begin**.

You can then answer each habit, write a reflection, and seal the day. Sealed days appear in the **Journal** (the document icon) and feed **Stillness** (the seedling icon).

**Sound starts on the first tap, never at launch.** This is deliberate. If the app seems silent, tap the speaker icon in the top-right of any screen. The app is designed to keep playing with the ring switch silenced and while the screen is locked, which is why it declares the audio background mode.

**The notification permission prompt appears when a focus timer is first started**, not at launch. To see it: enter any biosphere, tap a habit that shows a duration, and the prompt appears at that moment. Declining costs nothing else in the app.

## 5. External services, tools, and platforms used

**None.** The app makes no network requests of any kind, at any time. It has no backend, and there is no server to which it could connect.

Specifically, BIOSPHERE uses **no** data providers, **no** authentication service, **no** payment processor (it is free, with no in-app purchases), **no** AI or machine-learning service, **no** analytics or crash-reporting SDK, **no** advertising or attribution SDK, and **no** cloud storage or sync.

Everything the app needs is inside the app bundle: the five soundtrack pieces are bundled AAC files, the two typefaces are bundled font files, and every landscape is drawn procedurally in code rather than fetched or stored as artwork. All of a user's data — their setup and their journal — is written to the app's own private on-device storage and never leaves the device.

The app is built with React and Capacitor and uses two Capacitor plugins, **Local Notifications** and **Haptics**. Both operate entirely on-device and neither contacts a network. There are no other runtime dependencies.

## 6. Regional differences

**There are none.** The app functions identically in every region and on every carrier. No feature, screen, or piece of content is enabled, disabled, or varied by country, region, or locale, and nothing is region-locked.

For completeness: times and dates are *formatted* using the device's own locale settings, so a user whose device is set to a 24-hour clock sees `17:00` where another sees `5:00 PM`. This is presentation only — the behaviour, the features, and the content are the same everywhere. The app is currently localised in English only.

## 7. Regulated industries and protected third-party material

**Neither applies.** BIOSPHERE does not operate in a regulated industry. It is not a medical, health, mental-health, financial, gambling, dating, or telecommunications app. It makes no medical or therapeutic claims, provides no advice, and does not collect, process, or transmit any personal or health data.

**All content in the app is the developer's own or is properly licensed:**

- **The five soundtrack pieces are the developer's own original recordings.** They are not licensed from any library or third party. The source masters are held in the project repository.
- **All landscapes and animations** are generated procedurally in code. There is no stock imagery, video, or third-party artwork anywhere in the app.
- **The app icon** is the developer's own artwork.
- **All text** in the app is the developer's own.
- **Two typefaces** — Cormorant Garamond and Outfit — are open-source under the SIL Open Font License 1.1, which expressly permits bundling in an application. The full licence text for each ships inside the app, alongside the font files, as the licence requires. Neither family declares a Reserved Font Name and neither requires attribution in the interface.

No third-party content requires clearance, and no credentials or authorisations are needed to provide anything the app offers.
