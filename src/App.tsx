import { useState } from "react";
import type { Contact } from "./types";
import { AddContactForm } from "./components/AddContactForm";
import { ContactList } from "./components/ContactList";
import "./styles.css";

function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  function handleAddContact(contact: Contact) {
    setContacts((prev) => [...prev, contact]);
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Phone Book</h1>
      </header>

      <main className="app__main">
        <AddContactForm onAddContact={handleAddContact} />
        <ContactList contacts={contacts} />
      </main>
    </div>
  );
}

export default App;
