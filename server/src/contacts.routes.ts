import { Router } from "express";
import type { Db } from "./db.ts";
import {
  createContact,
  deleteContact,
  getContact,
  listContacts,
  updateContact,
} from "./contacts.repo.ts";
import type { ContactInput } from "./types.ts";

function validateInput(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return "Request body is required";
  }
  const { name, phones } = body as Record<string, unknown>;
  const first = (name as ContactInput["name"] | undefined)?.first;
  if (typeof first !== "string" || first.trim() === "") {
    return "Contact name is required";
  }
  if (!Array.isArray(phones) || phones.length === 0) {
    return "At least one phone number is required";
  }
  for (const phone of phones) {
    const number = (phone as { number?: unknown })?.number;
    if (typeof number !== "string" || number.trim() === "") {
      return "Phone numbers cannot be empty";
    }
  }
  return null;
}

export function contactsRouter(db: Db): Router {
  const router = Router();

  router.get("/", (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    res.json(listContacts(db, q));
  });

  router.get("/:id", (req, res) => {
    const contact = getContact(db, req.params.id);
    if (!contact) {
      res.status(404).json({ error: "Contact not found" });
      return;
    }
    res.json(contact);
  });

  router.post("/", (req, res) => {
    const error = validateInput(req.body);
    if (error) {
      res.status(400).json({ error });
      return;
    }
    const contact = createContact(db, req.body as ContactInput);
    res.status(201).json(contact);
  });

  router.put("/:id", (req, res) => {
    const error = validateInput(req.body);
    if (error) {
      res.status(400).json({ error });
      return;
    }
    const updated = updateContact(db, req.params.id, req.body as ContactInput);
    if (!updated) {
      res.status(404).json({ error: "Contact not found" });
      return;
    }
    res.json(updated);
  });

  router.delete("/:id", (req, res) => {
    const deleted = deleteContact(db, req.params.id);
    if (!deleted) {
      res.status(404).json({ error: "Contact not found" });
      return;
    }
    res.status(204).end();
  });

  return router;
}
