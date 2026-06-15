# Issue 009 — Restructure into client/ + server/ and stand up the server skeleton

**Status:** ready-for-agent
**Type:** AFK
**Parent:** `.scratch/prd-phase3-backend-search-duplicates.md`

## What to build

The structural enabler for Phase 3: split the repo into two self-contained
packages and stand up an empty-but-running backend. No contacts features yet.

Move the entire existing React app into a new `client/` directory — all of `src/`,
`index.html`, `vite.config.ts`, `tsconfig*.json`, `package.json`,
`package-lock.json`, and the test setup — updating any config/test paths so the
client still builds, runs, and passes all of its existing Phase 1/2 tests from its
new home. There is no root package and no workspaces; `client/` and `server/` are
independent.

Create a new `server/` TypeScript package that runs **natively on Node 24** (type
stripping — no build step, no `tsx`; use erasable TS syntax only). It exposes an
**Express app factory** (separate from the listen/start step, and parameterized by
a `db` handle) wired with JSON body parsing and CORS, plus a trivial health route
(e.g. `GET /api/health` → `{ ok: true }`). A `db` module opens a file-based SQLite
database via Node's built-in `node:sqlite`, enables `PRAGMA foreign_keys = ON`, and
creates the schema (the `contacts` and `phones` tables from the PRD) if missing on
first run. The server entry imports the factory + an on-disk `db` and listens on a
configured port (default `3001`). Record the required Node version in the server
`package.json` `engines` field. Git-ignore the SQLite data directory/file.

Wire a `node:test` + `supertest` setup in `server/` and document the two-terminal
dev workflow (`cd server && npm run dev`, `cd client && npm run dev`) plus
`VITE_API_URL` in the README.

## Acceptance criteria

- [ ] The React app lives under `client/`; `npm install` + `npm run dev` + `npm run build` work from `client/`, and all existing Phase 1/2 tests pass there.
- [ ] `server/` is an independent TS package with its own `package.json` (and `engines` pinning the Node version), no root package, no workspaces.
- [ ] The server runs directly with Node's native TypeScript support — no build step, no `tsx`/bundler.
- [ ] An Express app factory (exported separately from server start, accepting a `db`) provides JSON parsing, CORS, and a health route.
- [ ] On first run with no database, the server creates the SQLite file and the `contacts` + `phones` schema automatically; `foreign_keys` is ON.
- [ ] A `node:test` + supertest smoke test mounts the app (against a throwaway DB) and asserts the health route responds; `node --test` passes.
- [ ] The SQLite data directory/file is git-ignored.
- [ ] The README documents the two-terminal dev commands and `VITE_API_URL`.

## Blocked by

- None — can start immediately.
