import type { Contact } from "../types";
import { ContactCard } from "./ContactCard";

type ContactListProps = {
  contacts: Contact[];
};

export function ContactList({ contacts }: ContactListProps) {
  if (contacts.length === 0) {
    return (
      <section className="contact-list card" aria-label="Contacts">
        <p className="empty-state">No contacts yet</p>
      </section>
    );
  }

  return (
    <section className="contact-list card" aria-label="Contacts">
      <ul className="contact-list__items">
        {contacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </ul>
    </section>
  );
}
