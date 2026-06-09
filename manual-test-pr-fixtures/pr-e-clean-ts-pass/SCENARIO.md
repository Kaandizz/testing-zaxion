# PR-E: Clean TypeScript (all-pass)

## Purpose

Best fixture for **`INCR_SCAN_PROGRESS_UI_ENABLED`** and parse/merkle metadata — should pass all checks.

## Files in this folder

- `src/helpers/format.ts` — small harmless utility, no secrets, no console.

## How to use

1. Branch `test/incr-pr-e`.
2. Copy `src/helpers/format.ts`.
3. Open PR.

## Expected results

| Flags | Expected verdict | Notes |
|-------|------------------|-------|
| Any | **PASS** | Baseline happy path |
| `INCR_SCAN_PROGRESS_UI_ENABLED=true` | PASS + **sectioned checklist** | All rows green / passed |
| Parse + merkle on | PASS + `metadata.incremental` | Hashes and `file_kind: source` |

## What to look for

- Checklist sections complete with mostly **passed** states.
- Good PR to verify UI polling (page updates while RUNNING).
