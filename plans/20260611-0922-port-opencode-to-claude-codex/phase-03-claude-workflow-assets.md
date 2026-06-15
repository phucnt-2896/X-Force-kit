---
phase: 3
title: "Claude hooks, commands, and agents"
status: pending
priority: P1
effort: "1 day"
dependencies: [phase-01, phase-02]
---

# Phase 3: Claude hooks, commands, and agents

## Context Links

- Spec: `N/A`
- Figma: `N/A`
- Node IDs: `N/A`
- Related spec: `N/A`

## Overview

Create the Claude-side execution surfaces that approximate or replace OpenCode plugin behaviors and workflow entrypoints without relying on Claude plugin packaging, limited to hooks, commands, and agents.

## Requirements

- Functional: provide hook-based equivalents for blocked-dir prompting and post-tool logging, plus Claude-native commands and agents for migrated workflows.
- Non-functional: unsupported behaviors must fail documented, not silent.

## Architecture

**Data flow**

1. Input: approved mapping matrix, Claude rule layer, and OpenCode plugin behaviors from `.opencode/plugins/x-force.ts:35-141`.
2. Transform: package behaviors into Claude hooks, scripts, slash commands, and agents.
3. Output: repo-local Claude workflow assets callable by Claude Code.

Behavior notes:

- Blocked-dir enforcement from `.opencode/plugins/x-force.ts:55-91` should map to Claude `PreToolUse` hooks plus scripts, but the approved first pass is `warn + confirm` rather than hard deny.
- Post-tool logging from `.opencode/plugins/x-force.ts:93-95` may map to `PostToolUse` hooks.
- Session toast from `.opencode/plugins/x-force.ts:49-53` likely remains intentionally unported.
- OpenCode agent names must be preserved when creating `.claude/commands/*` and `.claude/agents/*`.

## Related Code Files

- Create: `.claude/settings.json`
- Create: `.claude/hooks/hooks.json`
- Create: `.claude/hooks/scripts/warn-blocked-dir-access.sh`
- Create: `.claude/hooks/scripts/post-tool-log.sh`
- Create: `.claude/commands/spec.md`
- Create: `.claude/commands/plan.md`
- Create: `.claude/commands/cook.md`
- Create: `.claude/commands/debug.md`
- Create: `.claude/commands/code-review.md`
- Create: `.claude/agents/planner.md`
- Create: `.claude/agents/researcher.md`
- Create: `.claude/agents/fullstack-developer.md`
- Create: `.claude/agents/tester.md`
- Create: `.claude/agents/project-manager.md`
- Create: `.claude/agents/docs-manager.md`
- Create: `.claude/agents/journal-writer.md`
- Create: `.claude/agents/debugger.md`
- Create: `.claude/agents/code-reviewer.md`
- Create: `.claude/agents/brainstormer.md`

## Implementation Steps

1. Translate blocking and logging behaviors into Claude hook config plus scripts.
2. Create only the minimum viable command set needed to preserve current workflow entrypoints.
3. Preserve every current OpenCode agent name, adding metadata descriptions where Claude benefits from them.
4. Implement blocked-dir behavior as `warn + confirm`, not hard block, and document the operator experience.
5. Validate all paths in hooks, commands, and agents.

## Success Criteria

- [ ] Claude hook config exists for blocked-dir warning/confirmation and post-tool logging.
- [ ] Claude commands cover the repo's core workflows.
- [ ] Claude agent names match the current `.opencode` inventory.
- [ ] Session toast is either intentionally dropped or documented with a clear alternative.

## Risk Assessment

- **High**: a bad pre-tool hook can create too many noisy confirmations or still miss blocked paths. Mitigation: keep scripts narrow and validate prompt triggers against every configured directory.
- **Medium**: preserving every current OpenCode agent name increases file count. Mitigation: keep Phase 3 limited to agents, with skills split into a separate phase.

## Rollback Plan

- Disable `.claude/hooks/hooks.json` first if workflow prompting is wrong.
- Revert `.claude/commands/*` and `.claude/agents/*` independently from rules files.
