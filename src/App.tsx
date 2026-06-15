import { useState } from "react";
import type { Contact } from "./types";
import { ContactList } from "./components/ContactList";
import { AddContactForm } from "./components/AddContactForm";
import type { PhoneRow } from "./components/PhoneNumberFields";

type AppProps = {
  initialContacts?: Contact[];
};

export function App({ initialContacts = [] }: AppProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);

  function addContact(name: string, phones: PhoneRow[]) {
    const contact: Contact = {
      id: crypto.randomUUID(),
      name: { first: name },
      phones: phones.map((phone, index) => ({
        id: phone.id,
        label: phone.label,
        number: phone.number,
        isPrimary: index === 0,
      })),
      emails: [],
      addresses: [],
    };
    setContacts((current) => [...current, contact]);
  }

  function deleteContact(id: string) {
    setContacts((current) => current.filter((contact) => contact.id !== id));
  }

  function updateContact(id: string, name: string, phones: PhoneRow[]) {
    setContacts((current) =>
      current.map((contact) => {
        if (contact.id !== id) return contact;
        const chosenPrimary = phones.find((phone) => phone.isPrimary);
        const primaryId = chosenPrimary?.id ?? phones[0]?.id;
        return {
          ...contact,
          name: { ...contact.name, first: name },
          phones: phones.map((phone) => ({
            id: phone.id,
            label: phone.label,
            number: phone.number,
            isPrimary: phone.id === primaryId,
          })),
        };
      }),
    );
  }

  return (
    <main className="app">
      <h1 className="app__title">Phone Book</h1>
      <div className="app__layout">
        <section className="surface app__pane app__pane--add">
          <h2 className="pane__title">Add contact</h2>
          <AddContactForm onAdd={addContact} />
        </section>
        <section className="surface app__pane app__pane--contacts">
          <h2 className="pane__title">Contacts</h2>
          <ContactList
            contacts={contacts}
            onDelete={deleteContact}
            onUpdate={updateContact}
          />
        </section>
      </div>
    </main>
  );
}
