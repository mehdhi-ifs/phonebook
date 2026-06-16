import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "./app.ts";
import { openDb } from "./db.ts";

test("GET /api/health reports the server is up", async () => {
  const app = createApp(openDb(":memory:"));

  const res = await request(app).get("/api/health");

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true });
});
