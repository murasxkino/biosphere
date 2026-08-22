# BACKLOG

Nothing here is scheduled. Every item must pass the immersion test (*does this make the world more real, or the app more present?*) and receive explicit approval before entering TODO.md.

## Deferred — plausible futures

- **Journal export** (markdown/JSON download). Ownership of one's reflections; low immersion risk if confined to Settings › Data.
- **Weekday/weekend schedule templates.** Real lives differ by day; must not add home-screen chrome — likely a Settings-only switch.
- **Seasonal scene variants** (winter forest, summer tundra dusk). Deepens the world; pure scene-layer work, zero UI cost.
- **Per-scene ambient mix** (e.g., more birds, less wind). A single "character" slider at most; a mixer panel would violate minimalism.
- **Gentle in-app phase cue enhancements** (e.g., slightly longer scene overlap at transitions). Sound/visual only — never a notification.
- **Native/PWA migration via Claude Code.** Unlocks the two known platform limits: push notifications for biosphere changes and installability. Large; post-1.0; ARCHITECTURE.md ADR-1 keeps the split cheap. _(The native half shipped in M7; only the notification question below remains of this item.)_
- **A biosphere-change notification, to carry the crossing chime past a dark screen.** Requested by the owner 2026-08-22 after hearing the transition on device, and **parked until after 1.0 in the same conversation** — deliberately, not by omission. If it is ever built, the owner's shape is settled: **a Settings toggle, off by default**, so the app's out-of-box behaviour stays exactly what PRIVACY_POLICY and STORE_LISTING promise and only someone who asks for it is ever interrupted. Note what it costs before starting: it contradicts PRODUCT_REQUIREMENTS' non-requirements ("phase-change and re-engagement notifications remain permanently refused"), IMMERSION_PRINCIPLES 9, FEATURE_SPEC §3.11's "the only notification BIOSPHERE will ever send", and the same sentence as printed in the privacy policy and the store listing — six documents to amend honestly, two of them published. Also unresolved: when permission would be asked, given today's rule that it is only ever requested at a first timer start.
- **Haptics on seal/chime** (native only).
- **Localization.** Copy is small and centralized enough; needs a voice-preserving translation pass, not just strings.
- **Import/restore** of a previous reset's data (would require pre-reset snapshot design).

## Permanent refusals

These will not be built in any version; they contradict DESIGN_PHILOSOPHY.md.

- Gamification of any form: points, badges, levels, streak flames, celebrations, leaderboards.
- Social features, sharing feeds, comparison.
- Engagement notifications, nags, "we miss you" messaging.
- Advertising, sponsorship placements, upsells inside the experience.
- Daytime completion controls (checkboxes anywhere outside the Grey Night).
- Red anything.
