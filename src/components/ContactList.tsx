import type { Contact } from "../types";
import { ContactCard } from "./ContactCard";

type ContactListProps = {
  contacts: Contact[];
};

export function ContactList({ contacts }: ContactListProps) {
  if (contacts.length === 0) {
    return <p className="empty-state">No contacts yet</p>;
  }

  return (
    <ul className="contact-list">
      {contacts.map((contact) => (
        <ContactCard key={contact.id} contact={contact} />
      ))}
    </ul>
  );
}
