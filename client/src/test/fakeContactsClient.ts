import type { Contact, ContactName, PhoneNumber } from "../types";
import type {
  ContactInput,
  ContactsClient,
} from "../api/contactsClient";

const DEFAULT_LABEL = "mobile";

function trimName(name: ContactInput["name"]): ContactName {
  const trimmed: ContactName = { first: name.first.trim() };
  const last = name.last?.trim();
  if (last) trimmed.last = last;
  const display = name.display?.trim();
  if (display) trimmed.display = display;
  return trimmed;
}

function buildPhones(input: ContactInput, preserveIds: boolean): PhoneNumber[] {
  const primaryIndex = Math.max(
    0,
    input.phones.findIndex((phone) => phone.isPrimary),
  );
  return input.phones.map((phone, index) => ({
    id: preserveIds ? phone.id ?? crypto.randomUUID() : crypto.randomUUID(),
    label: phone.label?.trim() || DEFAULT_LABEL,
    number: phone.number.trim(),
    isPrimary: index === primaryIndex,
  }));
}

function validate(input: ContactInput): void {
  if (!input.name?.first || input.name.first.trim() === "") {
    throw new Error("Contact name is required");
  }
  if (!Array.isArray(input.phones) || input.phones.length === 0) {
    throw new Error("At least one phone number is required");
  }
  if (input.phones.some((phone) => !phone.number || phone.number.trim() === "")) {
    throw new Error("Phone numbers cannot be empty");
  }
}

function displayName(contact: Contact): string {
  const { first, last } = contact.name;
  return last ? `${first} ${last}` : first;
}

export function makeFakeContactsClient(
  initial: Contact[] = [],
): ContactsClient {
  let store: Contact[] = initial.map((contact) => structuredClone(contact));

  return {
    async list(query?: string) {
      let result = store;
      const q = query?.trim().toLowerCase();
      if (q) {
        result = store.filter(
          (contact) =>
            displayName(contact).toLowerCase().includes(q) ||
            contact.phones.some((phone) =>
              phone.number.toLowerCase().includes(q),
            ),
        );
      }
      return result.map((contact) => structuredClone(contact));
    },

    async get(id: string) {
      const found = store.find((contact) => contact.id === id);
      if (!found) throw new Error("Contact not found");
      return structuredClone(found);
    },

    async create(input: ContactInput) {
      validate(input);
      const contact: Contact = {
        id: crypto.randomUUID(),
        name: trimName(input.name),
        phones: buildPhones(input, false),
        emails: [],
        addresses: [],
      };
      store = [...store, contact];
      return structuredClone(contact);
    },

    async update(id: string, input: ContactInput) {
      validate(input);
      const index = store.findIndex((contact) => contact.id === id);
      if (index === -1) throw new Error("Contact not found");
      const updated: Contact = {
        ...store[index],
        name: trimName(input.name),
        phones: buildPhones(input, true),
      };
      store = store.map((contact, i) => (i === index ? updated : contact));
      return structuredClone(updated);
    },

    async remove(id: string) {
      store = store.filter((contact) => contact.id !== id);
    },
  };
}
