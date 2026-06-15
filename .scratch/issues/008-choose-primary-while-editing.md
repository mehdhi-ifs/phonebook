# Issue 008 — Choose the primary number while editing

**Status:** ready-for-agent
**Type:** AFK
**Parent:** `.scratch/prd-phase2-crud-multiple-phones.md`

## What to build

Primary-number selection in the edit flow, end-to-end. Let a user choose which of
a contact's numbers is the primary one while editing.

Add a `showPrimaryControl` boolean prop to the shared `PhoneNumberFields`
(default off). The **edit** form passes it `true`, rendering a per-row primary
control (a radio/star set) where **exactly one** row is selected at a time; the
**add** form leaves it off (the add form keeps defaulting the first row to
primary, unchanged from Issue 005). Selecting a row's primary control updates the
chosen primary in the edit form's working state.

On Save, the merge from Issue 007 normalizes `phones[]` so the chosen row is
`isPrimary: true` and all others are `false`. If the row currently marked primary
is **removed** during editing, primary **falls back to the first remaining row**.
The card (Issue 004) already renders the primary number first with its marker, so
a changed primary is reflected immediately in the list.

Style the primary control to M3 cues (clear selected state, visible focus,
adequate touch target).

## Acceptance criteria

- [ ] `PhoneNumberFields` accepts `showPrimaryControl`; it is on for the edit form and off for the add form.
- [ ] In the edit form, exactly one phone row can be marked primary at a time.
- [ ] Saving persists the chosen row as the only `isPrimary` phone.
- [ ] Removing the current primary row falls back to the first remaining number as primary on save.
- [ ] The card reflects the changed primary (shown first, marked) immediately after save.
- [ ] The add form is unchanged (no primary picker; first row defaults to primary).
- [ ] Tests through `<App />` cover: choose a different primary and see it on the card; remove the primary row and confirm fallback to the first remaining number.

## Blocked by

- Issue 007 — Edit a contact (name + phones, inline).
