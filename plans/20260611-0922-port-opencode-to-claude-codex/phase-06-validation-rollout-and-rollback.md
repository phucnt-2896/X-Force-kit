---
phase: 6
title: "Parity validation, rollout, and rollback documentation"
status: pending
priority: P1
effort: "1 day"
dependencies: [phase-02, phase-03, phase-04, phase-05]
---

# Phase 6: Parity validation, rollout, and rollback documentation

## Context Links

- Spec: `N/A`
- Figma: `N/A`
- Node IDs: `N/A`
- Related spec: `N/A`

## Overview

Define how the migrated Claude and Codex setups will be verified against current OpenCode behavior and how they will be rolled out safely without breaking the existing repo workflow.

## Requirements

- Functional: provide a repeatable parity checklist, rollout sequence, and rollback guide.
- Non-functional: validation must catch security regressions in blocked-dir enforcement before maintainers trust the new setup.

## Architecture

**Data flow**

1. Input: completed Claude and Codex migration surfaces plus the original OpenCode behavior baseline.
2. Transform: compare prompt outcomes and hook outcomes across platforms using a fixed scenario matrix.
3. Output: validation documentation, rollout order, rollback instructions, and optional helper scripts.

Critical coverage:

- Instruction parity: response language, junior explanation level, and “Think Before Coding” guidance, without relying on root-level `CLAUDE.md` or `AGENTS.md`.
- Rule parity: project context, FE rules, and BE rules.
- Enforcement parity: blocked-dir behavior for `node_modules`, `vendor`, `.git`, `bootstrap/cache`, and `public/build` from `.opencode/x-force.config.json:10-15`, using the approved `warn + confirm` policy.
- Operator parity: logging visibility after tool execution.

## Related Code Files

- Create: `docs/ai-tooling/parity-test-matrix.md`
- Create: `docs/ai-tooling/rollout-and-rollback.md`
- Create: `scripts/ai-tooling/verify-blocked-dir-policy.sh`

## Implementation Steps

1. Build prompt scenarios that compare OpenCode, Claude, and Codex outputs for the same tasks.
2. Define blocked-dir test cases for every configured restricted directory.
3. Write a rollout sequence: Claude first, Codex second, `.opencode` retained as fallback.
4. Write a rollback sequence by platform and by file group.
5. Add a lightweight helper script if it reduces manual verification risk.

## Success Criteria

- [ ] A parity matrix exists with concrete scenarios and expected outcomes.
- [ ] Blocked-dir test coverage includes every configured restricted directory and verifies `warn + confirm` behavior.
- [ ] Rollout order and rollback steps are documented per platform.
- [ ] The validation docs make it clear that `.opencode/**` remains the fallback until parity is accepted.

## Risk Assessment

- **High**: false confidence without scenario-based validation could ship unsafe AI guidance. Mitigation: require explicit parity test cases before deprecating `.opencode/**`.
- **Medium**: helper scripts may drift from docs. Mitigation: keep scripts minimal and reference them from the docs.

## Rollback Plan

- Revert validation docs and helper scripts independently.
- No runtime migration surface should depend on these files to function.
