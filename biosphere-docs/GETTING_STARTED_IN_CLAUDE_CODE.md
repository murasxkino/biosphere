# Getting BIOSPHERE into Claude Code + GitHub

This chat can't install software or open a terminal on your machine, so this part happens on your side — but it's short. Everything the project needs (the app, the 17-doc constitution, MIGRATION.md's bootstrap spec) is already written and ready to hand over.

## 1. Install Claude Code (if you haven't)

Claude Code is a separate app from claude.ai — it runs in a terminal, VS Code, JetBrains, or its own desktop app, and it has real filesystem and git access.

```
npm install -g @anthropic-ai/claude-code
```

Then run `claude` in a terminal to sign in. Full install docs (all platforms): https://docs.claude.com/en/docs/claude-code/overview

## 2. Create the GitHub repo

Pick one:

**Option A — GitHub's website:** create a new empty repo (e.g. `biosphere`), public or private, no README/license yet (Claude Code will add those). Copy its URL.

**Option B — let Claude Code do it.** Once Claude Code is open (step 4), you can just say *"create a new GitHub repo called biosphere and push to it"* — it uses the `gh` CLI under the hood. If `gh` isn't installed or authenticated, Claude Code will tell you and walk you through `gh auth login`.

## 3. Download this project's files

From this conversation, save to one local folder (e.g. `~/biosphere-handoff/`):
- `biosphere.jsx` (the v0.3.0-alpha app)
- the whole `biosphere-docs/` folder (all 17 documents + MIGRATION.md + this file)

## 4. Open Claude Code in that folder and connect GitHub

```
cd ~/biosphere-handoff
claude
```

If you created the repo yourself in step 2A, connect it now:
```
git init
git remote add origin <your-repo-url>
```
If you're letting Claude Code create the repo (2B), skip this — it'll handle `git init`, `gh repo create`, and the remote for you.

## 5. Your first prompt to Claude Code

Paste something like this:

> This folder contains BIOSPHERE, an app currently built as a single React artifact (`biosphere.jsx`) with a full documentation constitution in `biosphere-docs/`, including `CLAUDE.md` (your operating rules), `FEATURE_SPEC.md`, `ARCHITECTURE.md`, and `MIGRATION.md` — which is the exact bootstrap plan for this move: Vite + React + TypeScript scaffold, the module split table, StorageAdapter, test plan, and a permanent `build:artifact` target. Read `CLAUDE.md` and `MIGRATION.md` first, then execute Milestone M3 as specified there: scaffold the repo, commit `biosphere.jsx` verbatim as `legacy/biosphere.artifact.jsx`, split it into modules per the table, add the StorageAdapter, and get the test suite green. Stop for my approval before moving on to M4.

Claude Code will read the docs, do the scaffold, and commit as it goes — you'll see real commits land in the GitHub repo as it works.

## What happens to this conversation

Nothing — it stays as the project's history up to this point. Once the repo exists, git becomes the source of truth going forward (per the CLAUDE.md addendum specified in MIGRATION.md §5), and this conversation is just the archive of how BIOSPHERE got here.

## If you get stuck

- Claude Code not authenticating with GitHub → check `gh auth status`, re-run `gh auth login`.
- Want CI so Claude Code can respond to GitHub issues/PRs automatically later → that's a separate, optional step (the official `anthropics/claude-code-action` GitHub Action) — worth revisiting after M3 is stable, not before.
