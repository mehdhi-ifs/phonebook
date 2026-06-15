# Getting Started — UXFF Jump Start AI Mini Bootcamp

Welcome! This repo is a hands-on mini project for the **UXFF Jump Start AI Mini Bootcamp**.
You'll build a small **Phone Book** app end to end, AI-assisted, using your Cursor agent
and Matt Pocock's agent skillset (already installed in this repo).

> ⏱️ Core development time at the bootcamp is **2 hours**.

## 1. Requirements

Sort these out **before** the bootcamp:

- **Cursor installed with an active subscription.** We drive the whole project through
  Cursor's AI agent, so a working install with a paid plan is essential.
  **If you don't have access to a Cursor license, reach out to us** and we'll get you set up.
- **Node.js** installed (for the React app, and the Phase 3 backend).
  It's available in the **IFS Software Center** — install it from there.
- This repo cloned locally and opened in Cursor (see below).

## 1.1 Get the repo

The project lives at **https://github.com/mehdhi-ifs/phonebook**.

Clone it and open it in Cursor:

```bash
git clone https://github.com/mehdhi-ifs/phonebook.git
cd phonebook
```

Then in Cursor: **File → Open Folder…** and select the `phonebook` folder.

## 2. How the project is structured

The requirements are already written for you in [`docs/`](./docs), split into three phases
that must be completed **strictly in order (1 → 2 → 3)**. Each phase has clear
Acceptance Criteria and a Definition of Done.

| Phase | What you build | When |
| --- | --- | --- |
| **[Phase 1](./docs/requirements-phase1.md)** — View & Add Contacts | A minimal React slice: view contacts + add one (name + single phone). | **Prerequisite — attempt before the bootcamp.** |
| **[Phase 2](./docs/requirements-phase2.md)** — Full CRUD & Multiple Phones | Edit/delete contacts, multiple phone numbers per contact. | **Built together at the bootcamp.** |
| **[Phase 3](./docs/requirements-phase3.md)** — Backend, Search & Duplicates | Node.js + SQLite REST API, search, duplicate detection. | **Optional stretch — after Phase 2.** |

## 3. Working with AI Skills

This project is built using **Matt Pocock's agent skillset**, installed under
[`.agents/skills/`](./.agents/skills). Instead of hand-writing everything, you drive
the work through your Cursor agent using these skills (TDD, diagnose, review, and more).

- Read the skills guide first: [`.agents/skills/README.md`](./.agents/skills/README.md).
- The skillset is based on **Matt Pocock's videos** — watch the provided videos before
  the session so you're comfortable with the skill-driven workflow.

## 4. Before the bootcamp — checklist

- [ ] Install Cursor and confirm your subscription is active (contact us if you need a license).
- [ ] Install Node.js (available in the **IFS Software Center**).
- [ ] Clone the repo (`git clone https://github.com/mehdhi-ifs/phonebook.git`) and open it in Cursor.
- [ ] Watch the provided Matt Pocock videos.
- [ ] Read [`.agents/skills/README.md`](./.agents/skills/README.md).
- [ ] Read [`docs/requirements-phase1.md`](./docs/requirements-phase1.md) and **attempt Phase 1**.

## 5. At the bootcamp

Come with Phase 1 working (or your best attempt) and your questions. We'll build Phase 2
together, and Phase 3 is there for anyone who wants to keep going.

See you there! 🚀
