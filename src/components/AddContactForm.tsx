import { useState } from "react";
import type { Contact } from "../types";
import { DEFAULT_CONTACT_LABEL } from "../types";

type AddContactFormProps = {
  onAddContact: (contact: Contact) => void;
};

export function AddContactForm({ onAddContact }: AddContactFormProps) {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [phone, setPhone] = useState("");

  const canSubmit = first.trim() !== "" && phone.trim() !== "";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedFirst = first.trim();
    const trimmedLast = last.trim();
    const trimmedPhone = phone.trim();

    if (trimmedFirst === "" || trimmedPhone === "") return;

    const contact: Contact = {
      id: crypto.randomUUID(),
      name: {
        first: trimmedFirst,
        ...(trimmedLast ? { last: trimmedLast } : {}),
      },
      phones: [
        {
          id: crypto.randomUUID(),
          label: DEFAULT_CONTACT_LABEL,
          number: trimmedPhone,
          isPrimary: true,
        },
      ],
      emails: [],
      addresses: [],
    };

    onAddContact(contact);

    setFirst("");
    setLast("");
    setPhone("");
  }

  return (
    <form className="form card" onSubmit={handleSubmit} noValidate>
      <h2 className="form__title">Add contact</h2>

      <div className="text-field">
        <label className="text-field__label" htmlFor="first">
          First name
        </label>
        <input
          id="first"
          className="text-field__input"
          type="text"
          value={first}
          onChange={(e) => setFirst(e.target.value)}
          placeholder="Ada"
          autoComplete="given-name"
        />
      </div>

      <div className="text-field">
        <label className="text-field__label" htmlFor="last">
          Last name <span className="text-field__optional">(optional)</span>
        </label>
        <input
          id="last"
          className="text-field__input"
          type="text"
          value={last}
          onChange={(e) => setLast(e.target.value)}
          placeholder="Lovelace"
          autoComplete="family-name"
        />
      </div>

      <div className="text-field">
        <label className="text-field__label" htmlFor="phone">
          Phone number
        </label>
        <input
          id="phone"
          className="text-field__input"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 555 123 4567"
          autoComplete="tel"
        />
      </div>

      <button className="button button--filled" type="submit" disabled={!canSubmit}>
        Add
      </button>
    </form>
  );
}
