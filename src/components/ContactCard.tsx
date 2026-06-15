import type { Contact } from "../types";

type ContactCardProps = {
  contact: Contact;
};

function displayName(contact: Contact): string {
  const { first, last } = contact.name;
  return last ? `${first} ${last}` : first;
}

function primaryPhone(contact: Contact): string {
  const primary = contact.phones.find((phone) => phone.isPrimary);
  return (primary ?? contact.phones[0])?.number ?? "";
}

export function ContactCard({ contact }: ContactCardProps) {
  return (
    <li className="contact-card">
      <span className="contact-card__name">{displayName(contact)}</span>
      <span className="contact-card__phone">{primaryPhone(contact)}</span>
    </li>
  );
}
