# Issue 010 — Contacts REST CRUD, persistence & validation (server)

**Status:** ready-for-agent
**Type:** AFK
**Parent:** `.scratch/prd-phase3-backend-search-duplicates.md`

## What to build

The full contacts REST resource on the server, persisted to SQLite, verifiable
end-to-end at the HTTP seam. (Search `?q=` is intentionally a later slice.)

Add a `contacts.repo` that assembles each `Contact` (with its `phones[]`,
`emails`/`addresses` as `[]`) from the `contacts` + `phones` tables and writes it
back, mapping `name_first/last/display` ↔ `name` and `is_primary` `0/1` ↔
`isPrimary`. Add `contacts.routes` mapping HTTP verbs to repo calls:

- `GET /api/contacts` → `200` array of all contacts.
- `GET /api/contacts/:id` → `200` contact, or `404 { error }`.
- `POST /api/contacts` → `201` created contact.
- `PUT /api/contacts/:id` → `200` updated contact (full replace of name + phones),
  or `404` for unknown id.
- `DELETE /api/contacts/:id` → `204` no content; cascade-deletes phones.

Server is authoritative: it generates UUID ids for new contacts and new phones; on
update it **preserves client-sent phone ids** for existing rows and generates ids
only for new rows; the phone set is replaced transactionally (atomic save).
Normalize on every write: trim name and phone numbers, and ensure **exactly one**
phone is `isPrimary` (default the first if none/not-exactly-one supplied).

Validation (on `POST` and `PUT`): reject with `400 { error }` and **do not
persist** when the trimmed name is empty, any trimmed phone `number` is empty, or
there are zero phones. Error bodies are the single-message shape
`{ "error": "message" }`.

## Acceptance criteria

- [ ] All five endpoints behave per the table above with the listed status codes.
- [ ] Created/updated responses return the full `Contact`; `emails`/`addresses` are always `[]`.
- [ ] The server generates contact and new-phone ids; update preserves existing phone ids and regenerates none of them.
- [ ] Each write trims name/numbers and persists exactly one primary phone.
- [ ] Invalid create/update (empty name, empty phone, or zero phones) returns `400 { error }` and leaves stored data unchanged.
- [ ] `DELETE` returns `204` and cascades phone rows; unknown id behavior is consistent.
- [ ] Data persists across reopening the database (restart simulation) — written contacts are readable from a freshly opened DB/app on the same file.
- [ ] `node:test` + supertest cover every verb, validation failures (with a follow-up GET proving no persistence), id preservation on update, cascade delete, and persistence-across-reopen — all at the HTTP seam against a throwaway DB.

## Blocked by

- Issue 009 — Restructure into client/ + server/ and server skeleton.
