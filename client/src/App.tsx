import { useEffect, useMemo, useState } from "react";
import type { Contact } from "./types";
import { ContactList } from "./components/ContactList";
import { AddContactForm } from "./components/AddContactForm";
import type { PhoneRow } from "./components/PhoneNumberFields";
import {
  contactsClient as defaultClient,
  type ContactsClient,
} from "./api/contactsClient";

type AppProps = {
  client?: ContactsClient;
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

const SEARCH_DEBOUNCE_MS = 300;

function findDuplicateNumbers(contacts: Contact[]): Set<string> {
  const counts = new Map<string, number>();
  for (const contact of contacts) {
    const numbersOnContact = new Set(contact.phones.map((phone) => phone.number));
    for (const number of numbersOnContact) {
      counts.set(number, (counts.get(number) ?? 0) + 1);
    }
  }
  return new Set(
    [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([number]) => number),
  );
}

type CardAction = { id: string; type: "saving" | "deleting" };
type CardError = { id: string; message: string };

export function App({ client = defaultClient }: AppProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [cardAction, setCardAction] = useState<CardAction | null>(null);
  const [cardError, setCardError] = useState<CardError | null>(null);

  const duplicateNumbers = useMemo(
    () => findDuplicateNumbers(allContacts),
    [allContacts],
  );

  useEffect(() => {
    let active = true;
    client
      .list()
      .then((list) => {
        if (active) setAllContacts(list);
      })
      .catch(() => {
        // The displayed-list effect surfaces load errors.
      });
    return () => {
      active = false;
    };
  }, [client]);

  useEffect(() => {
    let active = true;
    const delay = query.trim() === "" ? 0 : SEARCH_DEBOUNCE_MS;
    if (active) setSearching(true);
    const handle = setTimeout(() => {
      client
        .list(query)
        .then((list) => {
          if (!active) return;
          setContacts(list);
          setSearchError(null);
        })
        .catch((err) => {
          if (active) setSearchError(errorMessage(err));
        })
        .finally(() => {
          if (!active) return;
          setLoading(false);
          setSearching(false);
        });
    }, delay);
    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [client, query]);

  async function refresh() {
    try {
      const [displayed, all] = await Promise.all([
        client.list(query),
        client.list(),
      ]);
      setContacts(displayed);
      setAllContacts(all);
    } catch (err) {
      setSearchError(errorMessage(err));
    }
  }

  function clearCardError(id: string) {
    setCardError((current) => (current?.id === id ? null : current));
  }

  async function addContact(
    name: string,
    phones: PhoneRow[],
  ): Promise<boolean> {
    setSaving(true);
    setAddError(null);
    try {
      await client.create({
        name: { first: name },
        phones: phones.map((phone) => ({
          label: phone.label,
          number: phone.number,
        })),
      });
    } catch (err) {
      setAddError(errorMessage(err));
      setSaving(false);
      return false;
    }
    setSaving(false);
    await refresh();
    return true;
  }

  async function updateContact(
    id: string,
    name: string,
    phones: PhoneRow[],
  ): Promise<boolean> {
    setCardAction({ id, type: "saving" });
    clearCardError(id);
    const existing =
      allContacts.find((contact) => contact.id === id) ??
      contacts.find((contact) => contact.id === id);
    try {
      await client.update(id, {
        name: existing ? { ...existing.name, first: name } : { first: name },
        phones: phones.map((phone) => ({
          id: phone.id,
          label: phone.label,
          number: phone.number,
          isPrimary: phone.isPrimary,
        })),
      });
    } catch (err) {
      setCardError({ id, message: errorMessage(err) });
      setCardAction(null);
      return false;
    }
    setCardAction(null);
    await refresh();
    return true;
  }

  async function deleteContact(id: string): Promise<boolean> {
    setCardAction({ id, type: "deleting" });
    clearCardError(id);
    try {
      await client.remove(id);
    } catch (err) {
      setCardError({ id, message: errorMessage(err) });
      setCardAction(null);
      return false;
    }
    setCardAction(null);
    await refresh();
    return true;
  }

  return (
    <main className="app">
      <h1 className="app__title">Phone Book</h1>
      <div className="app__layout">
        <section className="surface app__pane app__pane--add">
          <h2 className="pane__title">Add contact</h2>
          <AddContactForm onAdd={addContact} saving={saving} error={addError} />
        </section>
        <section className="surface app__pane app__pane--contacts">
          <h2 className="pane__title">Contacts</h2>
          <label className="field search-field">
            <span className="field__label">Search contacts</span>
            <input
              className="field__input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or number"
            />
            {searching && !loading && (
              <span className="field__hint" role="status">
                Searching…
              </span>
            )}
          </label>
          {searchError && (
            <p className="error-banner" role="alert">
              {searchError}
            </p>
          )}
          {loading ? (
            <p className="loading-state" role="status">
              Loading contacts…
            </p>
          ) : query.trim() !== "" && contacts.length === 0 ? (
            <p className="empty-state">No results</p>
          ) : (
            <ContactList
              contacts={contacts}
              duplicateNumbers={duplicateNumbers}
              cardAction={cardAction}
              cardError={cardError}
              onDelete={deleteContact}
              onUpdate={updateContact}
            />
          )}
        </section>
      </div>
    </main>
  );
}
