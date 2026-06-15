# Issue 004 — Card shows all phone numbers

**Status:** ready-for-agent
**Type:** AFK
**Parent:** `.scratch/prd-phase2-crud-multiple-phones.md`

## What to build

The display foundation for multiple phone numbers, end-to-end. Today
`ContactCard` shows only the single primary number; change it to render **every**
phone number in the contact's `phones[]`.

Render the **primary number first** with a clear primary marker, followed by the
remaining numbers in their stored order. Each number shows its `label` (e.g.
"mobile", "work") alongside the value. Name display rules from Phase 1 are
unchanged (`name.first`, plus `last` when present). Primary is the phone with
`isPrimary: true`, falling back to the first entry if none is marked.

Style the per-number list and the primary marker to Material Design 3 cues
(accessible contrast, adequate touch targets) using the existing global token
stylesheet. No `App` state changes and no new handlers — this slice is verified
by seeding contacts (including multi-phone ones) through the existing
`initialContacts` prop.

## Acceptance criteria

- [ ] A contact with multiple phone numbers renders all of them on its card.
- [ ] The primary number appears first and carries a visible primary marker.
- [ ] Each number is shown with its label.
- [ ] A contact with a single phone still renders correctly (Phase 1 behavior preserved).
- [ ] Styling follows M3 cues with accessible contrast and touch targets.
- [ ] Tests through `<App />` (seeded via `initialContacts`) cover: a multi-phone contact showing all numbers with the primary first/marked; a single-phone contact unchanged.

## Blocked by

- None — can start immediately (Phase 1 complete).
