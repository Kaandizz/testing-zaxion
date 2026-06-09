# PR-B: Rust `.await` only

## Purpose

Test **`INCR_POLICY_ROUTER_ENABLED`** — JS **reliability** rules (try/catch around `await`) must not run on Rust files.

## Files in this folder

- `src/main.rs` — async Rust with `.await`, no JS try/catch.

## How to use

1. Branch `test/incr-pr-b`.
2. Copy `src/main.rs` into your repo.
3. Open PR (only Rust file changed).

## Expected results

| Flags | Expected verdict | Notes |
|-------|------------------|-------|
| All off (legacy) | **WARN** possible | False positive: “await without try/catch” |
| `INCR_POLICY_ROUTER_ENABLED=true` | **PASS** | Reliability skipped (`inapplicable_language`) |

## What to look for

- Policy result message: `Skipped (inapplicable_language)` for reliability, or no reliability violations.
- Checklist: Reliability row **skipped** or **passed**.
