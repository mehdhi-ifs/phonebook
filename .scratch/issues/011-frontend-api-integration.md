# Issue 011 — Frontend talks to the API for all reads & writes

**Status:** ready-for-agent
**Type:** AFK
**Parent:** `.scratch/prd-phase3-backend-search-duplicates.md`

## What to build

Move the client's source of truth from in-memory React state to the server,
end-to-end, so contacts persist and are shared.

Introduce a contacts API client/gateway module with methods `list(query?)`,
`get(id)`, `create(input)`, `update(id, input)`, and `remove(id)` that wrap `fetch`
against `VITE_API_URL` (default `http://localhost:3001`) and parse JSON / surface
errors. `App` accepts this client as an **optional prop** defaulting to the real
fetch-backed client — mirroring the existing optional `initialContacts` seam.

On mount, `App` fetches the contact list (via a `useEffect`) and renders it. The
existing add / edit / delete actions now call `create` / `update` / `remove` on the
client and, on success, **re-fetch** the list (server stays authoritative — no
local splicing). Remove the in-memory-only state model and any `localStorage`. Show
a baseline **loading** indicator during the initial fetch and a clear, accessible
**error** message when a request fails (per-action granularity is a later slice).

Migrate the existing Phase 1/2 tests to drive `<App />` with an injected **fake
in-memory client** (implementing the same interface, including server-style
validation/normalization) in place of `initialContacts` seeding, preserving the
"highest seam / drive through the DOM" approach. All prior view/add/edit/delete/
primary behaviors must still pass through the new data path.

## Acceptance criteria

- [ ] A contacts API client module wraps `fetch` for list/get/create/update/remove against `VITE_API_URL`.
- [ ] `App` takes the client as an optional prop defaulting to the real fetch client.
- [ ] On mount, `App` loads contacts from the API and renders them; a loading indicator shows while pending.
- [ ] Add, edit, and delete call the client and then re-fetch; the list reflects each change after the request resolves (including the empty state after deleting the last contact).
- [ ] In-memory-only state and any `localStorage` use are removed; the server is the source of truth.
- [ ] A failed request surfaces a clear, accessible error message.
- [ ] Tests drive `<App />` with a fake in-memory client; all Phase 1/2 behaviors pass through the API path, plus initial-load loading and an error-state test.

## Blocked by

- Issue 010 — Contacts REST CRUD, persistence & validation.
