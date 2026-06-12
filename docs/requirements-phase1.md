# Phase 1 — Phone Book: View & Add Contacts (Minimal Slice)

## 🎯 Objective

Build the first working slice of a phone book application. In this phase, a user can:

- View a list of saved contacts
- Add a new contact with a name and a single phone number

The goal is a small, complete, end-to-end feature — not a full-featured product.

---

## 🚦 Phase Order & Scope (Strict)

- **Phases must be completed strictly in order: Phase 1 → Phase 2 → Phase 3.**
- Do **not** start the next phase until the current phase is fully complete and meets its **Acceptance Criteria** and **Definition of Done**.
- This is Phase 1. Build **only** what is listed under **Features** for this phase.
- **Strict scope:** implement exactly what this phase specifies — no more, no less. Do not pull work forward from later phases, and do not add features listed under **Out of Scope**.
- Anything in **Out of Scope** is forbidden in this phase, even if it seems convenient.

---

## 🧩 Features

### 1. View Contacts

- Display all contacts in a list.
- Each contact must show:
  - Name
  - Phone number (single)
- If there are no contacts yet, show a simple empty-state message (e.g. "No contacts yet").

### 2. Add Contact

- Provide a form with:
  - Name input
  - Phone number input
  - An "Add" button
- On submit:
  - A new contact is added to the list.
  - The newly added contact appears immediately.
  - The form inputs reset to empty.
- Basic guard: do not add a contact when the name or phone is empty.

---

## 🎨 UI Guidelines

- The UI for all phases must follow Google's [Material Design](https://m3.material.io/) guidelines.
- Apply Material Design principles for layout, spacing, typography, color, elevation, and interactive states (hover, focus, pressed, disabled).
- Use Material Design patterns for common elements: text fields, buttons, lists, and empty states.
- Ensure accessibility: sufficient color contrast, visible focus indicators, and adequate touch target sizes.
- Because external UI libraries are not allowed (see Constraints), implement these guidelines with custom CSS/styling rather than a Material component library.

---

## 📦 Data Model

The data model is designed up front to support future phases (multiple phone
numbers, emails, labeled entries, and addresses), even though Phase 1 only
exercises a small part of it.

```ts
// Built-in labels offered as defaults in the UI (e.g. a dropdown).
type DefaultContactLabel = "home" | "work" | "mobile" | "main" | "other";

// The default label applied when the user does not pick one.
const DEFAULT_CONTACT_LABEL: DefaultContactLabel = "mobile";

// A label is either one of the built-in defaults or a user-supplied custom
// string. `string & {}` keeps editor autocomplete for the defaults while
// still allowing any custom value.
type ContactLabel = DefaultContactLabel | (string & {});

type PhoneNumber = {
  id: string;          // unique within the contact
  label: ContactLabel; // e.g. "home", "work", "mobile"
  number: string;      // the phone number
  isPrimary?: boolean; // marks the preferred number
};

type EmailAddress = {
  id: string;          // unique within the contact
  label: ContactLabel; // e.g. "home", "work"
  email: string;       // the email address
  isPrimary?: boolean; // marks the preferred email
};

type PostalAddress = {
  id: string;          // unique within the contact
  label: ContactLabel; // e.g. "home", "work"
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

type ContactName = {
  first: string;
  last?: string;
  display?: string; // optional override for how the name is shown
};

type Contact = {
  id: string;               // unique identifier (e.g. generated at add time)
  name: ContactName;        // structured name
  phones: PhoneNumber[];    // zero or more phone numbers
  emails: EmailAddress[];   // zero or more emails
  addresses: PostalAddress[]; // zero or more postal addresses
};
```

State shape: a single array of `Contact` objects held in component state.

### Phase 1 usage

To keep Phase 1 minimal, the UI only collects and displays:

- `name` — at minimum the `first` field
- a single entry in `phones[]` (label defaults to `DEFAULT_CONTACT_LABEL`, marked `isPrimary`)

`emails` and `addresses` are part of the type from the start (initialized as
empty arrays) so later phases can build on the same structure without a
migration. The form does not need inputs for them yet.

---

## ✅ Acceptance Criteria

- The contact list renders all existing contacts correctly.
- A user can type a name and phone number and add a contact.
- The new contact appears in the list immediately after submission.
- The form resets after a successful submission.
- Submitting with an empty name or phone does not add a contact.
- An empty list shows a clear empty-state message.

---

## ❌ Out of Scope

- UI for multiple phone numbers, emails, or addresses (the data model supports them; Phase 1 only exposes a single phone)
- Edit / update functionality
- Delete functionality
- Search and filtering
- Duplicate detection
- Persistence (LocalStorage / API / database)
- Advanced or format-specific validation

---

## ⚠️ Constraints (Strict)

- Use React functional components.
- Use only `useState` for state management.
- Keep state local (no global state, no context).
- No custom hooks.
- No external libraries (UI, state, or form libraries).

---

## 📦 Suggested Components

- `App` — owns the contacts state and composes the UI
- `ContactList` — renders the list of contacts
- `ContactCard` — renders a single contact's name and phone
- `AddContactForm` — controlled inputs and submit handling

---

## ✅ Definition of Done

- Feature works end-to-end (view + add).
- Clean, readable component structure.
- No unused code or dead state.
- UI is functional (styling can be minimal).
