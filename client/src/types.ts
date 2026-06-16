export type DefaultContactLabel = "home" | "work" | "mobile" | "main" | "other";

export const DEFAULT_CONTACT_LABEL: DefaultContactLabel = "mobile";

export type ContactLabel = DefaultContactLabel | (string & {});

export type PhoneNumber = {
  id: string;
  label: ContactLabel;
  number: string;
  isPrimary?: boolean;
};

export type EmailAddress = {
  id: string;
  label: ContactLabel;
  email: string;
  isPrimary?: boolean;
};

export type PostalAddress = {
  id: string;
  label: ContactLabel;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export type ContactName = {
  first: string;
  last?: string;
  display?: string;
};

export type Contact = {
  id: string;
  name: ContactName;
  phones: PhoneNumber[];
  emails: EmailAddress[];
  addresses: PostalAddress[];
};
