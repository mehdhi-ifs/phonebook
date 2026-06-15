# Issue 006 — Delete a whole contact

**Status:** ready-for-agent
**Type:** AFK
**Parent:** `.scratch/prd-phase2-crud-multiple-phones.md`

## What to build

The delete-contact path, end-to-end. `ContactCard` gains a **Delete** action in
display mode that removes the entire contact, with a lightweight two-step inline
confirmation to prevent accidental loss — **no `window.confirm`, no modal**.

Clicking **Delete** swaps the action into an inline confirm state (e.g.
"Confirm" / "Cancel" controls on the card). Confirm calls a new
`App.deleteContact(id)` handler that removes the contact from the `useState`
contacts array immutably; the card disappears immediately. Cancel returns the
card to its normal display state unchanged. When the last contact is deleted, the
list returns to the "No contacts yet" empty state from Phase 1.

Style the Delete / Confirm / Cancel controls to Material Design 3 cues (clear
affordance for a destructive action, visible focus, adequate touch targets).

## Acceptance criteria

- [ ] Each contact card has a Delete action in display mode.
- [ ] Delete requires a two-step inline confirm (Confirm/Cancel); no `window.confirm` or modal is used.
- [ ] Confirming removes that contact from the list immediately and leaves other contacts intact.
- [ ] Cancelling the confirm leaves the contact unchanged.
- [ ] Deleting the only remaining contact restores the "No contacts yet" empty state.
- [ ] Delete controls follow M3 cues with visible focus and adequate touch targets.
- [ ] Tests through `<App />` cover: delete one of several contacts (others remain); cancel leaves it intact; delete the last contact shows the empty state.

## Blocked by

- None — can start immediately (operates on existing Phase 1 cards).
