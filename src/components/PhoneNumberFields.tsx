import type { ContactLabel, DefaultContactLabel } from "../types";

export type PhoneRow = {
  id: string;
  label: ContactLabel;
  number: string;
  isPrimary?: boolean;
};

const LABEL_OPTIONS: DefaultContactLabel[] = [
  "home",
  "work",
  "mobile",
  "main",
  "other",
];

type PhoneNumberFieldsProps = {
  rows: PhoneRow[];
  onChange: (id: string, changes: Partial<PhoneRow>) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  showPrimaryControl?: boolean;
  onSelectPrimary?: (id: string) => void;
  primaryGroupName?: string;
};

export function PhoneNumberFields({
  rows,
  onChange,
  onAdd,
  onRemove,
  showPrimaryControl = false,
  onSelectPrimary,
  primaryGroupName = "primary-phone",
}: PhoneNumberFieldsProps) {
  const isLastRow = rows.length === 1;

  return (
    <div className="phone-fields">
      {rows.map((row) => (
        <div key={row.id} className="phone-fields__row">
          {showPrimaryControl && (
            <label className="phone-fields__primary">
              <input
                type="radio"
                name={primaryGroupName}
                checked={row.isPrimary ?? false}
                onChange={() => onSelectPrimary?.(row.id)}
                aria-label="Set as primary number"
              />
              <span>Primary</span>
            </label>
          )}
          <label className="field">
            <span className="field__label">Label</span>
            <select
              className="field__input"
              value={row.label}
              onChange={(event) =>
                onChange(row.id, { label: event.target.value })
              }
            >
              {LABEL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Phone number</span>
            <input
              className="field__input"
              type="tel"
              value={row.number}
              onChange={(event) =>
                onChange(row.id, { number: event.target.value })
              }
            />
          </label>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => onRemove(row.id)}
            disabled={isLastRow}
            aria-label={
              isLastRow
                ? "Remove number (a contact must keep at least one number)"
                : "Remove number"
            }
          >
            Remove
          </button>
        </div>
      ))}
      <button type="button" className="button button--secondary" onClick={onAdd}>
        Add phone number
      </button>
    </div>
  );
}
