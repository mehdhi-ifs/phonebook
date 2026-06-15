import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { App } from "./App";
import type { Contact } from "./types";

function makeContact(first: string, number: string): Contact {
  return {
    id: crypto.randomUUID(),
    name: { first },
    phones: [{ id: crypto.randomUUID(), label: "mobile", number, isPrimary: true }],
    emails: [],
    addresses: [],
  };
}

function makeMultiPhoneContact(): Contact {
  return {
    id: crypto.randomUUID(),
    name: { first: "Ada" },
    phones: [
      { id: crypto.randomUUID(), label: "mobile", number: "555-0100", isPrimary: true },
      { id: crypto.randomUUID(), label: "work", number: "555-0200" },
    ],
    emails: [],
    addresses: [],
  };
}

describe("Phone Book app", () => {
  it("renders the app heading", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: /phone book/i }),
    ).toBeInTheDocument();
  });

  it("shows an empty-state message when there are no contacts", () => {
    render(<App />);
    expect(screen.getByText(/no contacts yet/i)).toBeInTheDocument();
  });

  it("renders each contact with its name and primary phone number", () => {
    render(
      <App
        initialContacts={[
          makeContact("Ada", "555-0100"),
          makeContact("Grace", "555-0199"),
        ]}
      />,
    );

    expect(screen.queryByText(/no contacts yet/i)).not.toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("555-0100")).toBeInTheDocument();
    expect(screen.getByText("Grace")).toBeInTheDocument();
    expect(screen.getByText("555-0199")).toBeInTheDocument();
  });

  it("disables the Add button until both name and phone are non-empty", async () => {
    const user = userEvent.setup();
    render(<App />);

    const addButton = screen.getByRole("button", { name: "Add" });
    expect(addButton).toBeDisabled();

    await user.type(screen.getByLabelText(/name/i), "Ada");
    expect(addButton).toBeDisabled();

    await user.type(screen.getByLabelText(/phone/i), "555-0100");
    expect(addButton).toBeEnabled();
  });

  it("keeps the Add button disabled for whitespace-only input", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/name/i), "   ");
    await user.type(screen.getByLabelText(/phone/i), "   ");

    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
  });

  it("adds a contact and shows it in the list after submitting", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/name/i), "Ada");
    await user.type(screen.getByLabelText(/phone/i), "555-0100");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.queryByText(/no contacts yet/i)).not.toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("555-0100")).toBeInTheDocument();
  });

  it("clears the inputs after a successful add", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/name/i), "Ada");
    await user.type(screen.getByLabelText(/phone/i), "555-0100");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByLabelText(/name/i)).toHaveValue("");
    expect(screen.getByLabelText(/phone/i)).toHaveValue("");
  });

  it("submits when Enter is pressed in a filled form", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/name/i), "Ada");
    await user.type(screen.getByLabelText(/phone/i), "555-0100{Enter}");

    expect(screen.getByText("Ada")).toBeInTheDocument();
  });

  it("adds multiple contacts in insertion order", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/name/i), "Ada");
    await user.type(screen.getByLabelText(/phone/i), "555-0100");
    await user.click(screen.getByRole("button", { name: "Add" }));

    await user.type(screen.getByLabelText(/name/i), "Grace");
    await user.type(screen.getByLabelText(/phone/i), "555-0199");
    await user.click(screen.getByRole("button", { name: "Add" }));

    const names = screen
      .getAllByText(/Ada|Grace/)
      .map((node) => node.textContent);
    expect(names).toEqual(["Ada", "Grace"]);
  });
});

describe("Phase 2: card shows all phone numbers", () => {
  it("shows every phone number on a contact's card", () => {
    render(<App initialContacts={[makeMultiPhoneContact()]} />);

    expect(screen.getByText("555-0100")).toBeInTheDocument();
    expect(screen.getByText("555-0200")).toBeInTheDocument();
  });

  it("renders the primary number first with a primary marker", () => {
    render(
      <App
        initialContacts={[
          {
            id: "c1",
            name: { first: "Ada" },
            phones: [
              { id: "p1", label: "mobile", number: "555-0100", isPrimary: false },
              { id: "p2", label: "work", number: "555-0200", isPrimary: true },
            ],
            emails: [],
            addresses: [],
          },
        ]}
      />,
    );

    const primary = screen.getByText("555-0200");
    const secondary = screen.getByText("555-0100");
    expect(
      primary.compareDocumentPosition(secondary) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByText(/primary/i)).toBeInTheDocument();
  });

  it("shows each phone number's label", () => {
    render(<App initialContacts={[makeMultiPhoneContact()]} />);

    const list = screen.getByRole("list", { name: /contacts/i });
    expect(within(list).getByText(/mobile/i)).toBeInTheDocument();
    expect(within(list).getByText(/work/i)).toBeInTheDocument();
  });
});

describe("Phase 2: adding multiple phone numbers", () => {
  it("adds a contact with more than one phone number", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/name/i), "Ada");
    await user.type(screen.getAllByLabelText(/phone number/i)[0], "555-0100");
    await user.click(
      screen.getByRole("button", { name: /add phone number/i }),
    );
    await user.type(screen.getAllByLabelText(/phone number/i)[1], "555-0200");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByText("555-0100")).toBeInTheDocument();
    expect(screen.getByText("555-0200")).toBeInTheDocument();
  });

  it("excludes a phone row that was removed before saving", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/name/i), "Ada");
    await user.type(screen.getAllByLabelText(/phone number/i)[0], "555-0100");
    await user.click(screen.getByRole("button", { name: /add phone number/i }));
    await user.type(screen.getAllByLabelText(/phone number/i)[1], "555-0200");
    await user.click(screen.getAllByRole("button", { name: /^remove number/i })[1]);
    await user.click(screen.getByRole("button", { name: "Add" }));

    const list = screen.getByRole("list", { name: /contacts/i });
    expect(within(list).getByText("555-0100")).toBeInTheDocument();
    expect(within(list).queryByText("555-0200")).not.toBeInTheDocument();
  });

  it("disables the remove control when only one phone row remains", () => {
    render(<App />);

    expect(
      screen.getByRole("button", { name: /^remove number/i }),
    ).toBeDisabled();
  });

  it("drops empty phone rows when saving", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/name/i), "Ada");
    await user.type(screen.getAllByLabelText(/phone number/i)[0], "555-0100");
    await user.click(screen.getByRole("button", { name: /add phone number/i }));
    await user.click(screen.getByRole("button", { name: "Add" }));

    const list = screen.getByRole("list", { name: /contacts/i });
    expect(within(list).getByText("555-0100")).toBeInTheDocument();
    expect(within(list).getAllByText(/^555/)).toHaveLength(1);
  });

  it("keeps the Add button disabled when no phone number has a value", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/name/i), "Ada");
    await user.click(screen.getByRole("button", { name: /add phone number/i }));

    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
  });

  it("saves each phone number with its selected label", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/name/i), "Ada");
    await user.type(screen.getAllByLabelText(/phone number/i)[0], "555-0100");
    await user.click(screen.getByRole("button", { name: /add phone number/i }));
    await user.type(screen.getAllByLabelText(/phone number/i)[1], "555-0200");
    await user.selectOptions(screen.getAllByLabelText(/label/i)[1], "work");
    await user.click(screen.getByRole("button", { name: "Add" }));

    const list = screen.getByRole("list", { name: /contacts/i });
    expect(within(list).getByText(/work/i)).toBeInTheDocument();
  });
});

describe("Phase 2: deleting a contact", () => {
  it("removes a contact after confirming the delete", async () => {
    const user = userEvent.setup();
    render(
      <App
        initialContacts={[
          makeContact("Ada", "555-0100"),
          makeContact("Grace", "555-0199"),
        ]}
      />,
    );

    await user.click(screen.getAllByRole("button", { name: /^delete/i })[0]);
    await user.click(screen.getByRole("button", { name: /confirm/i }));

    expect(screen.queryByText("Ada")).not.toBeInTheDocument();
    expect(screen.getByText("Grace")).toBeInTheDocument();
  });

  it("keeps the contact when the delete is cancelled", async () => {
    const user = userEvent.setup();
    render(<App initialContacts={[makeContact("Ada", "555-0100")]} />);

    await user.click(screen.getByRole("button", { name: /^delete/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^delete/i }),
    ).toBeInTheDocument();
  });

  it("shows the empty state after deleting the only contact", async () => {
    const user = userEvent.setup();
    render(<App initialContacts={[makeContact("Ada", "555-0100")]} />);

    await user.click(screen.getByRole("button", { name: /^delete/i }));
    await user.click(screen.getByRole("button", { name: /confirm/i }));

    expect(screen.getByText(/no contacts yet/i)).toBeInTheDocument();
  });
});

describe("Phase 2: editing a contact", () => {
  it("opens an edit form pre-filled with the contact's values", async () => {
    const user = userEvent.setup();
    render(<App initialContacts={[makeContact("Ada", "555-0100")]} />);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    const editForm = screen.getByRole("form", { name: /edit contact/i });
    expect(within(editForm).getByLabelText(/name/i)).toHaveValue("Ada");
    expect(within(editForm).getByLabelText(/phone number/i)).toHaveValue(
      "555-0100",
    );
  });

  it("updates the contact's name in the list after saving", async () => {
    const user = userEvent.setup();
    render(<App initialContacts={[makeContact("Ada", "555-0100")]} />);

    await user.click(screen.getByRole("button", { name: /edit/i }));
    const editForm = screen.getByRole("form", { name: /edit contact/i });
    const nameInput = within(editForm).getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Ada Lovelace");
    await user.click(within(editForm).getByRole("button", { name: /save/i }));

    const list = screen.getByRole("list", { name: /contacts/i });
    expect(within(list).getByText("Ada Lovelace")).toBeInTheDocument();
  });

  it("updates a phone number's value after saving", async () => {
    const user = userEvent.setup();
    render(<App initialContacts={[makeContact("Ada", "555-0100")]} />);

    await user.click(screen.getByRole("button", { name: /edit/i }));
    const editForm = screen.getByRole("form", { name: /edit contact/i });
    const phoneInput = within(editForm).getByLabelText(/phone number/i);
    await user.clear(phoneInput);
    await user.type(phoneInput, "555-9999");
    await user.click(within(editForm).getByRole("button", { name: /save/i }));

    const list = screen.getByRole("list", { name: /contacts/i });
    expect(within(list).getByText("555-9999")).toBeInTheDocument();
    expect(within(list).queryByText("555-0100")).not.toBeInTheDocument();
  });

  it("adds a phone number to an existing contact while editing", async () => {
    const user = userEvent.setup();
    render(<App initialContacts={[makeContact("Ada", "555-0100")]} />);

    await user.click(screen.getByRole("button", { name: /edit/i }));
    const editForm = screen.getByRole("form", { name: /edit contact/i });
    await user.click(
      within(editForm).getByRole("button", { name: /add phone number/i }),
    );
    await user.type(
      within(editForm).getAllByLabelText(/phone number/i)[1],
      "555-0200",
    );
    await user.click(within(editForm).getByRole("button", { name: /save/i }));

    const list = screen.getByRole("list", { name: /contacts/i });
    expect(within(list).getByText("555-0100")).toBeInTheDocument();
    expect(within(list).getByText("555-0200")).toBeInTheDocument();
  });

  it("removes a single phone number from a contact while editing", async () => {
    const user = userEvent.setup();
    render(<App initialContacts={[makeMultiPhoneContact()]} />);

    await user.click(screen.getByRole("button", { name: /edit/i }));
    const editForm = screen.getByRole("form", { name: /edit contact/i });
    await user.click(
      within(editForm).getAllByRole("button", { name: /^remove number/i })[1],
    );
    await user.click(within(editForm).getByRole("button", { name: /save/i }));

    const list = screen.getByRole("list", { name: /contacts/i });
    expect(within(list).getByText("555-0100")).toBeInTheDocument();
    expect(within(list).queryByText("555-0200")).not.toBeInTheDocument();
  });

  it("discards changes when the edit is cancelled", async () => {
    const user = userEvent.setup();
    render(<App initialContacts={[makeContact("Ada", "555-0100")]} />);

    await user.click(screen.getByRole("button", { name: /edit/i }));
    const editForm = screen.getByRole("form", { name: /edit contact/i });
    const nameInput = within(editForm).getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Changed");
    await user.click(within(editForm).getByRole("button", { name: /cancel/i }));

    expect(
      screen.queryByRole("form", { name: /edit contact/i }),
    ).not.toBeInTheDocument();
    const list = screen.getByRole("list", { name: /contacts/i });
    expect(within(list).getByText("Ada")).toBeInTheDocument();
    expect(within(list).queryByText("Changed")).not.toBeInTheDocument();
  });
});

describe("Phase 2: choosing the primary number while editing", () => {
  it("makes the chosen number the primary after saving", async () => {
    const user = userEvent.setup();
    render(<App initialContacts={[makeMultiPhoneContact()]} />);

    await user.click(screen.getByRole("button", { name: /edit/i }));
    const editForm = screen.getByRole("form", { name: /edit contact/i });
    await user.click(
      within(editForm).getAllByRole("radio", { name: /primary/i })[1],
    );
    await user.click(within(editForm).getByRole("button", { name: /save/i }));

    const list = screen.getByRole("list", { name: /contacts/i });
    const newPrimary = within(list).getByText("555-0200");
    const demoted = within(list).getByText("555-0100");
    expect(
      newPrimary.compareDocumentPosition(demoted) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("falls back to the first remaining number when the primary is removed", async () => {
    const user = userEvent.setup();
    render(<App initialContacts={[makeMultiPhoneContact()]} />);

    await user.click(screen.getByRole("button", { name: /edit/i }));
    const editForm = screen.getByRole("form", { name: /edit contact/i });
    await user.click(
      within(editForm).getAllByRole("button", { name: /^remove number/i })[0],
    );
    await user.click(within(editForm).getByRole("button", { name: /save/i }));

    const list = screen.getByRole("list", { name: /contacts/i });
    expect(within(list).queryByText("555-0100")).not.toBeInTheDocument();
    const remaining = within(list).getByText("555-0200");
    expect(remaining).toBeInTheDocument();
    expect(within(list).getByText(/primary/i)).toBeInTheDocument();
  });
});
