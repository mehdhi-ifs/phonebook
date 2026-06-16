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
    for (const phone of contact.phones) {
      counts.set(phone.number, (counts.get(phone.number) ?? 0) + 1);
    }
  }
  return new Set(
    [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([number]) => number),
  );
}

export function App({ client = defaultClient }: AppProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    const handle = setTimeout(() => {
      client
        .list(query)
        .then((list) => {
          if (!active) return;
          setContacts(list);
          setError(null);
        })
        .catch((err) => {
          if (active) setError(errorMessage(err));
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, delay);
    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [client, query]);

  async function refresh() {
    const [displayed, all] = await Promise.all([
      client.list(query),
      client.list(),
    ]);
    setContacts(displayed);
    setAllContacts(all);
  }

  async function addContact(name: string, phones: PhoneRow[]) {
    try {
      await client.create({
        name: { first: name },
        phones: phones.map((phone) => ({
          label: phone.label,
          number: phone.number,
        })),
      });
      setError(null);
      await refresh();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function updateContact(id: string, name: string, phones: PhoneRow[]) {
    try {
      await client.update(id, {
        name: { first: name },
        phones: phones.map((phone) => ({
          id: phone.id,
          label: phone.label,
          number: phone.number,
          isPrimary: phone.isPrimary,
        })),
      });
      setError(null);
      await refresh();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function deleteContact(id: string) {
    try {
      await client.remove(id);
      setError(null);
      await refresh();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <main className="app">
      <h1 className="app__title">Phone Book</h1>
      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}
      <div className="app__layout">
        <section className="surface app__pane app__pane--add">
          <h2 className="pane__title">Add contact</h2>
          <AddContactForm onAdd={addContact} />
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
          </label>
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
              onDelete={deleteContact}
              onUpdate={updateContact}
            />
          )}
        </section>
      </div>
    </main>
  );
}
