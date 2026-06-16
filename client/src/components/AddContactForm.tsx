import { useState } from "react";
import { DEFAULT_CONTACT_LABEL } from "../types";
import { PhoneNumberFields, type PhoneRow } from "./PhoneNumberFields";

type AddContactFormProps = {
  onAdd: (name: string, phones: PhoneRow[]) => Promise<boolean>;
  saving?: boolean;
  error?: string | null;
};

function emptyRow(): PhoneRow {
  return { id: crypto.randomUUID(), label: DEFAULT_CONTACT_LABEL, number: "" };
}

export function AddContactForm({
  onAdd,
  saving = false,
  error = null,
}: AddContactFormProps) {
  const [name, setName] = useState("");
  const [rows, setRows] = useState<PhoneRow[]>([emptyRow()]);

  const trimmedName = name.trim();
  const hasPhone = rows.some((row) => row.number.trim() !== "");
  const canAdd = trimmedName !== "" && hasPhone;

  function updateRow(id: string, changes: Partial<PhoneRow>) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...changes } : row)),
    );
  }

  function addRow() {
    setRows((current) => [...current, emptyRow()]);
  }

  function removeRow(id: string) {
    setRows((current) =>
      current.length === 1 ? current : current.filter((row) => row.id !== id),
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canAdd || saving) return;
    const phones = rows
      .map((row) => ({ ...row, number: row.number.trim() }))
      .filter((row) => row.number !== "");
    const ok = await onAdd(trimmedName, phones);
    if (ok) {
      setName("");
      setRows([emptyRow()]);
    }
  }

  return (
    <form
      className="add-contact-form"
      aria-label="Add contact"
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
      />
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-actions">
        <button className="button" type="submit" disabled={!canAdd || saving}>
          {saving ? "Saving…" : "Add"}
        </button>
      </div>
    </form>
  );
}
