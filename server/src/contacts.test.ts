import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { createApp } from "./app.ts";
import { openDb } from "./db.ts";

function appWithMemoryDb() {
  return createApp(openDb(":memory:"));
}

test("POST /api/contacts creates a contact and returns it", async () => {
  const app = appWithMemoryDb();

  const res = await request(app)
    .post("/api/contacts")
    .send({
      name: { first: "Ada" },
      phones: [{ label: "mobile", number: "555-0100" }],
    });

  assert.equal(res.status, 201);
  assert.ok(res.body.id, "expected a server-generated contact id");
  assert.equal(res.body.name.first, "Ada");
  assert.equal(res.body.phones.length, 1);
  assert.ok(res.body.phones[0].id, "expected a server-generated phone id");
  assert.equal(res.body.phones[0].number, "555-0100");
  assert.equal(res.body.phones[0].isPrimary, true);
  assert.deepEqual(res.body.emails, []);
  assert.deepEqual(res.body.addresses, []);
});

test("GET /api/contacts lists contacts (empty, then after create)", async () => {
  const app = appWithMemoryDb();

  const empty = await request(app).get("/api/contacts");
  assert.equal(empty.status, 200);
  assert.deepEqual(empty.body, []);

  await request(app)
    .post("/api/contacts")
    .send({ name: { first: "Ada" }, phones: [{ number: "555-0100" }] });

  const list = await request(app).get("/api/contacts");
  assert.equal(list.status, 200);
  assert.equal(list.body.length, 1);
  assert.equal(list.body[0].name.first, "Ada");
});

test("GET /api/contacts/:id returns one contact, or 404 when unknown", async () => {
  const app = appWithMemoryDb();
  const created = await request(app)
    .post("/api/contacts")
    .send({ name: { first: "Ada" }, phones: [{ number: "555-0100" }] });

  const found = await request(app).get(`/api/contacts/${created.body.id}`);
  assert.equal(found.status, 200);
  assert.equal(found.body.id, created.body.id);

  const missing = await request(app).get("/api/contacts/does-not-exist");
  assert.equal(missing.status, 404);
  assert.ok(missing.body.error, "expected an error message");
});

test("PUT /api/contacts/:id replaces name and phones, preserving existing phone ids", async () => {
  const app = appWithMemoryDb();
  const created = await request(app)
    .post("/api/contacts")
    .send({ name: { first: "Ada" }, phones: [{ label: "mobile", number: "555-0100" }] });
  const id = created.body.id;
  const existingPhoneId = created.body.phones[0].id;

  const res = await request(app)
    .put(`/api/contacts/${id}`)
    .send({
      name: { first: "Ada", last: "Lovelace" },
      phones: [
        { id: existingPhoneId, label: "mobile", number: "555-0100" },
        { label: "work", number: "555-0200" },
      ],
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.name.last, "Lovelace");
  assert.equal(res.body.phones.length, 2);
  assert.equal(res.body.phones[0].id, existingPhoneId, "existing phone id preserved");
  assert.ok(res.body.phones[1].id, "new phone got an id");
  assert.notEqual(res.body.phones[1].id, existingPhoneId);

  const missing = await request(app)
    .put("/api/contacts/nope")
    .send({ name: { first: "X" }, phones: [{ number: "555-9999" }] });
  assert.equal(missing.status, 404);
});

test("DELETE /api/contacts/:id removes the contact and cascades its phones", async () => {
  const db = openDb(":memory:");
  const app = createApp(db);

  const a = await request(app)
    .post("/api/contacts")
    .send({ name: { first: "Ada" }, phones: [{ number: "555-0100" }] });
  const b = await request(app)
    .post("/api/contacts")
    .send({ name: { first: "Grace" }, phones: [{ number: "555-0199" }] });

  const del = await request(app).delete(`/api/contacts/${a.body.id}`);
  assert.equal(del.status, 204);

  assert.equal((await request(app).get(`/api/contacts/${a.body.id}`)).status, 404);

  const list = await request(app).get("/api/contacts");
  assert.equal(list.body.length, 1);
  assert.equal(list.body[0].id, b.body.id);

  const orphanPhones = db
    .prepare("SELECT COUNT(*) AS n FROM phones WHERE contact_id = ?")
    .get(a.body.id) as { n: number };
  assert.equal(Number(orphanPhones.n), 0, "phones should be cascade-deleted");

  const delMissing = await request(app).delete(`/api/contacts/${a.body.id}`);
  assert.equal(delMissing.status, 404);
});

test("POST rejects invalid contacts with 400 and persists nothing", async () => {
  const app = appWithMemoryDb();

  const invalidBodies = [
    { name: { first: "   " }, phones: [{ number: "555-0100" }] },
    { name: { first: "Ada" }, phones: [{ number: "   " }] },
    { name: { first: "Ada" }, phones: [] },
  ];

  for (const body of invalidBodies) {
    const res = await request(app).post("/api/contacts").send(body);
    assert.equal(res.status, 400);
    assert.ok(res.body.error, "expected an error message");
  }

  const list = await request(app).get("/api/contacts");
  assert.deepEqual(list.body, []);
});

test("PUT rejects an invalid update with 400 and leaves the contact unchanged", async () => {
  const app = appWithMemoryDb();
  const created = await request(app)
    .post("/api/contacts")
    .send({ name: { first: "Ada" }, phones: [{ label: "mobile", number: "555-0100" }] });
  const id = created.body.id;

  const res = await request(app)
    .put(`/api/contacts/${id}`)
    .send({ name: { first: "" }, phones: [{ number: "555-0200" }] });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);

  const after = await request(app).get(`/api/contacts/${id}`);
  assert.equal(after.body.name.first, "Ada");
  assert.equal(after.body.phones.length, 1);
  assert.equal(after.body.phones[0].number, "555-0100");
});

test("normalizes on write: trims values and collapses to one primary", async () => {
  const app = appWithMemoryDb();

  const res = await request(app)
    .post("/api/contacts")
    .send({
      name: { first: "  Ada  ", last: "  Lovelace  " },
      phones: [
        { label: "mobile", number: "  555-0100  " },
        { label: "work", number: "555-0200", isPrimary: true },
        { label: "home", number: "555-0300", isPrimary: true },
      ],
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.name.first, "Ada");
  assert.equal(res.body.name.last, "Lovelace");
  assert.equal(res.body.phones[0].number, "555-0100");

  const primaries = res.body.phones.filter((p: { isPrimary?: boolean }) => p.isPrimary);
  assert.equal(primaries.length, 1, "exactly one primary");
  assert.equal(primaries[0].number, "555-0200", "first flagged phone wins");
});

test("defaults primary to the first phone when none is marked", async () => {
  const app = appWithMemoryDb();

  const res = await request(app)
    .post("/api/contacts")
    .send({
      name: { first: "Ada" },
      phones: [{ number: "555-0100" }, { number: "555-0200" }],
    });

  assert.equal(res.body.phones[0].isPrimary, true);
  assert.equal(res.body.phones[1].isPrimary, false);
});

async function seed(app: ReturnType<typeof createApp>) {
  await request(app)
    .post("/api/contacts")
    .send({ name: { first: "Ada", last: "Lovelace" }, phones: [{ number: "555-0100" }] });
  await request(app)
    .post("/api/contacts")
    .send({ name: { first: "Grace" }, phones: [{ number: "555-0199" }] });
}

test("GET /api/contacts?q= matches by name, case-insensitively", async () => {
  const app = appWithMemoryDb();
  await seed(app);

  const res = await request(app).get("/api/contacts").query({ q: "ADA" });

  assert.equal(res.status, 200);
  assert.equal(res.body.length, 1);
  assert.equal(res.body[0].name.first, "Ada");
});

test("GET /api/contacts?q= matches by phone number", async () => {
  const app = appWithMemoryDb();
  await seed(app);

  const res = await request(app).get("/api/contacts").query({ q: "0199" });

  assert.equal(res.status, 200);
  assert.equal(res.body.length, 1);
  assert.equal(res.body[0].name.first, "Grace");
});

test("GET /api/contacts returns all for empty q and none for a non-match", async () => {
  const app = appWithMemoryDb();
  await seed(app);

  assert.equal((await request(app).get("/api/contacts").query({ q: "" })).body.length, 2);
  assert.equal((await request(app).get("/api/contacts")).body.length, 2);
  assert.deepEqual(
    (await request(app).get("/api/contacts").query({ q: "zzz" })).body,
    [],
  );
});

test("persists contacts across reopening the database file", async () => {
  const dbPath = join(tmpdir(), `phonebook-test-${randomUUID()}.db`);

  const db1 = openDb(dbPath);
  try {
    const created = await request(createApp(db1))
      .post("/api/contacts")
      .send({ name: { first: "Ada" }, phones: [{ label: "mobile", number: "555-0100" }] });
    assert.equal(created.status, 201);
  } finally {
    db1.close();
  }

  const db2 = openDb(dbPath);
  try {
    const list = await request(createApp(db2)).get("/api/contacts");
    assert.equal(list.status, 200);
    assert.equal(list.body.length, 1);
    assert.equal(list.body[0].name.first, "Ada");
    assert.equal(list.body[0].phones[0].number, "555-0100");
  } finally {
    db2.close();
    rmSync(dbPath, { force: true });
  }
});
