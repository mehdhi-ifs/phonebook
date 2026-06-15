# Issue 014 — Per-action loading & error granularity

**Status:** ready-for-agent
**Type:** AFK
**Parent:** `.scratch/prd-phase3-backend-search-duplicates.md`

## What to build

Upgrade the baseline loading/error states from Issue 011 to per-action
granularity, so the user always sees exactly what is in flight and where a failure
happened.

Provide distinct states for: the initial fetch, an in-flight **search**, and
in-flight **mutations**. Surface them inline next to the relevant control — e.g. a
**search-pending** indicator on the search field, a **saving** state on the add /
edit form's submit button, and a **deleting** state on the card being removed.
Failed requests surface a clear, accessible error **near the relevant action**
(action-level, not just one global banner), and the error clears on a subsequent
success. Keep all states in `App`'s `useState` (no new libraries).

## Acceptance criteria

- [ ] The initial fetch, search, and mutations each have their own visible in-flight state.
- [ ] Loading affordances appear inline next to the relevant control (search field, submit button, the card being deleted).
- [ ] A failed mutation shows an action-level error near where it happened, and the affected list/card is left unchanged.
- [ ] A failed search surfaces an error without wiping the current results.
- [ ] Errors clear on a subsequent successful request.
- [ ] No new state/UI libraries are introduced; states live in `App` via `useState`.
- [ ] Tests through `<App />` + fake client assert the per-action loading and error affordances via roles/labels (e.g. a rejecting create shows a saving state then an action-level error; a rejecting search shows a search error).

## Blocked by

- Issue 011 — Frontend talks to the API for all reads & writes. (Best sequenced after Issue 012 so the search-pending state is included.)
