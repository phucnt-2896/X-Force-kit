---
description: Create or update a repo-local implementation plan
argument-hint: <task description or plan mode>
---

Use the repo-local `plan` workflow as the source of truth.

Requirements:
- Resolve spec context first when a spec exists.
- Scan unfinished plans first and detect overlaps or blockers.
- Challenge scope before planning.
- Keep phases single-focus, under the file-count limit, and parallel-safe.
- Write plan files under `plans/`.
- Include validation and red-team checks in the plan output.

Workflow:
1. Resolve spec context.
2. Run cross-plan scan.
3. Challenge scope and choose planning mode.
4. Research and understand the codebase.
5. Write `plan.md` and phase files.
6. Run validation and consistency checks.
7. Output the exact next-step cook command.

Task: $ARGUMENTS
