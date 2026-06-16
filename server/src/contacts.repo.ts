import { randomUUID } from "node:crypto";
import type { Db } from "./db.ts";
import type {
  Contact,
  ContactInput,
  ContactName,
  PhoneInput,
  PhoneNumber,
} from "./types.ts";

const DEFAULT_LABEL = "mobile";

type ContactRow = {
  id: string;
  name_first: string;
  name_last: string | null;
  name_display: string | null;
};

type PhoneRow = {
  id: string;
  label: string;
  number: string;
  is_primary: number;
};

function rowToContact(db: Db, row: ContactRow): Contact {
  const phoneRows = db
    .prepare(
      "SELECT id, label, number, is_primary FROM phones WHERE contact_id = ? ORDER BY rowid",
    )
    .all(row.id) as PhoneRow[];
  const phones: PhoneNumber[] = phoneRows.map((phone) => ({
    id: phone.id,
    label: phone.label,
    number: phone.number,
    isPrimary: phone.is_primary === 1,
  }));
  const name: ContactName = { first: row.name_first };
  if (row.name_last) name.last = row.name_last;
  if (row.name_display) name.display = row.name_display;
  return { id: row.id, name, phones, emails: [], addresses: [] };
}

export function listContacts(db: Db, query?: string): Contact[] {
  const q = query?.trim().toLowerCase();
  if (!q) {
    const rows = db
      .prepare(
        "SELECT id, name_first, name_last, name_display FROM contacts ORDER BY rowid",
      )
      .all() as ContactRow[];
    return rows.map((row) => rowToContact(db, row));
  }

  const rows = db
    .prepare(
      `SELECT DISTINCT c.id, c.name_first, c.name_last, c.name_display
       FROM contacts c
       LEFT JOIN phones p ON p.contact_id = c.id
       WHERE instr(lower(c.name_first), ?) > 0
          OR instr(lower(ifnull(c.name_last, '')), ?) > 0
          OR instr(lower(ifnull(c.name_display, '')), ?) > 0
          OR instr(lower(ifnull(p.number, '')), ?) > 0
       ORDER BY c.rowid`,
    )
    .all(q, q, q, q) as ContactRow[];
  return rows.map((row) => rowToContact(db, row));
}

export function getContact(db: Db, id: string): Contact | undefined {
  const row = db
    .prepare(
      "SELECT id, name_first, name_last, name_display FROM contacts WHERE id = ?",
    )
    .get(id) as ContactRow | undefined;
  return row ? rowToContact(db, row) : undefined;
}

function inTransaction<T>(db: Db, work: () => T): T {
  db.exec("BEGIN");
  try {
    const result = work();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function insertPhones(db: Db, contactId: string, phones: PhoneNumber[]): void {
  const insertPhone = db.prepare(
    "INSERT INTO phones (id, contact_id, label, number, is_primary) VALUES (?, ?, ?, ?, ?)",
  );
  for (const phone of phones) {
    insertPhone.run(
      phone.id,
      contactId,
      phone.label,
      phone.number,
      phone.isPrimary ? 1 : 0,
    );
  }
}

function trimName(name: ContactName): ContactName {
  const trimmed: ContactName = { first: name.first.trim() };
  const last = name.last?.trim();
  if (last) trimmed.last = last;
  const display = name.display?.trim();
  if (display) trimmed.display = display;
  return trimmed;
}

function normalizePhones(
  phones: PhoneInput[],
  idFor: (phone: PhoneInput) => string,
): PhoneNumber[] {
  const primaryIndex = Math.max(
    0,
    phones.findIndex((phone) => phone.isPrimary),
  );
  return phones.map((phone, index) => ({
    id: idFor(phone),
    label: phone.label?.trim() || DEFAULT_LABEL,
    number: phone.number.trim(),
    isPrimary: index === primaryIndex,
  }));
}

export function createContact(db: Db, input: ContactInput): Contact {
  const id = randomUUID();
  const name = trimName(input.name);
  const phones = normalizePhones(input.phones, () => randomUUID());

  const insertContact = db.prepare(
    "INSERT INTO contacts (id, name_first, name_last, name_display) VALUES (?, ?, ?, ?)",
  );

  inTransaction(db, () => {
    insertContact.run(id, name.first, name.last ?? null, name.display ?? null);
    insertPhones(db, id, phones);
  });

  return getContact(db, id)!;
}

export function updateContact(
  db: Db,
  id: string,
  input: ContactInput,
): Contact | undefined {
  const exists = db
    .prepare("SELECT id FROM contacts WHERE id = ?")
    .get(id) as { id: string } | undefined;
  if (!exists) return undefined;

  const name = trimName(input.name);
  const phones = normalizePhones(
    input.phones,
    (phone) => phone.id ?? randomUUID(),
  );

  const updateContactRow = db.prepare(
    "UPDATE contacts SET name_first = ?, name_last = ?, name_display = ? WHERE id = ?",
  );
  const deletePhones = db.prepare("DELETE FROM phones WHERE contact_id = ?");

  inTransaction(db, () => {
    updateContactRow.run(name.first, name.last ?? null, name.display ?? null, id);
    deletePhones.run(id);
    insertPhones(db, id, phones);
  });

  return getContact(db, id);
}

export function deleteContact(db: Db, id: string): boolean {
  const result = db.prepare("DELETE FROM contacts WHERE id = ?").run(id);
  return Number(result.changes) > 0;
}
