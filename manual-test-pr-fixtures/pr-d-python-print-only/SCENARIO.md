# PR-D: Python `print()` only

## Purpose

Test **`INCR_POLICY_ROUTER_ENABLED`** — JS `console.log` / code-quality rules must not apply to `.py` files.

## Files in this folder

- `src/util.py` — uses `print()`, not `console.log`.

## How to use

1. Branch `test/incr-pr-d`.
2. Copy `src/util.py`.
3. Open PR.

## Expected results

| Flags | Expected verdict | Notes |
|-------|------------------|-------|
| Legacy | PASS or odd JS warnings | Possible misapplied JS patterns |
| `INCR_POLICY_ROUTER_ENABLED=true` | **PASS** | Code quality skipped for Python |

## What to look for

- No violations on `util.py` for `no-console-logs-production` or similar JS policies.
