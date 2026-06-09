# PR-C: JavaScript console.log in production source

## Purpose

Confirm incremental routing **still catches real issues** — this is a **true positive**, not a false positive test.

## Files in this folder

- `src/app.ts` — `console.log` in a normal source file (not a test).

## How to use

1. Branch `test/incr-pr-c`.
2. Copy `src/app.ts`.
3. Open PR.

## Expected results

| Flags | Expected verdict | Notes |
|-------|------------------|-------|
| Legacy or incremental | **WARN** or **BLOCK** | Code quality / no-console rule should fire |
| Router on | Still **WARN/BLOCK** | Must NOT skip — file is `source` + TypeScript |

## What to look for

- Violation on `src/app.ts` mentioning console / code quality.
- Proves router does not over-skip real JS issues.
