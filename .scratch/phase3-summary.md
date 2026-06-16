# Phase 3 — Summary

**Parent PRD:** `.scratch/prd-phase3-backend-search-duplicates.md`
**Status:** complete — all six issues (009–014) done.

## What Phase 3 delivered

Phase 3 took the in-memory React phone book and turned it into a real
client/server app with a persistent backend, server-side search, duplicate
detection, and per-action loading/error UX.

| # | Issue | Outcome |
|---|-------|---------|
| 009 | Restructure to client/server + server skeleton | App moved into `client/`; new `server/` (Express 5 + `node:sqlite`, TypeScript run natively on Node 24) with a `GET /api/health` tracer. |
| 010 | Contacts REST CRUD, persistence & validation | Full CRUD over SQLite with cascade delete, write-time normalization (trim, single primary), request validation, and file-backed persistence. |
| 011 | Frontend talks to the API | `App` reads/writes through an injected `ContactsClient`; real `fetch` client for prod, in-memory fake for tests; baseline loading/error states. |
| 012 | Search end-to-end | Server `GET /api/contacts?q=` filters by name + phone (case-insensitive); client debounces input and shows a distinct "No results" state. |
| 013 | Duplicate phone detection | `App` derives a `Set` of numbers appearing on 2+ contacts from the full list; "Duplicate" badge on every matching card, recomputed on render. |
| 014 | Per-action loading & error | Action-scoped state for search / add / edit / delete with inline affordances ("Searching…", "Saving…", "Deleting…") and errors shown where they happen. |

## Architecture

- **Two packages:** `client/` (Vite + React + Vitest) and `server/`
  (Express 5 + `node:sqlite` + `node:test`), each with its own
  `package.json` / `tsconfig.json`.
- **Transport:** REST, JSON in/out, CORS, client configured via
  `VITE_API_URL` (defaults to `http://localhost:3001`).
- **Test seams:** frontend injects a `ContactsClient` (real `fetch` impl vs.
  in-memory fake); backend is exercised at the HTTP level with `supertest`.
- **Data model:** `Contact` / `PhoneNumber` / `ContactName`; server owns ID
  generation and primary-phone normalization; `emails` / `addresses` are `[]`.
- **API semantics:** `DELETE` → `204`; `PUT` is full-replace and preserves
  existing phone IDs; errors return `{ error }`; no DB seeding.

## Key decisions

- Duplicate detection is **client-derived from the full list** (not server-side),
  so a number stays flagged even when search filters its partner out of view.
- Search is **server-side** via `?q=`, with hand-rolled client debouncing
  (no extra libraries).
- After every mutation the client **re-fetches both** the displayed list (with
  the active query) and the full list (for duplicate flags).
- Loading/error UI is **per-action**, all held in `App` via `useState`
  (no state/UI libraries added).
- Server runs **TypeScript natively on Node 24** (no build step).

## Verification

- **Client:** 43/43 Vitest tests pass; `tsc --noEmit` clean; no lint errors.
- **Server:** 14/14 `node:test` tests pass; `tsc --noEmit` clean.

## Out of scope / follow-ups

- No emails/addresses yet (model leaves them as empty arrays).
- No phone-number normalization for duplicate matching (exact string equality).
- No DB migrations/seeding, auth, or pagination.
- Dev orchestration is two manual terminals (no combined dev script).
