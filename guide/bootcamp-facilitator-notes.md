# Bootcamp Facilitator Note — Skill-Driven Workflow (Phase 1, end to end)

A complete recap of the workflow we ran to take Phase 1 from a requirements doc
to a tested, reviewed, working feature — entirely skill-driven. Use this to guide
attendees through the same path and to show them the decisions that mattered.

The idea: don't hand-write everything. Drive the work through Matt Pocock's agent
skills, and make the design decisions deliberately at each step.

---

## 1. The full path we followed

| Step | Skill | Output |
| --- | --- | --- |
| 1 | `to-prd` | `.scratch/prd-phase1-view-add-contacts.md` |
| 2 | `grill-me` | Decisions baked back into the PRD |
| 3 | `to-issues` | `.scratch/issues/001..003` (3 vertical slices) |
| 4 | `tdd` | Working code, 9 passing tests |
| 5 | `review` (Bugbot) | "No bugs found" |

The repo started **greenfield** — only `docs/requirements-phase*.md` and the
skills. No `package.json`, `src/` had just an empty `assets/` folder, and
`setup-matt-pocock-skills` had not been run (no `AGENTS.md`, no `docs/agents/`),
so there was no configured issue tracker.

---

## 2. Decisions made (and why)

### Process / setup decisions

- **Issue tracker:** none was configured, so we published the PRD and issues as
  **local Markdown under `.scratch/`** (chosen over GitHub Issues). `ready-for-agent`
  is recorded in each file's header instead of as a tracker label.
- **Real lesson:** run `setup-matt-pocock-skills` first so the engineering skills
  know where issues live.

### Design decisions (from the `grill-me` session)

These were decided one at a time, agent-recommends / human-chooses:

| # | Decision | Choice |
| --- | --- | --- |
| 1 | Toolchain | Scaffolding Vite + React + TS + Vitest is the **first issue**, before any feature work |
| 2 | Name mapping | Single name input → whole trimmed string into `ContactName.first`; `last`/`display` left unset |
| 3 | Empty guard | **Trim before validating AND store trimmed values**; whitespace-only counts as empty |
| 4 | Guard UX | **Disable the Add button** until both fields are non-empty (not a silent no-op, not inline error text) |
| 5 | ID generation | `crypto.randomUUID()` for both contact and phone ids (no external lib) |
| 6 | List order | **Append** (insertion order); no sorting |
| 7 | CSS | **Single global stylesheet** with **CSS custom properties for M3 tokens** (not CSS Modules, not inline styles) |
| 8 | Submission | Real `<form>` + `onSubmit`, button `type="submit"` → Enter submits |
| 9 | Input labeling | **Visible `<label>`** elements; tests query via `getByLabelText` |

Ripple effect worth highlighting: choosing the **disabled button** (decision 4)
changed the tests — the empty-field cases assert the button is *disabled* rather
than "clicking adds nothing" (you can't click a disabled button).

### Data-model decision

- Adopt the **full `Contact` shape now** (with `emails` and `addresses`
  initialized to `[]`) even though Phase 1 doesn't expose them — avoids a
  migration in later phases.

### Testing decisions

- **Test at the highest seam:** drive everything through `<App />` via the DOM.
  Never test `ContactList` / `ContactCard` / `AddContactForm` in isolation.
- **Tooling:** Vitest + React Testing Library + `user-event`.
- **One testability seam added:** `App` takes an optional `initialContacts` prop
  (defaults to `[]`) so the view could be verified before the Add form existed.
  This does not break the "useState only / no global state" constraint.

---

## 3. How Phase 1 was sliced (the 3 issues)

All AFK, simple dependency chain 1 → 2 → 3:

1. **001 — Scaffold the toolchain.** Vite + React + TS + Vitest + RTL; `App`
   renders a heading; one smoke test passes. (Enabler.)
2. **002 — View contacts.** `Contact` type, `App` state, `ContactList`,
   `ContactCard`, empty state, global M3 stylesheet. (User stories 1–4, 13–14.)
3. **003 — Add contact.** Labeled form, disabled-button guard, append to state,
   reset, Enter-submit. (User stories 5–15.)

Each slice is a **vertical tracer bullet** — cuts through state + UI + styling +
tests — so it is demoable on its own.

---

## 4. The TDD cycles (red → green, one at a time)

Smoke test first (tracer bullet), then:

1. Empty app shows "No contacts yet"
2. Given contacts, each renders with name + primary phone
3. Add button disabled while name/phone empty (incl. whitespace-only)
4. Submit adds a contact; it appears in the list (inputs found by label)
5. Inputs clear after a successful add
6. Pressing Enter in a filled form submits
7. Adding multiple contacts shows all, in insertion order

**Key TDD rule we followed:** vertical slices, not horizontal — one test → one
bit of implementation → repeat. Never "write all tests, then all code."

---

## 5. Final state of Phase 1

- Files: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`,
  `src/main.tsx`, `src/App.tsx`, `src/types.ts`,
  `src/components/{ContactList,ContactCard,AddContactForm}.tsx`,
  `src/index.css`, `src/App.test.tsx`, `src/test/setup.ts`.
- `npm run test` → **9 passed**
- `npm run build` → clean (no TS errors)
- Lints → none
- Bugbot review → **no bugs found**
- `npm run dev` → runnable app

---

## 6. Quick checklist for an attendee

- [ ] Cursor installed + active subscription; Node.js installed.
- [ ] Repo cloned and opened in Cursor.
- [ ] Run `setup-matt-pocock-skills` and pick an issue tracker.
- [ ] Read `docs/requirements-phase1.md`.
- [ ] `/to-prd` on the requirements → review the generated PRD.
- [ ] `/grill-me` on the PRD → answer every question; confirm decisions land in the PRD.
- [ ] `/to-issues` → approve the vertical-slice breakdown (toolchain slice first).
- [ ] `/tdd` → build issue by issue, red → green, one test at a time.
- [ ] `/review` before merging; `/diagnose` when something breaks.

---

## 7. Common gotchas

- Greenfield repo has **no `package.json`** yet — scaffolding the toolchain must
  be the **first issue**, not an afterthought. You can't write a failing test
  before a test runner exists, so the smoke test is the tracer bullet.
- If you skip `setup-matt-pocock-skills`, the engineering skills have nowhere to
  publish — decide your tracker up front.
- Keep tests at the `<App />` seam; resist testing child components directly.
- Don't let the agent pull Phase 2/3 work forward — Phase 1 scope is strict.
- The `string & {}` trick in `ContactLabel` keeps autocomplete for the default
  labels while still allowing any custom string — expect questions about it.
