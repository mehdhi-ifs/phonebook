// Built-in labels offered as defaults in the UI (e.g. a dropdown).
export type DefaultContactLabel = "home" | "work" | "mobile" | "main" | "other";

// The default label applied when the user does not pick one.
export const DEFAULT_CONTACT_LABEL: DefaultContactLabel = "mobile";

// A label is either one of the built-in defaults or a user-supplied custom
// string. `string & {}` keeps editor autocomplete for the defaults while
// still allowing any custom value.
export type ContactLabel = DefaultContactLabel | (string & {});

export type PhoneNumber = {
  id: string; // unique within the contact
  label: ContactLabel; // e.g. "home", "work", "mobile"
  number: string; // the phone number
  isPrimary?: boolean; // marks the preferred number
};

export type EmailAddress = {
  id: string; // unique within the contact
  label: ContactLabel; // e.g. "home", "work"
  email: string; // the email address
  isPrimary?: boolean; // marks the preferred email
};

export type PostalAddress = {
  id: string; // unique within the contact
  label: ContactLabel; // e.g. "home", "work"
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export type ContactName = {
  first: string;
  last?: string;
  display?: string; // optional override for how the name is shown
};

export type Contact = {
  id: string; // unique identifier (e.g. generated at add time)
  name: ContactName; // structured name
  phones: PhoneNumber[]; // zero or more phone numbers
  emails: EmailAddress[]; // zero or more emails
  addresses: PostalAddress[]; // zero or more postal addresses
};

export function getDisplayName(name: ContactName): string {
  if (name.display && name.display.trim()) return name.display.trim();
  return [name.first, name.last].filter(Boolean).join(" ").trim();
}
