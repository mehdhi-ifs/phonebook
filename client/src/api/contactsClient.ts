import type { Contact } from "../types";

export type PhoneInput = {
  id?: string;
  label: string;
  number: string;
  isPrimary?: boolean;
};

export type ContactInput = {
  name: { first: string; last?: string; display?: string };
  phones: PhoneInput[];
};

export type ContactsClient = {
  list(query?: string): Promise<Contact[]>;
  get(id: string): Promise<Contact>;
  create(input: ContactInput): Promise<Contact>;
  update(id: string, input: ContactInput): Promise<Contact>;
  remove(id: string): Promise<void>;
};

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${BASE_URL}/api/contacts${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(await errorMessage(response));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (data.error) return data.error;
  } catch {
    // fall through to a generic message
  }
  return `Request failed (${response.status})`;
}

export const contactsClient: ContactsClient = {
  list: (query) =>
    request("GET", query ? `?q=${encodeURIComponent(query)}` : ""),
  get: (id) => request("GET", `/${id}`),
  create: (input) => request("POST", "", input),
  update: (id, input) => request("PUT", `/${id}`, input),
  remove: (id) => request<void>("DELETE", `/${id}`),
};
