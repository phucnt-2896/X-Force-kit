---
phase: 4
title: "Lifecycle parity, validation, and rollback docs"
status: completed
priority: P1
effort: "1 day"
dependencies: [phase-01, phase-02, phase-03]
---

# Phase 4: Lifecycle parity, validation, and rollback docs

## Context Links

- Spec: `N/A`
- Figma: `N/A`
- Node IDs: `N/A`
- Related spec: `N/A`

## Overview

Add only the approved lifecycle parity hooks and write the validation and rollback artifacts that make the Claude hook port safe to review and ship.

## Requirements

- Functional: implement `SessionStart` and `UserPromptSubmit` only if approved in Phase 01, and document parity outcomes clearly.
- Non-functional: every lifecycle parity gap must be visible in validation docs, not hidden inside runtime behavior.

## Architecture

### Lifecycle boundaries

- `SessionStart` may inject dynamic context behaviorally if the parity contract approves it.
- `UserPromptSubmit` may add context or block, but cannot truly rewrite the first user message the way OpenCode does.
- Long-lived stable instruction text remains in `.claude/rules/*`, not in lifecycle hook scripts.

### Validation focus

1. Confirm which OpenCode behaviors landed in hooks.
2. Confirm which behaviors stayed static in `.claude/rules/*`.
3. Confirm which behaviors remain documented parity gaps.
4. Confirm rollback order starts with `.claude/settings.json`.

## Related Code Files

- Create if approved in `phase-01`: `.claude/hooks/scripts/session-start.cjs`
- Create if approved in `phase-01`: `.claude/hooks/scripts/user-prompt-submit.cjs`
- Create: `docs/ai-tooling/claude-hook-validation-matrix.md`
- Create: `docs/ai-tooling/claude-hook-rollback.md`

## Implementation Steps

1. Implement `SessionStart` only if approved by the Phase 01 parity contract.
2. Implement `UserPromptSubmit` only if approved by the Phase 01 parity contract and only within Claude's supported behavior.
3. Record the final parity result for session toast, system context injection, and first-user-message injection.
4. Write a validation matrix covering blocked paths, allowed paths, logging behavior, and any lifecycle-hook scenarios.
5. Write a rollback document with ordered disable and revert steps.

## Success Criteria

- [x] Lifecycle hooks exist only if they were explicitly approved in Phase 01.
- [x] `docs/ai-tooling/claude-hook-validation-matrix.md` names every implemented behavior and every accepted parity gap.
- [x] `docs/ai-tooling/claude-hook-rollback.md` provides an ordered rollback path starting with `.claude/settings.json`.
- [x] The phase makes it explicit that `UserPromptSubmit` cannot provide byte-for-byte prompt rewrite parity if Claude APIs do not support it.

## Risk Assessment

- **High**: lifecycle hook misuse can duplicate static rule content and create instruction conflicts. Mitigation: ship lifecycle hooks only when Phase 01 approved them and document exact ownership boundaries.
- **Medium**: validation docs can overclaim parity. Mitigation: require every accepted gap to be written down explicitly.

## Rollback Plan

1. Disable lifecycle hook entries in `.claude/settings.json`.
2. Revert `.claude/hooks/scripts/session-start.cjs` and `.claude/hooks/scripts/user-prompt-submit.cjs`.
3. Revert validation and rollback docs if they no longer describe the active runtime.
