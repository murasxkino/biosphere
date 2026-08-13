# FUTURE CHANGES

> **Sealed until publication.** Nothing in this document is to be designed, built, or started until BIOSPHERE v1.0 is live on the App Store. It exists so that the work waiting on the other side of launch is written down while the thinking is fresh — not so that it can be pulled forward. If you are reading this before the app has shipped, close it and return to ROADMAP.md.

## Why this document exists separately

BACKLOG.md is a parking lot: candidate features at any point in the project's life, plus the permanent refusals. It answers *what might we build*.

This file answers something BACKLOG cannot, because the answer only becomes true on launch day: **how the project works once real people depend on it.** Publication changes the physics of the project, and those changed rules deserve to be written down before we are standing in them.

One fact, one home: candidate features still live in BACKLOG.md and still pass the immersion test before they graduate. What lives here is the post-publication operating contract and the sequenced queue.

## What changes the day the app ships

Everything below is a new constraint that does not exist today.

1. **The reset button stops being harmless.** Today a two-step reset costs a test fixture. After launch it costs somebody's journal — months of their own honest sentences. Destructive paths need to be re-examined with that in mind, and any migration that touches `biosphere-journal-v1` must be additive and reversible.

2. **Schema changes become one-way doors.** ENGINEERING_GUIDE's storage discipline (versioned keys, new key + one-time migration read, never mutate an existing key's meaning) stops being good hygiene and becomes the difference between an update and a data-loss incident. Every release must load and preserve data written by every earlier release.

3. **Releases are gated and slow.** A change is no longer live when it is merged; it is live when Apple approves it, and users adopt it when they choose to. Bugs cannot be hot-fixed in minutes. This argues for smaller, more conservative releases and a real TestFlight soak before each one.

4. **The version number becomes user-facing.** SemVer stops being internal bookkeeping.

5. **Feedback arrives without being asked for.** Reviews, ratings, and mail. This is genuinely useful signal and also the strongest pull toward the things DESIGN_PHILOSOPHY refuses. **A feature request is not a mandate.** The permanent refusals in BACKLOG.md do not become negotiable because users ask — that is precisely when they matter. Volume is not an argument.

6. **We still cannot measure.** No analytics remains a permanent refusal (NFR-3). So we will never know how many people finish onboarding, or whether a change helped. Every post-launch judgment is made the way every judgment has been made so far: against the immersion test, the owner's ear and eye, and direct human feedback. Do not let the absence of numbers become an argument for collecting them.

## The queue

### 1. A first-run tutorial — *the reason this file exists*

**The problem is real.** BIOSPHERE's central design decision is an asymmetry: the day is for being, and the night is for accounting (IMMERSION_PRINCIPLES 3). There are deliberately no daytime checkboxes — habits float as text, and the only yes/no in the entire app lives inside the Grey Night. That is the product. It is also genuinely non-obvious. A new user can enter a biosphere, see a few floating words, find nothing to press, and conclude the app is beautiful and empty. Onboard.tsx states the idea in a sentence, but a sentence read once at the threshold is not the same as understanding it.

**The trap is equally real.** Every conventional answer to this problem is forbidden here. Coach marks, tooltips, spotlight overlays, a "next" button walking someone through the chrome, a dismissible tips card, a "did you know?" — each one is the interface asserting itself over the world, which is the exact failure VISION.md is written to prevent. A tutorial that teaches the app while breaking the spell has taught the wrong thing.

**So the constraint is:** *the world teaches, not the interface.* Whatever is built must be indistinguishable from the experience itself. Some directions worth exploring when the time comes, none of them decided:

- **The first day is gently narrated by the world.** One extra line of serif italic, in the voice already used for *the day settles* and *rest well*, appearing the first time a user enters any biosphere and fading with the rest of the chrome. Not a tooltip — the same floating text the habits already use.
- **The first Grey Night explains itself slightly more.** The reflection flow is where the asymmetry finally makes sense; a single additional line on the intro screen, shown only on the first night ever sealed, may be the whole tutorial.
- **Teach by arrival, not instruction.** The strongest version may be that the user simply *arrives* at their first Grey Night and discovers the accounting waiting for them — in which case the work is making sure they reach that first night at all, which is a retention question, not a tutorial question.
- **Absolutely not:** progress checklists, "complete the tour" states, gamified first-run rewards, or anything that must be dismissed.

**Constraints on whatever is chosen:**
- It happens **once**, is never repeatable, and leaves no permanent chrome behind.
- It must be skippable by simply continuing — never by pressing "skip".
- Copy answers to UX_GUIDELINES' style sheet; the serif italic voice is the only one permitted to speak to the user as a person.
- It must survive `prefers-reduced-motion` and be legible at the app's contrast floor.
- It is stored as a one-time flag in the config key, additive, absent-means-not-yet-shown — and clearing it must never be the only way to see the app work.
- **It passes the immersion test or it does not ship:** *does this make the world more real, or the app more present?*

**How we will know it worked:** we won't, not numerically, and that is by design (see §6 above). It will be judged by the owner walking a fresh install as a stranger would, and by what real users say unprompted.

### 2. Everything else

Candidates continue to live in **BACKLOG.md** and graduate the same way they always have: the immersion test, then explicit approval. Several of them change character once there are real users, and those are the ones to look at first:

- **Journal export** stops being a nicety and becomes a matter of data ownership — people should be able to take their own words with them.
- **Import / restore** pairs with it, and needs a pre-reset snapshot design that does not exist yet.
- **Localization** becomes possible to justify only once there is evidence of who is actually using this.

## When this file opens

On the day v1.0 is live: strike the seal at the top, move the tutorial into TODO.md as a real milestone, and let ROADMAP.md carry the sequence from there. Until then this document is a letter to whoever picks the project up next — quite possibly the same two of us — and it is not an instruction.
