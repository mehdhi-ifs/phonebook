# PRD — Phase 3: Node.js Backend, Search & Duplicate Detection

**Status:** ready-for-agent
**Source:** `docs/requirements-phase3.md`

---

## Problem Statement

Through Phase 2 the phone book is a complete CRUD experience, but everything a
user types lives only in React component state for the length of a single browser
session. Close the tab, restart, or open the app on another machine and the whole
phone book is gone — there is no persistence and nothing is shared across devices.
On top of that, once a person has more than a handful of contacts, two needs
appear that the in-memory app can't meet: finding a specific person quickly, and
noticing when the same phone number has been saved against more than one contact
(a likely mistake or a sign two entries are really the same person). Today there
is no search and no way to spot those duplicated numbers.

## Solution

Move the source of truth from the browser to a real **Node.js + SQLite backend**
exposed over a small, conventional **REST/JSON API**, and have the existing React
app read and write contacts through that API instead of holding them in component
state. Contacts (and their phone numbers) are stored in a file-based SQLite
database that survives server restarts and is shared by any client that talks to
the API. The contacts list gains a **search box** that filters by name or phone
number, case-insensitively, server-side via `GET /api/contacts?q=`. The UI
**derives and flags duplicate phone numbers** — any number that appears on more
than one contact is visually marked. The app shows **loading and error** states
for network calls. The `Contact` shape on the wire is unchanged from Phases 1–2,
so the existing display/add/edit/delete UI is preserved; what changes underneath
is where the data lives and how it travels.

## User Stories

1. As a phone book user, I want my contacts to still be there after I close and reopen the app, so that I don't lose everything every session.
2. As a phone book user, I want my contacts to persist across server restarts, so that maintenance or a crash doesn't wipe my phone book.
3. As a phone book user on a different device, I want to see the same contacts, so that my phone book isn't trapped in one browser tab.
4. As a phone book user, I want the app to load my saved contacts automatically when it opens, so that I see my data without doing anything.
5. As a phone book user, I want a newly added contact to be saved on the server, so that it's still there next time regardless of the device.
6. As a phone book user, I want my edits to a contact to be saved on the server, so that the corrected details persist.
7. As a phone book user, I want a deleted contact to be removed on the server, so that it stays gone after a refresh.
8. As a phone book user, I want a search box above my contacts, so that I can quickly find one person among many.
9. As a phone book user, I want search to match by name, so that I can find someone by who they are.
10. As a phone book user, I want search to match by phone number, so that I can find who a number belongs to.
11. As a phone book user, I want search to be case-insensitive, so that "ada" finds "Ada".
12. As a phone book user, I want clearing the search box to bring back the full list, so that I can get back to everyone after a search.
13. As a phone book user, I want a clear "no results" message when nothing matches my search, so that I know the search worked and there's simply no match (versus a broken/empty screen).
14. As a phone book user, I want phone numbers that appear on more than one contact to be visually flagged, so that I can spot likely duplicate entries or shared numbers.
15. As a phone book user, I want the duplicate flag to reflect the full phone book (not just my current search results), so that filtering never hides the fact that a number is duplicated.
16. As a phone book user, I want the duplicate flag to update as I add, edit, and delete contacts, so that it always reflects the current data.
17. As a phone book user, I want a loading indicator while contacts are being fetched, while a search is running, and while a save/delete is in flight, so that I always know the app is working.
18. As a phone book user, I want a clear error message if the server can't be reached or a request fails, so that I'm not left staring at a silently broken screen.
19. As a phone book user, I want to be prevented from saving a contact with an empty name, so that I never create a nameless entry — enforced by the server, not just the form.
20. As a phone book user, I want to be prevented from saving a contact with an empty phone number or no phone numbers at all, so that I don't keep uncallable entries — enforced by the server.
21. As a phone book user, I want an invalid create/update to leave my existing data untouched, so that a rejected request never corrupts what's already saved.
22. As an operator running the app, I want the server to create its database and schema automatically on first run, so that there's no manual setup step.
23. As a developer integrating with the phone book, I want a conventional REST API for contacts (list, get one, create, update, delete), so that the contract is predictable.
24. As a developer integrating with the phone book, I want consistent JSON error bodies and appropriate HTTP status codes, so that I can handle failures programmatically.
25. As a developer running the React dev server, I want CORS enabled on the API, so that the browser app can call it cross-origin during development.
26. As a developer setting up the project, I want clear, documented commands to start the server and the client, so that I can run the two-process app without guessing.
27. As a phone book user on any device, I want the search field, loading/error/no-results states, and duplicate flags to follow familiar Material Design patterns, so that the app stays polished as it gains a backend.
28. As a keyboard or assistive-technology user, I want the search input, status messages, and duplicate flags to be labeled and announced, so that I can search and understand results without a mouse.

## Implementation Decisions

> Decisions marked **[grill]** were resolved in a `/grill-me` session; see the
> summary table in **Further Notes**.

### Architecture & repository layout

- **Two-package repo, symmetric `client/` + `server/` [grill: Q1=B]**: Restructure
  the repo to match the requirements' suggested structure. The **existing React app
  moves into `client/`** (all of `src/`, `index.html`, `vite.config.ts`,
  `tsconfig*.json`, `package.json`, tests, etc. relocate under `client/`), and a new
  **`server/`** package is added beside it. This is deliberate churn: every existing
  path and the 30 passing Phase 1/2 tests move with the client, and config/test
  paths are updated accordingly. There is **no root package and no workspaces**
  (Q3) — each package is fully self-contained with its own `package.json` and
  dependencies, so the frontend's strict "no external libraries" constraint does
  **not** apply to the backend.
- **Dev orchestration — two terminals [grill: Q3=A]**: No root orchestrator and no
  `concurrently`. Developers run the two processes in separate terminals
  (`cd server && npm run dev`, `cd client && npm run dev`). Both commands are
  documented in the README.
- **Client → server connection — absolute URL + CORS [grill: Q2=B]**: The client
  calls the API at an **absolute base URL** read from Vite env `VITE_API_URL`
  (default `http://localhost:3001`), e.g. `GET ${VITE_API_URL}/api/contacts`. The
  server **enables CORS** so the Vite dev origin (`http://localhost:5173`) can call
  it cross-origin. No Vite dev proxy is used (the cross-origin call is real, which
  is what the requirement's CORS language implies).

### Backend stack & module seams

- **Stack — Express + `node:sqlite` [confirmed in to-prd]**: Express handles
  routing, JSON body parsing, and CORS. Persistence uses Node's **built-in
  `node:sqlite`** module against a file-based database (no third-party driver, no
  ORM). A thin query layer maps the `Contact` shape to/from SQLite.
- **Language — TypeScript, run natively [grill: Q5=B]**: The server is written in
  **TypeScript** and **run directly on Node 24's native TypeScript support**
  (type-stripping) — no build step, no `tsx`, no bundler. Both `node src/index.ts`
  and `node --test` over `.ts` files work without compilation. **Constraint:** stick
  to *erasable* TS syntax only (no `enum`, no `namespace`, no constructor parameter
  properties), since type-stripping requires it.
- **Server owns its own types [grill: Q5=B follow-on]**: Because the packages are
  siblings with no workspaces, the server keeps its **own copy** of the `Contact` /
  `PhoneNumber` / `ContactName` types rather than importing across the package
  boundary. The wire shape is identical to the client's `Contact`; the duplication
  is intentional (a shared package is out of scope).
- **Module seams (highest sensible)**:
  - `db` — opens the SQLite file and creates the schema if missing; exposes the
    database handle/prepared statements.
  - `contacts.repo` — all data access: list (with optional case-insensitive `q`
    filter), get-by-id, create, update, delete; assembles each `Contact` with its
    `phones[]` from the two tables and back.
  - `contacts.routes` — maps HTTP verbs to repo calls and performs request
    validation.
  - `app` (Express app factory) — wires JSON parsing, CORS, and routes; **exported
    separately from the listen/start step** and **parameterized by a `db`** so tests
    can mount the app against a throwaway database without binding a port (this is
    the backend test seam — see Testing Decisions).
  - `index` (server entry) — imports the app factory and a `db` pointed at the
    on-disk file, then starts listening on the configured port (default `3001`).

### REST API contract

- **Resource = `contacts`**, JSON in/out (`Content-Type: application/json`):

  | Method   | Path                | Purpose                            | Success      |
  | -------- | ------------------- | ---------------------------------- | ------------ |
  | `GET`    | `/api/contacts`     | List all contacts; `?q=` filters   | `200`        |
  | `GET`    | `/api/contacts/:id` | Get a single contact               | `200`        |
  | `POST`   | `/api/contacts`     | Create a contact                   | `201`        |
  | `PUT`    | `/api/contacts/:id` | Update a contact (name + phones)   | `200`        |
  | `DELETE` | `/api/contacts/:id` | Delete a contact                   | `204` [grill]|

- **Response bodies**: List returns a JSON array of `Contact`. Create/update return
  the created/updated `Contact`. Get-one returns the `Contact`. **DELETE returns
  `204 No Content`** with no body [grill: batch]. The serialized shape is the
  **same `Contact` model from Phases 1–2** (name + `phones[]`, with `emails` and
  `addresses` always returned as empty arrays [grill: batch]).
- **PUT is a full replace [grill: batch]**: The client sends the complete contact
  (name + full `phones[]`); the server replaces the contact's name and **entire
  phone set** transactionally. No partial/PATCH-style merge.
- **IDs generated server-side**: The server generates `id`s (UUID) for new contacts
  and for new phones. On **update**, the server **preserves client-sent phone ids**
  for existing rows and generates ids only for new rows [grill: batch], so phone ids
  stay stable across edits (consistent with Phase 2 intent). Client-sent contact ids
  on create are ignored/replaced; the server is authoritative.
- **Errors — consistent single-message shape [grill: batch]**: `{ "error":
  "message" }` with a `4xx` status. `404` for an unknown `:id` on get/update/delete;
  `400` for validation failures. No field-level error arrays.
- **CORS**: Enabled so the Vite dev origin can call the API.

### Server-side validation

- Reject and do **not** persist when: the (trimmed) name is empty; any phone's
  (trimmed) `number` is empty; or the contact has zero phones. Respond `400` with a
  descriptive `{ error }`. Validation runs on both `POST` and `PUT`, and a rejected
  request leaves existing data untouched.
- Normalize on write to match prior phases: trim the name and phone numbers; ensure
  **exactly one** phone is `isPrimary` (default the first if none/!exactly-one is
  supplied), mirroring the Phase 2 primary rule so persisted data stays consistent
  regardless of client.

### Persistence (SQLite)

- **Schema (created if missing on first run)** — two tables, phones cascade-deleted
  with their contact:

  ```sql
  CREATE TABLE IF NOT EXISTS contacts (
    id           TEXT PRIMARY KEY,
    name_first   TEXT NOT NULL,
    name_last    TEXT,
    name_display TEXT
  );

  CREATE TABLE IF NOT EXISTS phones (
    id         TEXT PRIMARY KEY,
    contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    label      TEXT NOT NULL,
    number     TEXT NOT NULL,
    is_primary INTEGER NOT NULL DEFAULT 0
  );
  ```

  (Enable `PRAGMA foreign_keys = ON` so the cascade is honored.)

- **DB file**: lives on disk (e.g. `server/data/phonebook.db`); the data directory
  and file are created on first run and are git-ignored.
- **No seed data [grill: batch]**: the DB starts empty on first run (schema only, no
  sample rows).
- **Mapping**: `contacts.repo` maps rows ↔ the `Contact` JSON shape
  (`name_first/last/display` ↔ `name`, `phones` rows ↔ `phones[]`, `is_primary`
  `0/1` ↔ `isPrimary` boolean). `emails`/`addresses` have no tables and are returned
  as `[]`. Updates replace the contact's phone set transactionally
  (delete-then-insert, reusing preserved phone ids) so a save is atomic.

### Search [grill: Q6]

- **Server-side** via `GET /api/contacts?q=<query>`. Matching is
  **case-insensitive** and matches if `q` appears in the contact's name **or** in
  any of the contact's phone numbers (substring match, simple string comparison —
  **no phone normalization**). An empty or missing `q` returns all contacts.
- The React contacts pane gains a **search input** that drives a `?q=` fetch (see
  Frontend integration for debounce). When the API returns an empty array for a
  non-empty query, the UI shows a clear **"No results"** message (distinct from the
  first-load empty state). Clearing the input restores the full list.

### Duplicate detection [grill: Q6]

- **Client-derived** (computed, never stored), and computed over the **full contact
  set**, not the filtered search results. From the full list, the client computes
  the set of phone numbers (exact string equality, no normalization) that appear on
  **more than one contact**, and visually flags each occurrence of such a number
  (e.g. a "Duplicate" badge / highlight on the number).
- The flag is derived on render from current data, so it updates after
  add/edit/delete and is independent of the active search query.

### Frontend integration

- **Inject a contacts API client (the frontend test seam) [grill: Q5/seam]**:
  Introduce a small contacts client/gateway module (in `client/`) with methods
  `list(query?)`, `get(id)`, `create(input)`, `update(id, input)`, `remove(id)` that
  wrap `fetch` against `VITE_API_URL`. `App` accepts this client as an **optional
  prop** defaulting to the real fetch-backed client — mirroring the existing optional
  `initialContacts` seam. Tests pass a **fake in-memory client**; no network-mocking
  library is introduced.
- **`App` holds two lists [grill: Q6=A]**: the **full list** (fetched with no `q`,
  used for duplicate computation) and the **filtered/displayed list** (the `?q=`
  result). Both are `useState`; duplicate flags are derived from the full list and
  rendered on the displayed cards. The displayed list is genuinely driven by the
  server `?q=` fetch (the server is the authoritative filter).
- **Initial load**: On mount, `App` fetches the full list (and the displayed list).
  A `useEffect` for this mount fetch is permitted — the one place the "no
  `useEffect`" habit bends.
- **Search firing — debounced [grill: Q7=B]**: As the user types, the `?q=` fetch is
  **debounced (~300 ms)**, hand-rolled with `setTimeout` inside a `useEffect`
  (clearing the timer on change/unmount). No external debounce library.
- **Refresh after mutations — re-fetch [grill: Q8=A]**: On a successful
  create/update/delete, `App` **re-fetches the full list and re-runs the current
  `?q=` query**. The server stays the source of truth; duplicate flags and the
  displayed list are always correct after a change. No returned-resource splicing.
- **Loading & error — per-action granularity [grill: Q9=B]**: Distinct states for
  (a) the initial fetch, (b) an in-flight search, and (c) in-flight mutations, with
  **inline per-card / per-button** loading affordances and error feedback (e.g. a
  saving/deleting spinner on the relevant card or button, a search-pending
  indicator on the search field). Failed requests surface a clear, accessible error
  near the relevant action; successes clear it. (This is richer than a single global
  banner, chosen deliberately.)
- **State management otherwise unchanged**: React functional components with
  `useState`; the new async work and the mount/debounce effects live in `App`. No
  global state, context, reducers, or state/form libraries are added. `localStorage`
  is not used.

### Data model

- **Unchanged on the wire** — the client reuses its existing `Contact` /
  `PhoneNumber` / `ContactName` / `EmailAddress` / `PostalAddress` types from
  `src/types.ts` (now under `client/src/types.ts`) verbatim; the server keeps its own
  identical copy of the relevant types. No migration. The server serializes the same
  structure to/from SQLite.

### Styling

- Continue the Phases 1–2 approach: custom CSS in the single global stylesheet using
  Material Design 3 tokens (CSS custom properties), now extended to the search field,
  loading indicators, error and no-results states, and the duplicate badge/highlight
  — including hover/focus/pressed/disabled and sufficient contrast. No CSS Modules,
  no inline style objects, no Material component library, no external UI library on
  the frontend.

## Testing Decisions

- **What makes a good test here**: Tests assert *external, observable behavior* — on
  the frontend, what the user types/clicks/sees through the rendered DOM; on the
  backend, what an HTTP client sends and receives. Tests never assert internals
  (component internals, SQL strings, private functions) and should survive any
  refactor that preserves behavior.

- **Frontend seam (reused + extended)**: Test at the `<App />` seam — render
  `<App client={fakeClient} />` and drive everything through the DOM. The fake client
  is an **in-memory implementation of the same client interface** the real fetch
  client implements (list/get/create/update/remove, honoring the `q` filter and
  server-style validation/normalization), seeded with starting contacts. This
  replaces Phase 1/2 `initialContacts` seeding for network-aware tests while
  preserving the "highest seam / drive through the DOM" rule. Do **not** test child
  components or the client module in isolation; they're covered transitively through
  `<App />`. Existing Phase 1/2 tests move with the client into `client/` and keep
  passing (migrating to the fake client where they need the network path).
- **Debounce in tests [grill: Q7]**: Search tests use fake timers / `waitFor` to
  account for the ~300 ms debounce.
- **Per-action states in tests [grill: Q9]**: Assert the inline loading/error
  affordances (e.g. a card/button showing a saving/deleting state, the search-pending
  indicator, an action-level error message) through the DOM via roles/labels.

- **Backend seam (new, highest available) [grill: Q4]**: Test at the **HTTP seam** —
  build the Express app via its factory wired to a **fresh throwaway SQLite per test**
  (a temp file or `:memory:` database), and drive **real HTTP requests** through it
  with **supertest**. Assert status codes and JSON bodies. Do not test
  `contacts.repo` or `db` in isolation; their behavior is covered transitively
  through the routes.
- **Backend tooling [grill: Q4=B]**: Node's built-in **`node:test` + `node:assert`**
  (run via `node --test`, leveraging native TS execution from Q5) plus **supertest**.
  The server package's only runtime/dev deps are Express, `supertest`, and the
  necessary `@types`.

- **Backend behaviors to cover (against Acceptance Criteria & API contract)**:
  - List empty: `GET /api/contacts` on a fresh DB returns `200` and `[]`.
  - Create: `POST` a valid contact returns `201` and the created `Contact`
    (server-generated ids, exactly one primary, `emails`/`addresses` `[]`); it then
    appears in a subsequent `GET`.
  - Get one / 404: `GET /api/contacts/:id` returns the contact, or `404` for an
    unknown id.
  - Update: `PUT` replaces name/phones and returns `200` with the updated contact;
    existing phone ids are preserved, new rows get new ids; `404` for unknown id;
    replacement reflected on re-fetch.
  - Delete: `DELETE` returns `204`, removes the contact and cascades its phones;
    re-fetch no longer includes it; unknown-id behavior is consistent.
  - Validation: `POST`/`PUT` with empty name, empty phone number, or zero phones
    return `400` with `{ error }` and **do not persist** (verified by a follow-up
    `GET`).
  - Search: with seeded data, `?q=` matches by name and by phone number,
    case-insensitively; empty/missing `q` returns all; a non-matching `q` returns `[]`.
  - Persistence: data written via the API is readable after re-opening the DB /
    re-creating the app against the same file (restart simulation).

- **Frontend behaviors to cover (through `<App />` + fake client)**:
  - Initial load: `App` fetches and renders seeded contacts; the initial loading
    indicator shows while pending and is gone afterward.
  - Error state: a fake client whose `list` rejects renders a clear error.
  - Add/edit/delete via API: each action calls the client, shows its per-action
    in-flight state, and the list reflects the change after the request resolves —
    including the empty state after deleting the last contact.
  - Search: typing a query (after debounce) shows only matching contacts; clearing
    restores all; a non-matching query shows the "No results" message (distinct from
    first-load empty state).
  - Duplicate flag: when two contacts share a phone number, both occurrences are
    flagged; the flag reflects the full set even while a search is active; it
    appears/disappears as contacts are added/edited/deleted; a number on only one
    contact is not flagged.
  - Server-rejected save: when the (fake) client rejects an invalid save, the UI
    surfaces the action-level error and the list is unchanged.
  - Regression: existing Phase 1/2 view/add/edit/delete/primary behaviors still hold
    through the new data path.

- **Prior art**: `client/src/App.test.tsx` (moved from `src/`) is the home for the
  frontend tests and already demonstrates the `render(<App .../>)`,
  `getByLabelText`/`getByRole`, and `user-event` patterns to follow (the fake client
  replaces `initialContacts` seeding for network-aware cases). Backend tests live in
  the `server/` package and follow standard `node:test` + supertest request/response
  assertion patterns.

## Out of Scope

- Authentication / authorization / multi-user accounts.
- Fuzzy search or advanced matching (ranking, typo tolerance, partial-word scoring)
  — only case-insensitive substring match on name and phone.
- Phone number normalization / formatting before comparison (search and duplicate
  detection use exact/substring string comparison).
- Auto-merging duplicate contacts (duplicates are only *flagged*, never merged).
- Email and address UI **and** storage (the type keeps them as empty arrays; no
  tables, no inputs).
- Pagination, rate limiting, caching, and performance optimizations.
- Production deployment / hosting / process-management concerns.
- An ORM or migration framework (a thin query layer only).
- GraphQL or any non-REST transport.
- A shared types package or npm workspaces (server keeps its own copy of the types;
  the two packages are independent).
- A root orchestrator / `concurrently` (two-terminal dev workflow).
- Returned-resource cache splicing on the client (always re-fetch after mutations).
- Search debounce tuning beyond a fixed ~300 ms; production-grade request
  cancellation/race handling.

## Further Notes

- **Phase order is strict**: Phase 3 only, and only after Phases 1 and 2 meet their
  Acceptance Criteria and Definition of Done. This is the final phase.
- **Decisions resolved via `/grill-me`**:

  | # | Decision | Choice |
  | --- | --- | --- |
  | Q1 | Repo layout | **B** — move client into `client/`, add `server/` sibling (no workspaces) |
  | Q2 | Client↔server in dev | **B** — absolute `VITE_API_URL` + CORS (no Vite proxy) |
  | Q3 | Dev orchestration | **A** — two manual terminals; commands in README |
  | Q4 | Backend test runner | **B** — `node:test` + `node:assert` + supertest |
  | Q5 | Server language | **B** — TypeScript, run natively on Node 24 (no build), erasable-syntax only; server owns its own type copies |
  | Q6 | Search vs duplicates | **A** — full list + filtered view as separate client state; server `?q=` drives display; duplicates over full set |
  | Q7 | Search firing | **B** — debounced ~300 ms (hand-rolled `setTimeout` in `useEffect`) |
  | Q8 | Refresh after mutation | **A** — re-fetch full list + active query |
  | Q9 | Loading/error UX | **B** — per-action granularity (inline per-card/per-button) |
  | batch | API/data semantics | DELETE `204`; PUT full-replace; preserve client phone ids; `{ error }` body; no DB seeding; `emails`/`addresses` `[]` |

- **The constraints that bend**: loading on mount requires `useEffect` in `App`, and
  the debounced search uses a `setTimeout`-based effect. Every other frontend
  constraint (functional components, `useState`, local state, no global
  state/context/reducers, no UI/state/form libraries) is unchanged. The backend is a
  separate package and is not bound by the frontend's "no external libraries" rule
  (Express + supertest).
- **Node version**: `node:sqlite` and native TypeScript execution both rely on a
  recent Node (the dev machine is on **v24.15.0**, where `node:sqlite` works without
  the old `--experimental-sqlite` flag, though it still emits an experimental
  warning). Record the required Node version in the server `package.json` `engines`
  field.
- **Definition of Done** (from requirements): Node.js + SQLite backend serves full
  contacts CRUD over REST; data persists across restarts; search filters by name and
  phone via the API; duplicate phone numbers are correctly identified and clearly
  shown; the React app uses the API for all reads/writes (no `localStorage`); clean,
  readable server and component structure; no unused code or dead state; UI
  functional.
- **Tracker note**: published as a local Markdown PRD under `.scratch/` per this
  repo's local issue-tracker convention, matching the Phase 1 and 2 PRD naming.
  `ready-for-agent` is recorded in the header above rather than as a tracker label
  (no `setup-matt-pocock-skills` tracker is configured in this repo).
