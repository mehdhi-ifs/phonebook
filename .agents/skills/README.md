# Developing with Agent Skills

This repo ships with [Matt Pocock's skillset](https://github.com/mattpocock/skills) — a curated set of **agent skills** that turn your AI coding agent (Cursor, Claude Code, etc.) into a disciplined teammate that follows a repeatable engineering workflow.

This README is the on-ramp: what skills are, how to trigger them, and the recommended order for taking a feature from idea to merged code.

## What is an agent skill?

A skill is a small Markdown file (`SKILL.md`) with a name, a description, and a set of instructions. The agent reads every skill's **description** up front and automatically loads the full instructions when your request matches. So most of the time you don't "run" a skill — you just describe what you want and the right skill kicks in.

Each skill lives in its own folder under `.agents/skills/`:

```
.agents/skills/
├── README.md                 # you are here
├── tdd/SKILL.md
├── diagnose/SKILL.md
├── to-prd/SKILL.md
└── ...
```

The `skills-lock.json` at the repo root pins each skill to its source and a content hash, so everyone on the team gets the exact same versions.

## How to trigger a skill

You have three ways to invoke a skill, from most to least implicit:

1. **Just ask.** Describe the task in natural language. The agent matches your request against skill descriptions and loads the relevant one. Example: *"This function throws on empty input — debug it"* loads `diagnose`.
2. **Name the trigger phrase.** Many skills list trigger words in their description (e.g. *"grill me"*, *"red-green-refactor"*, *"caveman mode"*). Saying the phrase reliably activates the skill.
3. **Slash command.** Some skills are exposed as commands (e.g. `/caveman`). Type the slash command directly.

To see exactly what activates a skill, open its `SKILL.md` and read the `description:` line in the frontmatter — that's the only thing the agent sees when deciding whether to load it.

## First-time setup (do this once per repo)

Before using the **engineering** skills, run the setup skill so they know this repo's conventions — where issues live, your triage labels, and where domain docs go:

> **Prompt:** *"Run setup-matt-pocock-skills."*

This is interactive. It walks you through three decisions one at a time:

- **Issue tracker** — GitHub, GitLab, local Markdown under `.scratch/`, or something else.
- **Triage labels** — the label strings for the five triage states.
- **Domain docs** — single-context (`CONTEXT.md` + `docs/adr/`) vs multi-context.

It writes an `## Agent skills` block into `AGENTS.md`/`CLAUDE.md` plus `docs/agents/*.md`. The engineering skills read those files, so **this repo isn't fully configured until you run it** (there's currently no `AGENTS.md`/`CLAUDE.md` or `docs/agents/` here yet).

## The engineering golden path

These skills are designed to chain together. A typical feature flows like this:

```
idea / conversation
      │
      ▼
  to-prd ──────────►  PRD published to the issue tracker
      │
      ▼
  to-issues ───────►  PRD sliced into small, grabbable issues (tracer-bullet vertical slices)
      │
      ▼
  triage ──────────►  issues moved through a state machine, labelled, made AFK-ready
      │
      ▼
  tdd ─────────────►  build the feature red-green-refactor
  diagnose ────────►  (when something breaks) reproduce → minimise → fix → regression-test
      │
      ▼
  review ──────────►  check changes against repo standards + the originating spec
```

Supporting skills you'll reach for along the way:

| Skill | Use it when |
| --- | --- |
| `grill-me` | You want your plan/design stress-tested before you commit to it. |
| `grill-with-docs` | Same, but challenged against the existing domain model and docs. |
| `prototype` | You want a throwaway prototype to feel out a data model or UI before building for real. |
| `design-an-interface` | You want several radically different API/module shapes compared side by side. |
| `request-refactor-plan` | You need a refactor broken into safe, tiny commits. |
| `improve-codebase-architecture` | You want to find deepening/refactoring opportunities across the codebase. |
| `zoom-out` | You're lost in a section of code and need the bigger picture. |
| `ubiquitous-language` | You want a DDD glossary of domain terms extracted and hardened. |
| `setup-pre-commit` | You want Husky + lint-staged (Prettier), type-check, and tests on commit. |
| `migrate-to-shoehorn` | You want to replace `as` type assertions in tests with `shoehorn`. |
| `handoff` | You're ending a session and want a handoff doc for the next agent. |
| `qa` | You want to report bugs conversationally and have them filed as issues. |

## Other skills in this set

**Writing & content** (for docs, articles, notes):
`writing-fragments`, `writing-shape`, `writing-beats`, `edit-article`, `obsidian-vault`, `scaffold-exercises`.

**Productivity & meta:**
`caveman` (ultra-terse responses), `teach` (learn a concept in-repo), `write-a-skill` (author new skills).

## A worked example: starting the phonebook

This repo is greenfield — it only has `docs/requirements-phase*.md` so far. A realistic first session:

1. **Configure the repo.** *"Run setup-matt-pocock-skills"* and pick your issue tracker.
2. **Turn requirements into a PRD.** Open `docs/requirements-phase1.md`, then: *"Turn this into a PRD"* (`to-prd`).
3. **Slice the PRD into issues.** *"Break this PRD into issues"* (`to-issues`).
4. **Pick an issue and build it test-first.** *"Implement issue #1 with TDD"* (`tdd`).
5. **Review before merge.** *"Review my changes since main"* (`review`).
6. **Hit a bug?** *"Diagnose this failing test"* (`diagnose`).

## Authoring or updating skills

- **Add a new skill:** *"Use write-a-skill to create a skill that …"*. Keep `SKILL.md` under ~100 lines and put a clear `Use when …` clause in the description.
- **Update pinned skills:** skills are sourced from `mattpocock/skills` (see `skills-lock.json`). Re-sync through whatever skills manager installed them rather than hand-editing the lock file.

## Reference

- Source skillset: https://github.com/mattpocock/skills
- Per-skill details: open the `SKILL.md` inside any skill folder.
