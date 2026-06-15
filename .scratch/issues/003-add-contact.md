# Issue 003 — Add contact

**Status:** ready-for-agent
**Type:** AFK
**Parent:** `.scratch/prd-phase1-view-add-contacts.md`

## What to build

The write side of the phone book, end-to-end. `AddContactForm` is a real
`<form>` with `onSubmit` (the Add button is `type="submit"`, so Enter submits).
It has controlled name and phone inputs, each with a visible, associated
`<label>` (Material text-field pattern, not placeholder-only).

The Add button is disabled until both fields are non-empty after trimming, so an
invalid add cannot be triggered. On a valid submit, build a new `Contact`:
`crypto.randomUUID()` id; `name.first` set to the trimmed name; a single
`PhoneNumber` in `phones[]` with a generated id, `label` of `"mobile"`
(`DEFAULT_CONTACT_LABEL`), the trimmed number, and `isPrimary: true`; `emails`
and `addresses` initialized to `[]`. Append it to `App` state so it appears
immediately in the list from Issue 002, then clear both inputs.

Style the text fields and button to Material Design 3 cues (interactive states:
hover/focus/pressed/disabled) with adequate touch-target sizing, using the
global token stylesheet from Issue 002.

## Acceptance criteria

- [ ] The form has name and phone inputs, each with a visible associated label, and an Add submit button.
- [ ] The Add button is disabled while either field is empty/whitespace-only (after trimming).
- [ ] Submitting valid input adds a contact that appears immediately in the list (appended / insertion order).
- [ ] The new contact stores name in `name.first`, a single primary phone labeled `"mobile"`, and empty `emails`/`addresses`.
- [ ] Both inputs reset to empty after a successful add.
- [ ] Pressing Enter in a filled form submits (form `onSubmit` path).
- [ ] Adding multiple contacts in a row shows all of them in order.
- [ ] Form controls follow M3 styling with visible focus, interactive states, and adequate touch targets.
- [ ] Tests through `<App />` cover: add happy path, immediate render, form reset, disabled-button guards (empty name; empty phone), Enter-to-submit, multiple adds.

## Blocked by

- Issue 002 — View contacts (list, cards, empty state).
