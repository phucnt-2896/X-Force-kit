---
description: Execute an approved repo-local plan phase by phase
argument-hint: <plan path or task>
---

Use the repo-local `cook` workflow as the source of truth.

Hard gates:
- Do not write implementation code until a plan exists.
- If input is a task description with no plan, redirect to planning.
- If input is a plan path, load it and follow phase ownership strictly.

Workflow:
1. Load the plan or scout if no plan path exists.
2. Resolve context sources and acceptance criteria.
3. Implement one phase at a time.
4. Run tests.
5. Run code review; fix critical issues up to 3 cycles.
6. Finalize by syncing phase checkboxes, updating plan status, and writing a journal entry.

Side-effect check:
- No unintended business logic regression.
- No new lint/type/build errors.
- No public contract changes unless intentional.

Task: $ARGUMENTS
