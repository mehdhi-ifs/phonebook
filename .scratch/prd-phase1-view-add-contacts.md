# PRD — Phase 1: View & Add Contacts (Minimal Slice)

**Status:** ready-for-agent
**Source:** `docs/requirements-phase1.md`

---

## Problem Statement

A person needs a simple place to keep track of who they know and how to reach
them. Right now there is no application at all — no way to see saved contacts and
no way to record a new one. Without even the most basic "see my people / add a
person" loop, there is nothing to build the rest of the phone book on.

## Solution

Deliver the first working, end-to-end slice of the phone book: a single screen
where a user can see every contact they have saved and add a new one by entering
a name and a phone number. When the user adds a contact, it appears immediately
in the list and the form clears, ready for the next entry. When there are no
contacts, the screen says so clearly. This is intentionally minimal — one phone
number per contact, no editing, no deleting, no persistence — but it is complete
and usable on its own.

## User Stories

1. As a phone book user, I want to see a list of all my saved contacts, so that I can find the people I know in one place.
2. As a phone book user, I want each contact in the list to show a name, so that I can identify who the contact is.
3. As a phone book user, I want each contact in the list to show a phone number, so that I know how to reach that person.
4. As a phone book user with no contacts yet, I want to see a clear "No contacts yet" message instead of a blank screen, so that I understand the list is empty rather than broken.
5. As a phone book user, I want a form with a name field, so that I can record who a new contact is.
6. As a phone book user, I want a form with a phone number field, so that I can record how to reach a new contact.
7. As a phone book user, I want an "Add" button, so that I have a clear action to save the new contact.
8. As a phone book user, I want a newly added contact to appear in the list immediately after I submit, so that I get instant confirmation it was saved.
9. As a phone book user, I want the form inputs to reset to empty after a successful add, so that I can quickly enter another contact without manually clearing the fields.
10. As a phone book user, I want adding to be blocked when the name is empty, so that I don't create nameless, useless entries.
11. As a phone book user, I want adding to be blocked when the phone number is empty, so that I don't create contacts I can't actually call.
12. As a phone book user, I want to add several contacts in a row, so that I can build up my phone book in one sitting.
13. As a phone book user on any device, I want the screen to follow familiar Material Design patterns, so that the app feels polished and predictable.
14. As a keyboard or assistive-technology user, I want visible focus indicators and sufficient contrast on the form and list, so that I can use the app without a mouse and read it comfortably.
15. As a touch user, I want the inputs and the Add button to have adequately sized touch targets, so that I can tap them reliably on a small screen.

## Implementation Decisions

- **App shell — `App`**: Owns the single source of truth for contacts as
  `useState<Contact[]>`. Composes the screen from `AddContactForm` and
  `ContactList`. Exposes an "add contact" handler down to the form. No other
  state lives above or beside it (no global state, no context).
- **List rendering — `ContactList`**: Receives the contacts array as a prop.
  Renders the empty-state message ("No contacts yet") when the array is empty,
  otherwise renders one `ContactCard` per contact.
- **Single contact — `ContactCard`**: Receives one `Contact` and renders its
  display name and its primary phone number. Reads the name from `name.first`
  (the only field Phase 1 populates), rendering `last` too if a later phase sets
  it; reads the phone from the single entry in `phones[]`.
- **Add form — `AddContactForm`**: A real `<form>` element with `onSubmit`
  (the Add button is `type="submit"`, so Enter submits). Controlled `name` and
  `phone` inputs, each with a **visible, associated `<label>`** (Material
  text-field pattern; not placeholder-only). The Add button is **disabled until
  both fields are non-empty after trimming**, so an invalid add is impossible to
  trigger. On a valid submit it calls the parent's add handler, then clears both
  inputs.
- **Name mapping**: The single name input maps to `ContactName.first` (the whole
  trimmed string); `last` and `display` are left unset in Phase 1.
- **Validation**: Trim name and phone before validating, and store the trimmed
  values. Whitespace-only input counts as empty (and keeps the button disabled).
- **Data model (full shape adopted now)**: Use the `Contact` type from the
  requirements verbatim, including `emails` and `addresses`, even though Phase 1
  doesn't expose them. This avoids a migration in later phases.

  ```ts
  type Contact = {
    id: string;
    name: ContactName;           // { first, last?, display? }
    phones: PhoneNumber[];       // { id, label, number, isPrimary? }
    emails: EmailAddress[];      // initialized as []
    addresses: PostalAddress[];  // initialized as []
  };
  ```

- **Add-time contact construction**: On a valid add, build a `Contact` with a
  generated `id`, `name.first` set from the name input, a single `PhoneNumber`
  in `phones[]` with a generated `id`, `label` defaulting to
  `DEFAULT_CONTACT_LABEL` (`"mobile"`), `number` from the phone input, and
  `isPrimary: true`. `emails` and `addresses` are initialized to `[]`.
- **ID generation**: Generate unique `id`s at add time with
  `crypto.randomUUID()` (built into modern browsers and Node/jsdom); no external
  id library.
- **List order**: New contacts are **appended** (insertion order). No sorting.
- **Styling**: Custom CSS in a **single global stylesheet** (e.g. `index.css`)
  using **CSS custom properties for the Material Design 3 tokens** (color, type
  scale, spacing, elevation). Implements M3 cues for layout, typography, color,
  elevation, and interactive states (hover/focus/pressed/disabled) on the text
  fields, button, list items, and empty state. No CSS Modules, no inline style
  objects, no Material component library, no other UI library.
- **Tech stack / constraints**: React functional components; `useState` only;
  state kept local; no custom hooks; no external UI, state, or form libraries.

## Testing Decisions

- **What makes a good test here**: Tests assert *external, user-visible
  behavior* through the rendered UI — what a user types, clicks, and sees — never
  component internals, props wiring, or state variable names. A test should
  survive any refactor that preserves behavior (e.g. splitting or merging
  `ContactList`/`ContactCard`).
- **Seam**: Test at the highest seam — render `<App />` and drive it entirely
  through the DOM. Do not test `ContactList`, `ContactCard`, or
  `AddContactForm` in isolation; their behavior is covered transitively through
  `<App />`.
- **Tooling**: Vitest + React Testing Library (`@testing-library/react` +
  `@testing-library/user-event`), matching the existing intended setup
  (`src/App.test.tsx`, `src/test/setup.ts`).
- **Behaviors to cover (against the Acceptance Criteria)**:
  - Empty state: a fresh `<App />` shows the "No contacts yet" message and no
    contact items.
  - Add happy path: typing a name and phone and clicking Add makes a new contact
    with that name and number appear in the list.
  - Immediate render: the added contact is visible without any further action.
  - Form reset: after a successful add, the name and phone inputs are empty.
  - Empty-name guard: with an empty/whitespace name (phone filled), the Add
    button is disabled (asserted via its disabled state, since the disabled
    button can't be clicked).
  - Empty-phone guard: with an empty/whitespace phone (name filled), the Add
    button is disabled.
  - Multiple adds: adding two contacts in a row results in both appearing, in
    insertion order.
  - Keyboard submit: filling both fields and pressing Enter adds the contact
    (the `<form>` onSubmit path).
  - Inputs are queryable by their visible labels (`getByLabelText`).
- **Prior art**: `src/App.test.tsx` is the home for these tests; follow standard
  RTL query-by-role/label and `user-event` interaction patterns.

## Out of Scope

- UI for multiple phone numbers, emails, or addresses (the data model supports
  them; Phase 1 exposes only a single phone).
- Edit / update functionality.
- Delete functionality.
- Search and filtering.
- Duplicate detection.
- Persistence (LocalStorage / API / database) — contacts live only in memory for
  the session.
- Advanced or format-specific phone/name validation (only the empty guard).
- Anything from Phase 2 or Phase 3.

## Further Notes

- **Phase order is strict**: Phase 1 only. Do not pull work forward from later
  phases; anything listed under Out of Scope is forbidden even if convenient.
- **Project setup gap**: The repo is currently greenfield — `src/` has only an
  empty `assets/` folder and there is no `package.json` yet. **Standing up the
  Vite + React + TypeScript + Vitest toolchain is the FIRST issue to be sliced
  from this PRD**, ordered before any view/add feature work.
- **Skills not yet configured**: `setup-matt-pocock-skills` has not been run
  (no `AGENTS.md`/`CLAUDE.md`, no `docs/agents/`), so there is no configured
  issue tracker. This PRD is published as a local Markdown file under `.scratch/`
  by user choice; the `ready-for-agent` status is recorded in the header above
  rather than as a tracker label.
- **Definition of Done** (from requirements): feature works end-to-end
  (view + add), clean and readable component structure, no unused code or dead
  state, UI functional.
