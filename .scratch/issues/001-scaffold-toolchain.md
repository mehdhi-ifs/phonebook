# Issue 001 — Scaffold the toolchain

**Status:** ready-for-agent
**Type:** AFK
**Parent:** `.scratch/prd-phase1-view-add-contacts.md`

## What to build

Stand up the project toolchain so feature work can begin. Create the Vite +
React + TypeScript application with a Vitest + React Testing Library test setup.
`App` renders a single placeholder heading (e.g. the app title). One smoke test
renders `<App />` and asserts the heading is present. The dev server and the test
runner both run cleanly.

No phone-book features in this slice — it exists purely to make the repo
buildable, runnable, and testable.

## Acceptance criteria

- [ ] `package.json` exists with scripts for dev, build, and test.
- [ ] `npm install` then `npm run dev` starts the Vite dev server and serves the app.
- [ ] `App` is a React functional component rendering a placeholder heading.
- [ ] Vitest + React Testing Library are configured (jsdom env, test setup file).
- [ ] A smoke test renders `<App />` and asserts the heading is visible, and `npm run test` passes.
- [ ] TypeScript compiles with no errors.

## Blocked by

- None — can start immediately.
