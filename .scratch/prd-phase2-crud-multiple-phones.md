# PRD — Phase 2: Full CRUD & Multiple Phone Numbers

**Status:** ready-for-agent
**Source:** `docs/requirements-phase2.md`

---

## Problem Statement

The Phase 1 slice lets a user see their contacts and add one, but that is the
whole story: every contact is frozen the moment it is created. A real person's
details change — they get a new number, a typo needs fixing, a contact is no
longer wanted — and right now there is no way to change or remove anything. On
top of that, people rarely have exactly one number; a contact often has a
mobile, a home, and a work line, and the current screen can only ever hold one.
Without editing, deleting, and multiple numbers, the phone book can be filled
but never maintained.

## Solution

Turn the read/add slice into a complete in-memory CRUD experience for contacts
and their phone numbers. A user can give a contact **one or more** phone numbers
when adding it, **edit** an existing contact's name and numbers in place,
**delete an individual phone number** from a contact while editing, and
**delete an entire contact** from the list. Adding and editing share the same
form, which can grow and shrink its set of phone-number rows on the fly. Every
create, update, and delete is reflected in the list immediately. A contact can
never be left nameless, with no number, or with an empty number. Everything
still lives in memory for the session — no search, no persistence, no backend.

## User Stories

1. As a phone book user, I want to add a contact with more than one phone number, so that I can capture someone's mobile, home, and work lines in a single entry.
2. As a phone book user adding a contact, I want to add another phone-number row to the form on demand, so that I'm not limited to a fixed number of phones.
3. As a phone book user adding a contact, I want to remove a phone-number row I added by mistake, so that I only save the numbers I actually mean to.
4. As a phone book user, I want each phone number to carry a label (e.g. mobile, home, work), so that I know what kind of number each one is.
5. As a phone book user, I want a sensible default label on a new phone-number row, so that I don't have to set the label for the common case.
6. As a phone book user, I want each contact in the list to show its phone number(s), so that I can see how to reach the person without opening an editor.
7. As a phone book user, I want an Edit action on each contact, so that I can change a contact whose details are wrong or out of date.
8. As a phone book user editing a contact, I want the form to open pre-filled with the contact's current name and numbers, so that I'm changing real values rather than re-entering them.
9. As a phone book user editing a contact, I want to change the contact's name, so that I can fix typos or record a name change.
10. As a phone book user editing a contact, I want to change the value of any existing phone number, so that I can update a number that has changed.
11. As a phone book user editing a contact, I want to change the label of any existing phone number, so that I can correct how a number is categorized.
12. As a phone book user editing a contact, I want to add a new phone number to it, so that I can record an additional way to reach an existing contact.
13. As a phone book user editing a contact, I want to delete an individual phone number from it, so that I can drop a line the person no longer uses while keeping the rest of the contact.
14. As a phone book user editing a contact, I want my changes to appear in the list immediately when I save, so that I get instant confirmation the update took effect.
15. As a phone book user editing a contact, I want to cancel the edit, so that I can back out without changing the contact when I open it by mistake or change my mind.
16. As a phone book user, I want a Delete action on each contact, so that I can remove people I no longer want in my phone book.
17. As a phone book user, I want a deleted contact to disappear from the list immediately, so that I can see the removal worked.
18. As a phone book user, I want to be prevented from saving a contact with an empty name, so that I never create a nameless, useless entry.
19. As a phone book user, I want to be prevented from saving a phone number with an empty value, so that I don't keep blank, uncallable numbers.
20. As a phone book user, I want every contact to always keep at least one phone number, so that I never end up with a contact I can't reach at all.
21. As a phone book user, I want to be stopped from removing a contact's last remaining phone number while editing, so that the "at least one number" rule is enforced where I'd otherwise break it.
22. As a phone book user, I want one of a contact's numbers to be treated as its primary number, so that the contact has a clear preferred line.
23. As a phone book user, I want to add several multi-number contacts and edit and delete them in one sitting, so that I can fully maintain my phone book without reloading.
24. As a phone book user on any device, I want the add form, edit form, dynamic add/remove rows, and delete actions to follow familiar Material Design patterns, so that the app stays polished and predictable as it grows.
25. As a keyboard or assistive-technology user, I want visible focus indicators and clearly labeled inputs and actions across the add, edit, and delete controls, so that I can manage contacts without a mouse.
26. As a touch user, I want the add/remove-row, Edit, Delete, Save, and Cancel controls to have adequately sized touch targets, so that I can operate them reliably on a small screen.

## Implementation Decisions

- **State ownership stays in `App`**: `App` keeps the single source of truth for
  contacts as `useState<Contact[]>` (seeded by the existing `initialContacts`
  prop). It now exposes three handlers downward — add, update (replace a contact
  by `id`), and delete (remove a contact by `id`). No global state, no context,
  no reducer; updates are immutable `setContacts` transforms keyed by `id`.
- **Shared form — `ContactForm`**: Replace the Phase 1 `AddContactForm` with a
  single `ContactForm` used for **both** add and edit. It is the natural shape
  because add and edit operate on identical fields (name + a dynamic list of
  phone rows); maintaining two near-identical forms would be the bigger
  over-abstraction. The form takes an optional initial contact (absent = add
  mode, present = edit mode) and a submit callback, and renders a Save/Add
  action plus, in edit mode, a Cancel action. The form owns its own working copy
  of the field values in local `useState` and does not mutate the contact until
  the user saves.
- **Dynamic phone rows**: Inside `ContactForm`, the set of phone-number rows is
  local component state — an array of `{ id, label, number }` working entries.
  An "Add phone number" control appends a new empty row (with a generated `id`
  and `label` defaulting to `DEFAULT_CONTACT_LABEL`). Each row has a Remove
  control. Each row has a **value input** and a **label input/control**, both
  with visible associated labels (Material text-field pattern). Rows are keyed by
  their working `id`.
- **"At least one phone number" guard (chosen rule)**: The form always keeps at
  least one phone row. The per-row Remove control is **disabled/hidden when only
  one row remains**, so the last number can't be removed via the form. This is
  the chosen, consistent interpretation of the requirement's "pick one"
  (we do *not* take the "delete the whole contact" branch). Deleting the entire
  contact is a separate action on the card.
- **Primary number rule**: Exactly one phone is marked `isPrimary`. On save the
  form normalizes the saved `phones[]` so the **first** retained phone is
  `isPrimary: true` and the rest are not. There is **no dedicated "make primary"
  picker** in the UI — that would be scope creep beyond the requirements; primary
  is derived from position. The contact card shows the primary (first) number
  prominently and lists the remaining numbers.
- **Validation / save gating**: Trim the name and every phone value before
  validating and before saving. A save is allowed only when the name is
  non-empty after trimming **and** at least one phone row has a non-empty value
  after trimming. Empty/whitespace-only phone rows are dropped on save (they are
  never persisted). The Save/Add button is disabled whenever the form is invalid,
  mirroring the Phase 1 disabled-button approach, so an invalid save can't be
  triggered.
- **Editing UX — inline on the card**: Each `ContactCard` owns a local
  `isEditing` boolean (`useState`). In display mode it shows the name, the
  phone numbers (primary first), an **Edit** action, and a **Delete** action. In
  editing mode it renders `ContactForm` seeded with that contact; Save calls
  `App`'s update handler and returns to display mode, Cancel returns to display
  mode unchanged. Keeping edit state local to each card avoids threading an
  `editingId` through `App` and keeps the "useState only / state local" rule.
- **`ContactCard` display update**: The card now renders **all** of a contact's
  phone numbers (each with its label), with the primary number first, instead of
  only the single primary number. Name display rules from Phase 1 are unchanged
  (`first`, plus `last` when present).
- **Delete contact flow**: The card's Delete action calls `App`'s delete handler
  with the contact `id`, removing it from the list immediately. (Whether a
  confirmation step is shown is left to implementation; a lightweight confirm is
  acceptable but a heavy modal system is out of scope.)
- **Data model unchanged**: Reuse the existing `Contact` / `PhoneNumber` /
  `ContactName` types verbatim — Phase 1 already adopted the full shape, so there
  is **no migration**. `emails` and `addresses` remain initialized as `[]` with
  no UI. Phase 2 only adds UI for managing multiple entries in `phones[]`.
- **ID generation**: New phone rows and new contacts get `id`s from
  `crypto.randomUUID()` at creation time, consistent with Phase 1. Existing phone
  `id`s are preserved across edits so list keys stay stable.
- **New-contact construction in add mode**: Built the same way as Phase 1 (new
  contact `id`, `name.first` from the name input, `emails`/`addresses` as `[]`)
  but with `phones[]` containing every non-empty row the user entered, normalized
  so the first is `isPrimary`.
- **Styling**: Continue the Phase 1 approach — custom CSS in the single global
  stylesheet using Material Design 3 tokens (CSS custom properties), with M3 cues
  for the new affordances (add/remove-row buttons, Edit/Delete/Save/Cancel
  actions) including hover/focus/pressed/disabled states. No CSS Modules, no
  inline style objects, no Material component library, no external UI library.
- **Tech-stack constraints (unchanged)**: React functional components; `useState`
  only; state kept local; no custom hooks; no global state, context, reducers,
  or state/form libraries.

## Testing Decisions

- **What makes a good test here**: Tests assert *external, user-visible behavior*
  through the rendered UI — what the user types, clicks, and sees — never
  component internals, prop wiring, or state-variable names. A test should
  survive any refactor that preserves behavior (e.g. renaming `AddContactForm` to
  `ContactForm`, or moving edit state between `App` and `ContactCard`).
- **Seam (reused, highest available)**: Test at the `<App />` seam — render
  `<App />` and drive everything through the DOM, seeding existing contacts via
  the existing `initialContacts` prop. Do **not** test `ContactForm`,
  `ContactList`, or `ContactCard` in isolation; their behavior is covered
  transitively through `<App />`. No new seam is introduced for Phase 2.
- **Tooling**: Vitest + React Testing Library (`@testing-library/react` +
  `@testing-library/user-event`), matching the existing `src/App.test.tsx` and
  `src/test/setup.ts`.
- **Behaviors to cover (against the Acceptance Criteria)**:
  - Add with multiple phones: in the add form, add a second phone row, fill name
    and two numbers, submit, and see a contact that shows both numbers.
  - Add-form remove row: an added phone row can be removed before saving, and the
    removed number does not appear on the saved contact.
  - Edit opens pre-filled: clicking Edit on a seeded contact reveals a form whose
    name and phone fields already contain that contact's current values.
  - Edit name: changing the name and saving updates the displayed name in the
    list immediately.
  - Edit phone value/label: changing a number (and/or its label) and saving shows
    the new value in the list immediately.
  - Add phone while editing: adding a phone row during edit and saving makes the
    new number appear on that contact.
  - Delete a phone while editing: removing one of several phone rows and saving
    leaves the contact present with the remaining numbers and without the removed
    one.
  - Cancel edit: making changes then cancelling leaves the contact unchanged and
    returns to display mode.
  - Delete contact: clicking Delete removes that contact from the list
    immediately while leaving other contacts intact; deleting the only contact
    returns the empty-state message.
  - Last-phone guard: when a contact (or the add form) has exactly one phone row,
    the Remove control for that row is disabled/absent.
  - Empty-name guard: an empty/whitespace name keeps the Save/Add button disabled.
  - Empty-phone guard: with the name filled but the only phone empty/whitespace,
    Save/Add is disabled; a whitespace-only extra row is dropped rather than
    saved.
  - Immediate reflection: each create/update/delete is visible without any
    further action.
  - Queryability: inputs and actions are reachable by their visible labels/roles
    (`getByLabelText`, `getByRole`), and the existing Phase 1 behaviors still pass.
- **Prior art**: `src/App.test.tsx` is the home for these tests and already
  demonstrates the patterns to follow — `render(<App .../>)`, `initialContacts`
  seeding, `getByLabelText`/`getByRole`, and `user-event` interactions. Extend it
  rather than introducing component-level test files.

## Out of Scope

- Search and filtering.
- Duplicate detection.
- Persistence (LocalStorage / API / database) — contacts live only in memory for
  the session.
- Backend / API integration.
- Email and address UI (the model supports them; still no inputs).
- A dedicated "make primary" picker (primary is derived from position).
- Advanced or format-specific phone/name validation (only the empty guard).
- Anything from Phase 3.

## Further Notes

- **Phase order is strict**: Phase 2 only, and only after Phase 1 meets its
  Acceptance Criteria and Definition of Done. Do not pull work forward from
  Phase 3; anything under Out of Scope is forbidden even if convenient.
- **`AddContactForm` is being subsumed**: Phase 2 evolves the Phase 1
  `AddContactForm` into a shared `ContactForm`. This is an internal refactor of an
  existing component, not new surface area — the Phase 1 add behavior and its
  tests must keep passing.
- **Definition of Done** (from requirements): all CRUD operations work
  end-to-end; multiple phone numbers per contact can be added and removed; the UI
  reflects changes immediately; clean, readable component structure; no unused
  code or dead state; UI functional (styling can be minimal, though we continue
  the Material Design 3 approach).
- **Tracker note**: published as a local Markdown PRD under `.scratch/` per this
  repo's local issue-tracker convention, matching the Phase 1 PRD's flat naming.
  `ready-for-agent` is recorded in the header above rather than as a tracker
  label.
