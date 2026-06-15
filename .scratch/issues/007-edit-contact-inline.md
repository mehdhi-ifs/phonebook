# Issue 007 — Edit a contact (name + phones, inline)

**Status:** ready-for-agent
**Type:** AFK
**Parent:** `.scratch/prd-phase2-crud-multiple-phones.md`

## What to build

The edit path, end-to-end, inline on the card. Add an `EditContactForm` and let a
user edit an existing contact's name and phone numbers in place.

`ContactCard` gains an **Edit** action and a local `isEditing` boolean
(`useState`). In display mode it shows the contact plus Edit (and the Delete from
Issue 006). Clicking Edit renders `EditContactForm` **inline** on the card,
seeded from that contact. The edit form reuses the shared `PhoneNumberFields`
(from Issue 005) for its phone rows and adds a single name input plus **Save** and
**Cancel** actions.

While editing, the user can change the name, change any phone's value and label,
**add** a phone row, and **remove** a phone row (last-row Remove disabled, same
guard as add). Save is disabled until the name is non-empty (trimmed) and at
least one phone value is non-empty (trimmed); empty rows are dropped on save.

**Save is a merge, not a rebuild**: `App.updateContact` replaces the contact by
`id` while preserving the original `id`, `emails`, and `addresses`, overwriting
only `name` and `phones`. Existing phone `id`s are preserved for edited rows; new
`id`s are generated only for rows added during editing. After Save, the card
returns to display mode and the list reflects the change immediately.

The edit form is **conditionally rendered** (mounted on Edit, unmounted on
Save/Cancel): it seeds its working copy from the `contact` prop via `useState`
initializers and discards edits purely by unmounting — Cancel simply returns to
display mode unchanged, and re-opening shows the latest saved values. Multiple
cards may be in edit mode at once. (Primary-number **selection** is out of scope
for this slice — see Issue 008; for now the contact's existing primary is
preserved, falling back to the first remaining number if the primary row is
removed.)

Style the inline edit form, Save, and Cancel to M3 cues with visible focus and
adequate touch targets.

## Acceptance criteria

- [ ] Each card has an Edit action that reveals an inline edit form seeded with the contact's current name and phone numbers.
- [ ] The user can change the name and any phone's value and label.
- [ ] The user can add a phone number and remove a phone number while editing (last-row Remove disabled).
- [ ] Save is disabled until the name and at least one phone value are non-empty after trimming; empty rows are dropped.
- [ ] Save merges: `id`, `emails`, and `addresses` are preserved; existing phone `id`s are kept; only added rows get new `id`s.
- [ ] Saving updates the contact in place and the list reflects it immediately.
- [ ] Cancel returns to display mode with the contact unchanged; re-opening shows current saved values.
- [ ] Phase 1 add behavior and Issues 004–006 behavior still pass.
- [ ] Tests through `<App />` (seeded via `initialContacts`) cover: edit pre-filled; edit name; edit phone value/label; add phone while editing; remove phone while editing (and last-row guard); cancel leaves unchanged.

## Blocked by

- Issue 005 — Add a contact with multiple phone numbers (provides `PhoneNumberFields`).
