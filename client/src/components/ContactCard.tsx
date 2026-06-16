import { useState } from "react";
import type { Contact, PhoneNumber } from "../types";
import { EditContactForm } from "./EditContactForm";
import type { PhoneRow } from "./PhoneNumberFields";

type ContactCardProps = {
  contact: Contact;
  duplicateNumbers: Set<string>;
  action: "saving" | "deleting" | null;
  error: string | null;
  onDelete: (id: string) => Promise<boolean>;
  onUpdate: (id: string, name: string, phones: PhoneRow[]) => Promise<boolean>;
};

function displayName(contact: Contact): string {
  const { first, last } = contact.name;
  return last ? `${first} ${last}` : first;
}

function phonesPrimaryFirst(contact: Contact): PhoneNumber[] {
  const primaryIndex = contact.phones.findIndex((phone) => phone.isPrimary);
  if (primaryIndex <= 0) return contact.phones;
  const primary = contact.phones[primaryIndex];
  const rest = contact.phones.filter((_, index) => index !== primaryIndex);
  return [primary, ...rest];
}

export function ContactCard({
  contact,
  duplicateNumbers,
  action,
  error,
  onDelete,
  onUpdate,
}: ContactCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isSaving = action === "saving";
  const isDeleting = action === "deleting";

  if (isEditing) {
    return (
      <li className="contact-card">
        <EditContactForm
          contact={contact}
          saving={isSaving}
          error={error}
          onSave={async (id, name, phones) => {
            const ok = await onUpdate(id, name, phones);
            if (ok) setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="contact-card">
      <span className="contact-card__name">{displayName(contact)}</span>
      <ul className="contact-card__phones">
        {phonesPrimaryFirst(contact).map((phone) => (
          <li key={phone.id} className="contact-card__phone">
            <span className="contact-card__phone-label">{phone.label}</span>
            <span className="contact-card__phone-number">{phone.number}</span>
            {phone.isPrimary && (
              <span className="contact-card__primary-badge">Primary</span>
            )}
            {duplicateNumbers.has(phone.number) && (
              <span
                className="contact-card__duplicate-badge"
                title="This number appears on more than one contact"
              >
                Duplicate
              </span>
            )}
          </li>
        ))}
      </ul>
      <div className="contact-card__actions">
        {confirmingDelete ? (
          <>
            <span className="contact-card__confirm-prompt">Delete contact?</span>
            <button
              type="button"
              className="button button--danger"
              disabled={isDeleting}
              onClick={async () => {
                const ok = await onDelete(contact.id);
                if (!ok) setConfirmingDelete(false);
              }}
            >
              {isDeleting ? "Deleting…" : "Confirm delete"}
            </button>
            <button
              type="button"
              className="button button--secondary"
              disabled={isDeleting}
              onClick={() => setConfirmingDelete(false)}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
            <button
              type="button"
              className="button button--danger"
              onClick={() => setConfirmingDelete(true)}
            >
              Delete
            </button>
          </>
        )}
      </div>
      {error && (
        <p className="contact-card__error" role="alert">
          {error}
        </p>
      )}
    </li>
  );
}
