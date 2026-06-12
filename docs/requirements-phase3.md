# Phase 3 — Node.js Backend, Search & Duplicate Detection

## 🎯 Objective

Replace the in-memory-only Phase 2 app with a real **Node.js backend** so the
phone book keeps its data between sessions and across devices. In this phase:

- Contacts are stored on the server in a **SQLite** database (persisted to disk).
- The React app reads and writes contacts through a **REST API** instead of
  holding them only in component state.
- A user can search/filter contacts by name or phone number.
- A user can see when a phone number is duplicated across contacts.

The goal is to add a persistent backend, a clean HTTP API, search, and duplicate
detection on top of the existing CRUD UI — moving persistence from the browser to
the server.

---

## 🚦 Phase Order & Scope (Strict)

- **Phases must be completed strictly in order: Phase 1 → Phase 2 → Phase 3.**
- Do **not** start this phase until **Phase 1** and **Phase 2** are both fully complete and meet their **Acceptance Criteria** and **Definition of Done**.
- This is the final phase. Build **only** what is listed under **Features** for this phase.
- **Strict scope:** implement exactly what this phase specifies — no more, no less. Do not add features listed under **Out of Scope**.
- Anything in **Out of Scope** is forbidden in this phase, even if it seems convenient.

---

## 🧩 Features

### 1. REST API (Node.js)

Expose a JSON HTTP API for contacts. At minimum:

| Method   | Path                 | Purpose                              |
| -------- | -------------------- | ------------------------------------ |
| `GET`    | `/api/contacts`      | List all contacts (supports `?q=`)   |
| `GET`    | `/api/contacts/:id`  | Get a single contact                 |
| `POST`   | `/api/contacts`      | Create a contact                     |
| `PUT`    | `/api/contacts/:id`  | Update a contact (name + phones)     |
| `DELETE` | `/api/contacts/:id`  | Delete a contact                     |

- Requests and responses use JSON (`Content-Type: application/json`).
- The API returns appropriate HTTP status codes (e.g. `200`, `201`, `400`,
  `404`).
- Validation errors return a clear error body and a `4xx` status.
- CORS is enabled so the React dev server can call the API.

### 2. Persistence (SQLite)

- Store contacts in a **SQLite** database file on disk (e.g. `data/phonebook.db`).
- Data survives server restarts.
- On first run with no database, the server creates the schema automatically.
- The `Contact` shape (name + multiple phones) is preserved on read/write.

### 3. Search

- `GET /api/contacts?q=<query>` filters contacts server-side.
- Matching is **case-insensitive** and checks:
  - The contact's name
  - Any of the contact's phone numbers
- An empty/missing `q` returns all contacts.
- The React search input calls this endpoint (or filters the fetched list) and
  shows a clear "no results" message when nothing matches.

### 4. Duplicate Detection

- Detect phone numbers that appear on more than one contact.
- Duplicates are **derived** (computed), not stored as a separate field.
- This can be computed on the client from the fetched list, or surfaced by the
  API — pick one and be consistent.
- Visually flag duplicates in the UI (highlight the number or show a "Duplicate"
  badge).

### 5. Frontend Integration

- Replace direct state mutation / `localStorage` with API calls:
  - Load contacts on mount via `GET /api/contacts`.
  - Create / update / delete call the matching endpoints, then refresh state.
- Show basic loading and error states for network requests.

---

## 🔌 API Design Guidelines

- Use a small, conventional REST style (resource = `contacts`).
- Keep request/response bodies aligned with the `Contact` model below.
- Validate input on the server: reject empty name, empty phone numbers, or a
  contact with zero phones with a `400` and a descriptive message.
- Generate `id` values on the server (e.g. UUID) for contacts and phones.
- Return the created/updated resource in the response body.
- Keep error responses consistent, e.g. `{ "error": "message" }`.

---

## 🎨 UI Guidelines

- The UI continues to follow Google's [Material Design](https://m3.material.io/) guidelines.
- Apply Material Design principles for layout, spacing, typography, color, elevation, and interactive states (hover, focus, pressed, disabled).
- Use Material Design patterns for search fields, buttons, lists, duplicate badges/flags, loading indicators, and empty/error/no-results states.
- Ensure accessibility: sufficient color contrast, visible focus indicators, and adequate touch target sizes.
- Because external UI component libraries are not allowed (see Constraints), implement these guidelines with custom CSS/styling.

---

## 📦 Data Model

Phase 3 uses the **same `Contact` model from Phases 1 and 2** — no shape changes
on the wire. The backend serializes the same structure to/from SQLite.

```ts
type DefaultContactLabel = "home" | "work" | "mobile" | "main" | "other";
const DEFAULT_CONTACT_LABEL: DefaultContactLabel = "mobile";
type ContactLabel = DefaultContactLabel | (string & {});

type PhoneNumber = {
  id: string;          // unique within the contact
  label: ContactLabel; // e.g. "home", "work", "mobile"
  number: string;      // the phone number
  isPrimary?: boolean; // marks the preferred number
};

type ContactName = {
  first: string;
  last?: string;
  display?: string; // optional override for how the name is shown
};

type Contact = {
  id: string;
  name: ContactName;
  phones: PhoneNumber[];      // one or more
  emails: EmailAddress[];     // still empty; no UI yet
  addresses: PostalAddress[]; // still empty; no UI yet
};
```

### Suggested SQLite schema

Two tables keep the relational shape simple while preserving the JSON contract:

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

- The API assembles each `Contact` (with its `phones[]`) from these tables.
- `emails` and `addresses` remain part of the type, returned as empty arrays;
  no tables/UI required yet.
- Phone number comparison for search/duplicates can be simple string equality
  (no normalization required).

---

## ✅ Acceptance Criteria

- The Node.js server starts and exposes the contacts REST API.
- Contacts are stored in SQLite and persist across server restarts.
- The React app loads, creates, edits, and deletes contacts via the API.
- `GET /api/contacts?q=` filters by name and phone number, case-insensitively.
- Clearing the search restores the full list; a "no results" message shows when
  nothing matches.
- Phone numbers shared by more than one contact are clearly flagged in the UI.
- Invalid create/update requests (empty name, empty phone, no phones) return a
  `4xx` with a clear error and do not persist.
- The UI shows basic loading and error states for network calls.

---

## ❌ Out of Scope

- Authentication / authorization / multi-user accounts
- Fuzzy search or advanced matching
- Phone number normalization / formatting before comparison
- Auto-merging duplicate contacts
- Email and address UI/storage
- Pagination, rate limiting, and performance optimizations
- Production deployment / hosting concerns

---

## ⚠️ Constraints (Strict)

- Backend runs on **Node.js** and exposes a REST/JSON API.
- Persistence uses **SQLite** (file-based; no external database service).
- Keep the API small and conventional — no GraphQL, no ORM is required (a thin
  query layer is fine).
- Frontend stays React functional components; replace `localStorage` with API
  calls.
- No authentication layer.
- Keep implementation readable over optimized.

---

## 📦 Suggested Structure

```
phonebook/
├── server/
│   ├── src/
│   │   ├── index.js        # app entry + server start
│   │   ├── db.js           # SQLite connection + schema init
│   │   ├── contacts.routes.js  # REST routes
│   │   └── contacts.repo.js    # data access (assemble Contact + phones)
│   └── package.json
└── client/                 # existing React app (Phases 1–2)
```

- `index.js` — sets up the HTTP server, JSON parsing, CORS, and routes.
- `db.js` — opens the SQLite file and creates tables if missing.
- `contacts.repo.js` — read/write contacts and phones, search, assemble shape.
- `contacts.routes.js` — maps HTTP verbs to repo functions with validation.

---

## ✅ Definition of Done

- Node.js + SQLite backend serves the full contacts CRUD over REST.
- Data persists across server restarts.
- Search filters by name and phone number via the API.
- Duplicate phone numbers are correctly identified and clearly shown.
- The React app uses the API for all reads/writes (no `localStorage`).
- Clean, readable server and component structure.
- No unused code or dead state.
- UI is functional (styling can be minimal).
