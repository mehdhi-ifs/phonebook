# Phone Book

A contacts phone book. The repo is split into two independent packages:

- **`client/`** — the React + TypeScript app (Vite, Vitest).
- **`server/`** — the Node.js + Express REST API, persisting to SQLite via the
  built-in `node:sqlite` module. Written in TypeScript and run directly on Node's
  native TypeScript support (no build step).

## Requirements

- **Node.js 24+** (the server relies on `node:sqlite` and native TypeScript
  execution, both available without flags on Node 24).

## Running in development

The client and server run as **two separate processes, in two terminals**.

**Terminal 1 — API server** (defaults to `http://localhost:3001`):

```bash
cd server
npm install
npm run dev
```

**Terminal 2 — web client** (Vite dev server, `http://localhost:5173`):

```bash
cd client
npm install
npm run dev
```

The client talks to the API at the URL in `VITE_API_URL` (defaults to
`http://localhost:3001`). To point it elsewhere, set it in `client/.env`:

```
VITE_API_URL=http://localhost:3001
```

## Testing

- **Client:** `cd client && npm test` (Vitest + React Testing Library).
- **Server:** `cd server && npm test` (`node --test` + supertest).

## Server configuration

| Env var   | Default            | Purpose                          |
| --------- | ------------------ | -------------------------------- |
| `PORT`    | `3001`             | Port the API listens on          |
| `DB_PATH` | `data/phonebook.db`| SQLite database file (on disk)   |

The SQLite database and its schema are created automatically on first run. The
`server/data/` directory is git-ignored.
