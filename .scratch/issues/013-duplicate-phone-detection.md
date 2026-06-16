# Issue 013 — Duplicate phone detection (client-derived)

**Status:** done
**Type:** AFK
**Parent:** `.scratch/prd-phase3-backend-search-duplicates.md`

## What to build

Visually flag phone numbers that appear on more than one contact, derived on the
client over the full phone book.

From the **full list** (the unfiltered state from Issue 012 — not the filtered
view), `App` computes the set of phone numbers that appear on **two or more**
contacts, using exact string equality (no normalization). Each occurrence of such a
number is flagged in the UI with a Material-styled "Duplicate" badge / highlight on
the number. Duplicates are **derived on render** (never stored), so the flags update
automatically after add / edit / delete, and they reflect the full set even when a
search is filtering the displayed list (a number can show as duplicate even if its
partner contact is currently filtered out of view).

If search isn't yet present, derive duplicates from the loaded list; the
"compute over the full set, independent of the active query" rule is the
contract once Issue 012 lands.

## Acceptance criteria

- [x] A phone number on two or more contacts is flagged on every contact where it appears.
- [x] A phone number on only one contact is not flagged.
- [x] Duplicate detection uses exact string comparison (no normalization) and is computed, not stored.
- [x] The flag updates after add / edit / delete without a manual refresh.
- [x] Duplicates are computed over the full list, so a number stays flagged even when its other contact is filtered out by an active search.
- [x] The badge/highlight follows Material cues with sufficient contrast and is accessible (labeled/announced).
- [x] Tests through `<App />` + fake client cover: a shared number flagged on both contacts, a unique number not flagged, the flag updating after a mutation, and (with search) a duplicate still flagged while its partner is filtered from view.

## Blocked by

- Issue 011 — Frontend talks to the API for all reads & writes. (Can run in parallel with Issue 012.)
