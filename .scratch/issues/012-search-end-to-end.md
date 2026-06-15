# Issue 012 — Search end-to-end (server ?q= + debounced client search)

**Status:** ready-for-agent
**Type:** AFK
**Parent:** `.scratch/prd-phase3-backend-search-duplicates.md`

## What to build

Server-side filtered search, driven by a debounced search box, cutting through
both layers.

Server: extend `GET /api/contacts` to accept `?q=<query>`. Matching is
**case-insensitive** and matches when `q` is a substring of the contact's name
**or** of any of the contact's phone numbers (plain string comparison — no phone
normalization). An empty or missing `q` returns all contacts.

Client: add a labeled **search input** to the contacts pane. `App` now holds two
pieces of state — the **full list** (fetched with no `q`) and the **filtered/
displayed list** (the `?q=` result). The displayed list is genuinely driven by the
server filter. Typing triggers a `?q=` fetch **debounced (~300 ms)** via a
`setTimeout`-based `useEffect` (timer cleared on change/unmount; no external debounce
library). When the filtered result is empty for a non-empty query, show a clear
**"No results"** message, distinct from the first-load "No contacts yet" empty
state. Clearing the input restores the full list. After a successful mutation
(Issue 011 re-fetch), both the full list and the active query are refreshed.

## Acceptance criteria

- [ ] `GET /api/contacts?q=` filters case-insensitively by name and by any phone number; empty/missing `q` returns all; a non-matching `q` returns `[]` — covered by server HTTP tests.
- [ ] The contacts pane has a labeled search input.
- [ ] `App` keeps the full list and the filtered/displayed list as separate state; the displayed list comes from the server `?q=` fetch.
- [ ] Search fetches are debounced (~300 ms); a non-matching query shows a "No results" message distinct from the first-load empty state.
- [ ] Clearing the search restores the full list.
- [ ] Tests through `<App />` + fake client cover: filtering by name and by phone, case-insensitivity, clear-restores-all, and the no-results message (using fake timers / `waitFor` for the debounce).

## Blocked by

- Issue 011 — Frontend talks to the API for all reads & writes.
