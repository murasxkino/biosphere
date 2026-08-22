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

## Before publishing

Replace both placeholders, in `privacy.html` and `support.html`:

| Placeholder | Value |
|---|---|
| `TKTK_SUPPORT_EMAIL` | The public support address (STORE_LISTING § Decisions 1) |
| `TKTK_EFFECTIVE_DATE` | The release date (STORE_LISTING § Decisions 4) |

`grep -r TKTK site/` returns nothing when they are all filled. The address goes
on a permanently public page and into App Store Connect, so a dedicated one is
worth more than a personal one.
