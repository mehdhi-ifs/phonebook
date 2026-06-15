import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

function getContactsRegion() {
  return screen.getByRole("region", { name: /contacts/i });
}

describe("Phone Book — Phase 1", () => {
  it("shows an empty-state message when there are no contacts", () => {
    render(<App />);

    expect(screen.getByText(/no contacts yet/i)).toBeInTheDocument();
  });

  it("adds a contact and shows it in the list immediately", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/first name/i), "Ada");
    await user.type(screen.getByLabelText(/last name/i), "Lovelace");
    await user.type(screen.getByLabelText(/phone number/i), "555-0100");
    await user.click(screen.getByRole("button", { name: /add/i }));

    const contacts = within(getContactsRegion());
    expect(contacts.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(contacts.getByText("555-0100")).toBeInTheDocument();
    expect(screen.queryByText(/no contacts yet/i)).not.toBeInTheDocument();
  });

  it("resets the form inputs after a successful add", async () => {
    const user = userEvent.setup();
    render(<App />);

    const first = screen.getByLabelText(/first name/i) as HTMLInputElement;
    const last = screen.getByLabelText(/last name/i) as HTMLInputElement;
    const phone = screen.getByLabelText(/phone number/i) as HTMLInputElement;

    await user.type(first, "Grace");
    await user.type(last, "Hopper");
    await user.type(phone, "555-0199");
    await user.click(screen.getByRole("button", { name: /add/i }));

    expect(first.value).toBe("");
    expect(last.value).toBe("");
    expect(phone.value).toBe("");
  });

  it("disables Add (the guard) until both first name and phone are filled", async () => {
    const user = userEvent.setup();
    render(<App />);

    const addButton = screen.getByRole("button", { name: /add/i });
    expect(addButton).toBeDisabled();

    await user.type(screen.getByLabelText(/first name/i), "Alan");
    expect(addButton).toBeDisabled();

    await user.type(screen.getByLabelText(/phone number/i), "555-0123");
    expect(addButton).toBeEnabled();
  });

  it("treats whitespace-only input as empty (does not enable Add)", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/first name/i), "   ");
    await user.type(screen.getByLabelText(/phone number/i), "   ");

    expect(screen.getByRole("button", { name: /add/i })).toBeDisabled();
  });

  it("allows adding with only a first name and phone (last name optional)", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/first name/i), "Cher");
    await user.type(screen.getByLabelText(/phone number/i), "555-0150");
    await user.click(screen.getByRole("button", { name: /add/i }));

    const contacts = within(getContactsRegion());
    const name = contacts.getByText("Cher");
    expect(name).toBeInTheDocument();
    expect(name.textContent).toBe("Cher");
  });
});
