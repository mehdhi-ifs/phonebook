import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createApp } from "./app.ts";
import { openDb } from "./db.ts";

const PORT = Number(process.env.PORT ?? 3001);
const DB_PATH = process.env.DB_PATH ?? "data/phonebook.db";

mkdirSync(dirname(DB_PATH), { recursive: true });

const db = openDb(DB_PATH);
const app = createApp(db);

app.listen(PORT, () => {
  console.log(`Phonebook API listening on http://localhost:${PORT}`);
});
