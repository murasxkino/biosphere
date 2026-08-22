# The public pages

Three static pages for App Store Connect, which requires a reachable **privacy
policy URL** and a **support URL** before submission.

- `privacy.html` — a faithful rendering of `docs/PRIVACY_POLICY.md`, which stays
  the source of truth. Change the policy there first, then mirror it here.
- `support.html` — the support URL, answering the three things most likely to
  send someone looking: where their data lives, why the app is silent, and why a
  timer didn't notify them.
- `index.html` — a landing page so the URLs have somewhere to belong.

Styled as the app is (`#05070b`, Cormorant Garamond and Outfit) so the policy
reads as part of the world rather than a legal annex bolted onto it.

## Publishing

`murasxkino/biosphere` is **private and must stay private**; GitHub Pages will
not serve from a private repo on a free plan. These files are therefore mirrored
to a **separate public repo** with Pages enabled. Copy the directory across and
push; nothing here depends on the app repo.

## Settled 2026-08-22

- **Support address:** `biospheresupport@gmail.com` — a dedicated mailbox, not a
  personal one, because it goes on a permanently public page and into App Store
  Connect. Use the same address in both places.
- **Effective date:** phrased as *from the first public release*, rather than a
  guessed calendar date. It is accurate whenever the app ships and removes a
  decision that would otherwise have to be revisited on submission day. If the
  policy ever changes after release, record the date of that change.

`grep -r TKTK site/` should stay empty.
