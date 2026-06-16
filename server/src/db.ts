import { DatabaseSync } from "node:sqlite";

export type Db = DatabaseSync;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS contacts (
  id           TEXT PRIMARY KEY,
  name_first   TEXT NOT NULL,
  name_last    TEXT,
  name_display TEXT
);

CREATE TABLE IF NOT EXISTS phones (
  id         TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  number     TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0
);
`;

export function openDb(path = ":memory:"): Db {
  const db = new DatabaseSync(path);
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(SCHEMA);
  return db;
}
