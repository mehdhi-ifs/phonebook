import type { Contact } from "../types";
import { ContactCard } from "./ContactCard";
import type { PhoneRow } from "./PhoneNumberFields";

type ContactListProps = {
  contacts: Contact[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, name: string, phones: PhoneRow[]) => void;
};

export function ContactList({
  contacts,
  onDelete,
  onUpdate,
}: ContactListProps) {
  if (contacts.length === 0) {
    return <p className="empty-state">No contacts yet</p>;
  }

  return (
    <ul className="contact-list" aria-label="Contacts">
      {contacts.map((contact) => (
        <ContactCard
          key={contact.id}
          contact={contact}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </ul>
  );
}
