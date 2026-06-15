# Phase 2 — Full CRUD & Multiple Phone Numbers

## 🎯 Objective

Build on the Phase 1 slice so the phone book becomes a fully editable list. In
this phase, a user can:

- Add a contact with **one or more** phone numbers
- Edit an existing contact's name and phone numbers
- Delete an entire contact
- Delete an individual phone number from a contact

This phase is intended for:

- Core team implementation
- Bootcamp attendee take-home exercise

The goal is a complete in-memory CRUD experience for contacts and their phone
numbers — still no search, persistence, or backend.

---

## 🚦 Phase Order & Scope (Strict)

- **Phases must be completed strictly in order: Phase 1 → Phase 2 → Phase 3.**
- Do **not** start this phase until **Phase 1** is fully complete and meets its **Acceptance Criteria** and **Definition of Done**.
- Do **not** start **Phase 3** until this phase is fully complete and meets its **Acceptance Criteria** and **Definition of Done**.
- **Strict scope:** implement exactly what this phase specifies — no more, no less. Do not pull work forward from Phase 3, and do not add features listed under **Out of Scope**.
- Anything in **Out of Scope** is forbidden in this phase, even if it seems convenient.

---

## 🧩 Features

### 1. Multiple Phone Numbers

- A contact can have one or more phone numbers.
- When adding or editing a contact, the user can:
  - Add another phone number input (dynamically).
  - Remove a phone number input.
- Each phone number keeps its `label` (defaults to `DEFAULT_CONTACT_LABEL`).
- At least one phone number should be marked `isPrimary`.
- Basic guard: do not save a phone number with an empty value.

### 2. Edit Contact

- Each contact in the list has an **Edit** action.
- Editing opens the contact's current values in a form.
- The user can update:
  - Name
  - Any phone number's value and label
  - Add or remove phone numbers
- On save:
  - The contact updates in place in the list.
  - The updated values appear immediately.
- The user can cancel an edit without changing the contact.

### 3. Delete Operations

- **Delete contact:** remove an entire contact from the list.
- **Delete phone number:** remove a single phone number from a contact while
  editing, leaving the rest of the contact intact.
- Guard: a contact must keep at least one phone number (deleting the last phone
  number is not allowed, or deletes the whole contact — pick one and be
  consistent).

---

## 🎨 UI Guidelines

- The UI for all phases must follow Google's [Material Design](https://m3.material.io/) guidelines.
- Apply Material Design principles for layout, spacing, typography, color, elevation, and interactive states (hover, focus, pressed, disabled).
- Use Material Design patterns for common elements: text fields, buttons, lists, dynamic add/remove rows, edit forms, and confirmation/delete actions.
- Ensure accessibility: sufficient color contrast, visible focus indicators, and adequate touch target sizes.
- Because external UI libraries are not allowed (see Constraints), implement these guidelines with custom CSS/styling rather than a Material component library.

### Layout

- Use a **two-pane layout** below the app title:
  - **Add contact** on one side and the **Contacts** list on the other (the
    "Add" pane is the narrower, fixed-ish column; the list pane takes the
    remaining space).
  - Each pane is a Material **surface** (rounded corners, elevation) with its own
    section heading (e.g. "Add contact", "Contacts").
  - On wide viewports the "Add" pane may **stick** in place while the contacts
    list scrolls.
- The layout must be **responsive**:
  - At a small-screen breakpoint (≈768px and below) the two panes **collapse to a
    single column** and the "Add" pane stops sticking.
  - Phone-number rows, contact cards, and action buttons should **wrap
    gracefully** rather than overflow on narrow screens.
- Contact cards display the contact's name, all phone numbers (primary first,
  each with a label chip and a primary marker), and the Edit/Delete actions.

---

## 📦 Data Model

Phase 2 uses the **same `Contact` model defined in Phase 1** — no migration is
needed. Phase 1 already initializes `phones`, `emails`, and `addresses` as
arrays; Phase 2 simply exposes UI for managing multiple entries in `phones[]`.

```ts
type DefaultContactLabel = "home" | "work" | "mobile" | "main" | "other";
const DEFAULT_CONTACT_LABEL: DefaultContactLabel = "mobile";
type ContactLabel = DefaultContactLabel | (string & {});

type PhoneNumber = {
  id: string;          // unique within the contact
  label: ContactLabel; // e.g. "home", "work", "mobile"
  number: string;      // the phone number
  isPrimary?: boolean; // marks the preferred number
};

type ContactName = {
  first: string;
  last?: string;
  display?: string; // optional override for how the name is shown
};

type Contact = {
  id: string;
  name: ContactName;
  phones: PhoneNumber[];      // Phase 2 manages multiple entries here
  emails: EmailAddress[];     // still initialized empty; no UI yet
  addresses: PostalAddress[]; // still initialized empty; no UI yet
};
```

State shape: a single array of `Contact` objects held in component state.

### Phase 2 usage

- The form now reads and writes the full `phones[]` array (add / edit / remove).
- `emails` and `addresses` remain part of the type and are still left as empty
  arrays — no UI for them yet.
- Each phone number needs a stable `id` (generated at add time) to use as a list
  key and to target deletes/updates.

---

## ✅ Acceptance Criteria

- A user can create a contact with multiple phone numbers.
- A user can edit an existing contact's name and phone numbers.
- A user can add a phone number to an existing contact.
- A user can delete an individual phone number from a contact.
- A user can delete an entire contact.
- The list reflects every create, update, and delete immediately.
- Saving with an empty name or an empty phone number is prevented.
- A contact always has at least one phone number.

---

## ❌ Out of Scope

- Search and filtering
- Duplicate detection
- Persistence (LocalStorage / API / database)
- Backend / API integration
- Email and address UI (the model supports them; no inputs yet)
- Advanced or format-specific validation

---

## ⚠️ Constraints (Strict)

- Use React functional components.
- Use only `useState` for state management.
- Keep state local (no global state, no context).
- No state management libraries (Redux, Zustand, etc.).
- No backend integration.
- No external libraries (UI, state, or form libraries).
- Avoid over-abstraction — keep logic simple and local.


## ✅ Definition of Done

- All CRUD operations (create, read, update, delete) work end-to-end.
- Multiple phone numbers per contact can be added and removed.
- The UI reflects changes immediately.
- Clean, readable component structure.
- No unused code or dead state.
- UI is functional (styling can be minimal).
