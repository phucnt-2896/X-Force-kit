---
name: code-review
description: "Review code quality with adversarial rigor. Auto-detects PR, Commit, or local diff. Runs spec compliance, quality checks, and adversarial red-teaming."
---

# Code Review

Adversarial mindset, evidence-based, minimalist workflow with uncompromising rigor.

## Core Principle

**YAGNI**, **KISS**, **DRY** always. Technical correctness over social comfort.
**Be honest, be brutal, straight to the point, and be concise.**

## 1. Input Resolution

Auto-detect review target from arguments:
- `#123` or PR URL -> Run `gh pr diff 123`
- Commit SHA (7+ hex chars) -> Run `git show COMMIT_SHA`
- `--pending` -> Run `git diff HEAD` (staged + unstaged)
- No arguments:
  1. Use the most recent conversation context if changes are apparent.
  2. If no context, ask user (Header: "Review Target", Question: "What would you like to review?") with options:
     - Pending changes
     - Enter PR number
     - Enter commit hash
     - Full codebase scan

## 2. 3-Stage Review Process (Sequential)

### Preparation: Scout Edge Cases (Recommended for complex changes)
- Before detailed review, run the `scout` skill to scan changes to:
  - Find indirectly affected files (importers/consumers).
  - Identify data flows and potential error paths.
  - Use scout findings as additional input for the Quality Checklist (Step 2).

### Step 1: Spec Compliance (If spec/plan exists)
- Map changed code against requirements (e.g., `plan.md` or ticket).
- Evaluate each requirement: `PASS` / `MISSING` / `EXTRA` (unjustified extra).
- *MISSING requirements must be fixed before proceeding to Step 2.*

### Step 2: Quality Checklist (2-Pass)
Scan diff against the following checklist:

#### Pass 1 - CRITICAL (Block merge):
- **Data Safety:** SQL injection, command injection, XSS (`innerHTML` with user input), path traversal.
- **Race Condition:** Read-check-write without atomic operations, missing unique constraints.
- **Auth & Access:** Missing auth middleware on new routes, IDOR (privilege escalation).

#### Pass 2 - INFORMATIONAL (Non-blocking):
- **Performance:** N+1 queries, missing pagination on lists, O(N^2) loops.
- **Dead Code:** Unused imports/modules, assigned but unread variables, stale comments.
- **Test Gaps:** Missing negative/error-path test cases.

### Step 3: Adversarial Review (Red-Team)
*Skip if changed files <= 2 and lines <= 30 (never skip if touching security/API/SQL/Auth files).*
Adopt a destructive attacker mindset to find:
- False assumptions ("this is never null", "network never timeouts").
- Memory leaks or resource leaks on error paths.
- Race conditions in async execution.

## 3. Verification Gate (Iron Law)

Do not claim completion without executing verification commands:
1. Identify appropriate verification commands (`npm run test`, `go test`, etc.).
2. Run the full command.
3. Report exact output (e.g., "34/34 tests passed") as evidence.

## Workflow Position

**Typically follows:** `/cook` (after implementation)
