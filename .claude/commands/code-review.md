---
description: Run the repo-local adversarial code review workflow
argument-hint: <review target>
---

Use the repo-local `code-review` workflow as the source of truth.

Input resolution:
- `#123` or PR URL -> review PR diff
- Commit SHA -> review that commit
- `--pending` -> review current diff
- No arguments -> infer from context or ask the user

Workflow:
1. Check spec or plan compliance if one exists.
2. Run a 2-pass quality checklist: critical first, then informational findings.
3. Run adversarial review for false assumptions, leaks, and race conditions.
4. Do not claim completion without verification evidence.

Review priorities:
- Security and data safety
- Auth and access control
- Performance and bottlenecks
- Dead code and test gaps

Task: $ARGUMENTS
