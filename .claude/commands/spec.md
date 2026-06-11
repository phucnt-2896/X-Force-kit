---
description: Run the repo-local spec-gated interview workflow for new features or UI-bearing work
argument-hint: <task description>
---

Use the repo-local `spec` workflow as the source of truth.

Requirements:
- Explore project context before asking questions.
- Ask one focused question at a time.
- Prefer guided options over broad free-text prompts.
- Ask `WHY` before `WHAT`.
- Write a spec, self-review it, and stop for user approval.
- Save the approved spec file for downstream planning.

Hard gates:
- Do not invoke implementation or planning until a written spec exists and the user has reviewed it.
- If the request is UI-bearing, require a UI checkpoint before finalizing the spec.

Workflow:
1. Explore project context first.
2. Identify missing requirement facts.
3. Ask the next highest-leverage question.
4. Insert summary checkpoints when enough is known.
5. Narrow scope if the request is too broad.
6. Run a final context sweep.
7. Draft the spec.
8. Self-review and ask for approval.

Task: $ARGUMENTS
