---
phase: 2
title: "Claude Code instruction and rules layer"
status: completed
priority: P1
effort: "1 day"
dependencies: [phase-01]
---

# Phase 2: Claude Code instruction and rules layer

## Context Links

- Spec: `N/A`
- Figma: `N/A`
- Node IDs: `N/A`
- Related spec: `N/A`

## Overview

Translate the persistent OpenCode instruction surfaces into Claude-native repo rules files without introducing root-level `CLAUDE.md`.

## Requirements

- Functional: provide Claude with project rules, response language, coding-level guidance, and “Think Before Coding” guidance equivalent to the current OpenCode system/message injection.
- Non-functional: avoid duplicating the same rule text in multiple Claude files unless the platform requires it.

## Architecture

**Data flow**

1. Input: approved parity matrix, `.opencode/x-force.config.json:2-17`, `.opencode/rules/*.md`, and the injected message/system content from `.opencode/plugins/x-force.ts:96-141`.
2. Transform: split content into focused reusable rule files under `.claude/rules/*`.
3. Output: `.claude/rules/*.md` files with clear ownership boundaries and no dependency on `CLAUDE.md`.

Design constraints:

- `.claude/rules/core-workflow.md` should carry cross-cutting defaults previously injected by OpenCode.
- `.claude/rules/project-context.md`, `.claude/rules/front-end-development.md`, and `.claude/rules/back-end-development.md` are likely direct targets for the existing rule files.
- Response language and junior-level guidance currently injected by OpenCode should be mapped deliberately instead of hidden inside hook scripts.

## Related Code Files

- Create: `.claude/rules/core-workflow.md`
- Create: `.claude/rules/project-context.md`
- Create: `.claude/rules/front-end-development.md`
- Create: `.claude/rules/back-end-development.md`
- Create: `.claude/rules/response-style.md`

## Implementation Steps

1. Convert current injected system context into stable Claude rule files.
2. Convert each current project rule file into Claude rule files with minimal wording drift.
3. Place “Think Before Coding” in `.claude/rules/core-workflow.md` or a separate workflow rule file, but not in `CLAUDE.md`.
4. Add source comments or headings so maintainers can trace each Claude rule back to its `.opencode` origin.
5. Review for duplicate or conflicting instruction text.

## Success Criteria

- [x] Claude rule files cover response language, coding level, and “Think Before Coding”.
- [x] All three current project rule files are represented in Claude rule files.
- [x] No Claude rule file depends on future plugin or command work to make sense.
- [x] File count stays within phase limit and does not overlap ownership with later phases.

## Risk Assessment

- **High**: duplicated or conflicting Claude instructions can create unstable model behavior. Mitigation: keep one authoritative rule per concern.
- **Medium**: too much cross-cutting content in one rule file can reduce clarity. Mitigation: keep core workflow text separated from FE/BE/project rules.

## Rollback Plan

- Revert only `.claude/rules/*`.
- No hook or plugin files are touched in this phase.
