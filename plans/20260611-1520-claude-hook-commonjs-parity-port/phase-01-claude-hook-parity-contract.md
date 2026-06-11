---
phase: 1
title: "Claude hook parity contract"
status: completed
priority: P1
effort: "0.5 day"
dependencies: []
---

# Phase 1: Claude hook parity contract

## Context Links

- Spec: `N/A`
- Figma: `N/A`
- Node IDs: `N/A`
- Related spec: `N/A`

## Overview

Define exactly which parts of the OpenCode X-Force plugin must become Claude hook behavior, which parts stay covered by checked-in Claude rules, and which parts cannot be ported 1:1.

## Requirements

- Functional: produce a file-by-file parity contract for the behavior in `.opencode/plugins/x-force.ts`.
- Non-functional: every non-1:1 area must be explicit before any Claude runtime file is changed.

## Architecture

### Source behaviors under review

- Session toast in `.opencode/plugins/x-force.ts`
- Blocked-dir guard in `.opencode/plugins/x-force.ts`
- Post-tool logging in `.opencode/plugins/x-force.ts`
- System context injection in `.opencode/plugins/x-force.ts`
- First-user-message injection in `.opencode/plugins/x-force.ts`
- Config semantics in `.opencode/plugins/lib/x-force-context-helper.ts` and `.opencode/x-force.config.json`

### Decision outputs required

1. Which behaviors move to Claude hooks.
2. Which behaviors remain static in `.claude/rules/*`.
3. Which behaviors are only achievable as documented behavioral parity.
4. Which existing `.claude` runtime files are obsolete and must be removed from the active path.

## Related Code Files

- Create: `docs/ai-tooling/claude-hook-port-matrix.md`
- Create: `docs/ai-tooling/claude-hook-parity-gaps.md`

## Implementation Steps

1. Inventory each OpenCode behavior from `.opencode/plugins/x-force.ts`.
2. Map each behavior to one of: `Claude hook`, `existing static rule`, `unsupported`, or `behavioral parity only`.
3. Record exact reasons when Claude cannot provide 1:1 timing, UI, or prompt-mutation parity.
4. Freeze the runtime boundary for later phases: `.claude/settings.json` active, `.claude/hooks/hooks.json` inactive/removed, Node `.cjs` only.
5. Record whether `SessionStart` and `UserPromptSubmit` are actually required or intentionally skipped.

## Success Criteria

- [x] `docs/ai-tooling/claude-hook-port-matrix.md` maps every behavior from `.opencode/plugins/x-force.ts` to a Claude target surface or an explicit non-parity decision.
- [x] `docs/ai-tooling/claude-hook-parity-gaps.md` names every accepted gap, including session toast and any prompt-injection differences.
- [x] The phase explicitly decides whether `SessionStart` and `UserPromptSubmit` hooks are needed.
- [x] The phase explicitly states that Claude runtime config will live under `.claude/**`, not `.opencode/x-force.config.json`.

## Risk Assessment

- **High**: ambiguous parity decisions will leak into runtime work and create hidden drift. Mitigation: block later phases until every source behavior has a named destination.
- **Medium**: over-porting dynamic hooks may duplicate stable rule content already present in `.claude/rules/*.md`. Mitigation: require an explicit reason before approving lifecycle hooks.

## Rollback Plan

- Revert the two docs if the parity contract is wrong.
- Do not start runtime work until the revised contract is re-approved.
