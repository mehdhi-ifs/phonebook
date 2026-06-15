import { useState } from "react";
import type { Contact } from "../types";
import { DEFAULT_CONTACT_LABEL } from "../types";
import { PhoneNumberFields, type PhoneRow } from "./PhoneNumberFields";

type EditContactFormProps = {
  contact: Contact;
  onSave: (id: string, name: string, phones: PhoneRow[]) => void;
  onCancel: () => void;
};

function toRows(contact: Contact): PhoneRow[] {
  return contact.phones.map((phone) => ({
    id: phone.id,
    label: phone.label,
    number: phone.number,
    isPrimary: phone.isPrimary ?? false,
  }));
}

export function EditContactForm({
  contact,
  onSave,
  onCancel,
}: EditContactFormProps) {
  const [name, setName] = useState(contact.name.first);
  const [rows, setRows] = useState<PhoneRow[]>(() => toRows(contact));

  const trimmedName = name.trim();
  const hasPhone = rows.some((row) => row.number.trim() !== "");
  const canSave = trimmedName !== "" && hasPhone;

  function updateRow(id: string, changes: Partial<PhoneRow>) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...changes } : row)),
    );
  }

  function addRow() {
    setRows((current) => [
      ...current,
      { id: crypto.randomUUID(), label: DEFAULT_CONTACT_LABEL, number: "" },
    ]);
  }

  function removeRow(id: string) {
    setRows((current) => {
      if (current.length === 1) return current;
      const next = current.filter((row) => row.id !== id);
      if (!next.some((row) => row.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
  }

  function selectPrimary(id: string) {
    setRows((current) =>
      current.map((row) => ({ ...row, isPrimary: row.id === id })),
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSave) return;
    const phones = rows
      .map((row) => ({ ...row, number: row.number.trim() }))
      .filter((row) => row.number !== "");
    onSave(contact.id, trimmedName, phones);
  }

  return (
    <form
      className="edit-contact-form"
      aria-label="Edit contact"
      onSubmit={handleSubmit}
    >
      <label className="field">
        <span className="field__label">Name</span>
        <input
          className="field__input"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <PhoneNumberFields
        rows={rows}
        onChange={updateRow}
        onAdd={addRow}
        onRemove={removeRow}
        showPrimaryControl
        onSelectPrimary={selectPrimary}
        primaryGroupName={`primary-${contact.id}`}
      />
      <div className="form-actions">
        <button
          className="button button--secondary"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button className="button" type="submit" disabled={!canSave}>
          Save
        </button>
      </div>
    </form>
  );
}
