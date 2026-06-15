# Issue 002 — View contacts (list, cards, empty state)

**Status:** ready-for-agent
**Type:** AFK
**Parent:** `.scratch/prd-phase1-view-add-contacts.md`

## What to build

The read side of the phone book, end-to-end. Establish the full `Contact` type
(including `emails` and `addresses`, even though Phase 1 leaves them empty). `App`
owns the single source of truth as `useState<Contact[]>`, starting empty.

`ContactList` receives the contacts and renders either a clear empty state
("No contacts yet") when there are none, or one `ContactCard` per contact. A
`ContactCard` shows the contact's name (from `name.first`) and its primary phone
number (the single entry in `phones[]`).

Introduce the single global stylesheet with CSS custom properties for the
Material Design 3 tokens (color, type scale, spacing, elevation) and style the
list, cards, and empty state to M3 cues with accessible contrast and focus.

Since there is no Add form yet, the rendering-of-contacts behavior is exercised
in tests by providing contacts; the running app shows the empty state.

## Acceptance criteria

- [ ] The full `Contact` type is defined per the PRD data model.
- [ ] `App` holds contacts in `useState`, initialized to an empty array.
- [ ] With no contacts, the UI shows a "No contacts yet" empty-state message and no contact items.
- [ ] Given contacts, each renders as a card showing the name and primary phone number.
- [ ] A global stylesheet with M3 token custom properties styles the list and empty state.
- [ ] Visible focus indicators and sufficient contrast are present (accessibility).
- [ ] Tests through `<App />` cover: empty state shown; provided contacts render with name + phone.

## Blocked by

- Issue 001 — Scaffold the toolchain.
