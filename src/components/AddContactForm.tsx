import { useState } from "react";

type AddContactFormProps = {
  onAdd: (name: string, phone: string) => void;
};

export function AddContactForm({ onAdd }: AddContactFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();
  const canAdd = trimmedName !== "" && trimmedPhone !== "";

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canAdd) return;
    onAdd(trimmedName, trimmedPhone);
    setName("");
    setPhone("");
  }

  return (
    <form className="add-contact-form" onSubmit={handleSubmit}>
      <label className="field">
        <span className="field__label">Name</span>
        <input
          className="field__input"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <label className="field">
        <span className="field__label">Phone</span>
        <input
          className="field__input"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
      </label>
      <button className="button" type="submit" disabled={!canAdd}>
        Add
      </button>
    </form>
  );
}
