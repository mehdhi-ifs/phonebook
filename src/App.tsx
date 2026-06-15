import { useState } from "react";
import type { Contact } from "./types";
import { DEFAULT_CONTACT_LABEL } from "./types";
import { ContactList } from "./components/ContactList";
import { AddContactForm } from "./components/AddContactForm";

type AppProps = {
  initialContacts?: Contact[];
};

export function App({ initialContacts = [] }: AppProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);

  function addContact(name: string, phone: string) {
    const contact: Contact = {
      id: crypto.randomUUID(),
      name: { first: name },
      phones: [
        {
          id: crypto.randomUUID(),
          label: DEFAULT_CONTACT_LABEL,
          number: phone,
          isPrimary: true,
        },
      ],
      emails: [],
      addresses: [],
    };
    setContacts((current) => [...current, contact]);
  }

  return (
    <main className="app">
      <h1 className="app__title">Phone Book</h1>
      <section className="surface">
        <AddContactForm onAdd={addContact} />
      </section>
      <section className="surface">
        <ContactList contacts={contacts} />
      </section>
    </main>
  );
}
