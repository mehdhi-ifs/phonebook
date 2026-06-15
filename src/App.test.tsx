import { render, screen } from "@testing-library/react";
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

    const addButton = screen.getByRole("button", { name: /add/i });
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

    expect(screen.getByRole("button", { name: /add/i })).toBeDisabled();
  });

  it("adds a contact and shows it in the list after submitting", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/name/i), "Ada");
    await user.type(screen.getByLabelText(/phone/i), "555-0100");
    await user.click(screen.getByRole("button", { name: /add/i }));

    expect(screen.queryByText(/no contacts yet/i)).not.toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("555-0100")).toBeInTheDocument();
  });

  it("clears the inputs after a successful add", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/name/i), "Ada");
    await user.type(screen.getByLabelText(/phone/i), "555-0100");
    await user.click(screen.getByRole("button", { name: /add/i }));

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
    await user.click(screen.getByRole("button", { name: /add/i }));

    await user.type(screen.getByLabelText(/name/i), "Grace");
    await user.type(screen.getByLabelText(/phone/i), "555-0199");
    await user.click(screen.getByRole("button", { name: /add/i }));

    const names = screen
      .getAllByText(/Ada|Grace/)
      .map((node) => node.textContent);
    expect(names).toEqual(["Ada", "Grace"]);
  });
});
