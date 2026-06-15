import type { Contact } from "../types";
import { getDisplayName } from "../types";

type ContactCardProps = {
  contact: Contact;
};

export function ContactCard({ contact }: ContactCardProps) {
  const displayName = getDisplayName(contact.name);
  const primaryPhone = contact.phones.find((p) => p.isPrimary) ?? contact.phones[0];
  const initial = displayName.charAt(0).toUpperCase() || "?";

  return (
    <li className="contact-card">
      <div className="contact-card__avatar" aria-hidden="true">
        {initial}
      </div>
      <div className="contact-card__body">
        <span className="contact-card__name">{displayName}</span>
        {primaryPhone && (
          <span className="contact-card__phone">{primaryPhone.number}</span>
        )}
      </div>
    </li>
  );
}
