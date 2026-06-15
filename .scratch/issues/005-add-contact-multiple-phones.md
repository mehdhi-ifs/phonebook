# Issue 005 — Add a contact with multiple phone numbers

**Status:** ready-for-agent
**Type:** AFK
**Parent:** `.scratch/prd-phase2-crud-multiple-phones.md`

## What to build

The multi-phone write path, end-to-end. Extract a shared, presentational
`PhoneNumberFields` component and wire it into `AddContactForm` so a user can add
a contact with **one or more** phone numbers.

`PhoneNumberFields` renders a dynamic list of phone rows. Each row has a **value
input** and a **label `<select>`** over the five known labels
(`home`/`work`/`mobile`/`main`/`other`), both with visible associated labels. It
provides an "Add phone number" control that appends a new empty row (generated
`id`, label defaulting to `DEFAULT_CONTACT_LABEL` = `"mobile"`), and a per-row
Remove control that is **disabled (not hidden) when only one row remains**, with
an explanatory `aria-label`. The component owns no rows state itself; the form
owns the rows array in `useState` and passes change/add/remove callbacks down.

`AddContactForm` keeps its single name input and now renders `PhoneNumberFields`
for the phones. The Add button is disabled until the name is non-empty (trimmed)
**and** at least one phone row has a non-empty value (trimmed). On submit, build
the `Contact`: new `crypto.randomUUID()` id; `name.first` from the trimmed name;
`phones[]` from every **non-empty** row (empty/whitespace rows silently dropped),
each with its `id` and selected `label`, and the **first** retained phone
normalized to `isPrimary: true`; `emails`/`addresses` as `[]`. Append it so it
appears immediately (rendered with all numbers via Issue 004), then reset the
form to a single empty row.

Style the new row controls (add/remove buttons, label select) to M3 cues with
visible focus and adequate touch targets.

## Acceptance criteria

- [ ] The add form can add and remove phone-number rows dynamically.
- [ ] Each row has a value input and a label select (default `"mobile"`), with visible labels.
- [ ] The Remove control is disabled when exactly one row remains (with an explanatory `aria-label`).
- [ ] The Add button is disabled until the name and at least one phone value are non-empty after trimming.
- [ ] Empty/whitespace-only phone rows are dropped on save and never persisted.
- [ ] A saved multi-phone contact appears immediately showing all its numbers, the first marked primary.
- [ ] After a successful add, the form resets to a single empty phone row and empty name.
- [ ] Phase 1 single-phone add behavior and its tests still pass.
- [ ] Tests through `<App />` cover: add with two numbers (both appear); add/remove a row before saving; last-row Remove disabled; empty-row dropped; name/phone disabled-button guards.

## Blocked by

- Issue 004 — Card shows all phone numbers.
