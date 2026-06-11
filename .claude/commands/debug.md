---
description: Run the repo-local debug workflow for bugs or failures
argument-hint: <bug description>
---

Use the repo-local `debug` workflow as the source of truth.

Workflow:
1. Gather symptoms: exact errors, timestamps, affected components, reproduction steps.
2. Collect evidence: logs, code paths, CI/CD history, recent commits, DB state if applicable.
3. Form 2-3 competing hypotheses.
4. Test each systematically.
5. State root cause with an evidence chain.
6. Report fix options and preventive measures.

Rules:
- Do not lock onto the first explanation.
- Distinguish immediate cause from underlying cause.
- Do not implement a fix unless the workflow explicitly hands off to fixing.

Task: $ARGUMENTS
