import type { Contact } from "../types";
import { ContactCard } from "./ContactCard";
import type { PhoneRow } from "./PhoneNumberFields";

type CardAction = { id: string; type: "saving" | "deleting" };
type CardError = { id: string; message: string };

type ContactListProps = {
  contacts: Contact[];
  duplicateNumbers: Set<string>;
  cardAction: CardAction | null;
  cardError: CardError | null;
  onDelete: (id: string) => Promise<boolean>;
  onUpdate: (id: string, name: string, phones: PhoneRow[]) => Promise<boolean>;
};

export function ContactList({
  contacts,
  duplicateNumbers,
  cardAction,
  cardError,
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
          duplicateNumbers={duplicateNumbers}
          action={cardAction?.id === contact.id ? cardAction.type : null}
          error={cardError?.id === contact.id ? cardError.message : null}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </ul>
  );
}
