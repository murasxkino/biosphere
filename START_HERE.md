# START HERE

This folder is everything BIOSPHERE needs to move into Claude Code. Two items:

- `biosphere.jsx` — the working app, v0.3.0-alpha, verified (parse-clean, zero undefined references, SSR smoke-tested).
- `biosphere-docs/` — the 19-document project constitution: product spec, architecture, design philosophy, the audio engine's sound recipes, the migration assessment, and the operating rules Claude Code should follow (`CLAUDE.md`).

## What to do with it

1. Unzip this somewhere on your machine, e.g. `~/biosphere-handoff/`.
2. Make sure Claude Code is installed:
   ```
   npm install -g @anthropic-ai/claude-code
   ```
   (Full docs: https://docs.claude.com/en/docs/claude-code/overview)
3. Open a terminal in the unzipped folder and start Claude Code:
   ```
   cd ~/biosphere-handoff
   claude
   ```
4. If you already created a GitHub repo for this, connect it:
   ```
   git init
   git remote add origin <your-repo-url>
   ```
   Otherwise just tell Claude Code to create one for you in the next step — it can run `gh repo create` itself (prompting you to `gh auth login` first if needed).
5. Paste this as your first message to Claude Code:

   > This folder contains BIOSPHERE, an app currently built as a single React artifact (`biosphere.jsx`) with a full documentation constitution in `biosphere-docs/`, including `CLAUDE.md` (your operating rules), `FEATURE_SPEC.md`, `ARCHITECTURE.md`, and `MIGRATION.md` — which is the exact bootstrap plan for this move: Vite + React + TypeScript scaffold, the module split table, StorageAdapter, test plan, and a permanent `build:artifact` target. Read `CLAUDE.md` and `MIGRATION.md` first, then execute Milestone M3 as specified there: scaffold the repo, commit `biosphere.jsx` verbatim as `legacy/biosphere.artifact.jsx`, split it into modules per the table, add the StorageAdapter, and get the test suite green. Stop for my approval before moving on to M4.

That's the whole handoff. Claude Code will read the docs, do the scaffold, and commit as it goes — real commits landing in GitHub while it works.

## More detail if you want it

`biosphere-docs/GETTING_STARTED_IN_CLAUDE_CODE.md` covers the same steps with a bit more explanation and a troubleshooting note for GitHub auth.
