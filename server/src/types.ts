export type ContactName = {
  first: string;
  last?: string;
  display?: string;
};

export type PhoneNumber = {
  id: string;
  label: string;
  number: string;
  isPrimary?: boolean;
};

export type Contact = {
  id: string;
  name: ContactName;
  phones: PhoneNumber[];
  emails: never[];
  addresses: never[];
};

export type PhoneInput = {
  id?: string;
  label?: string;
  number: string;
  isPrimary?: boolean;
};

export type ContactInput = {
  name: ContactName;
  phones: PhoneInput[];
};
