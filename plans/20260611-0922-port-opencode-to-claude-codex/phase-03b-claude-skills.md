---
phase: 3b
title: "Claude skills surface"
status: pending
priority: P1
effort: "1 day"
dependencies: [phase-01, phase-02]
---

# Phase 3b: Claude skills surface

## Context Links

- Spec: `N/A`
- Figma: `N/A`
- Node IDs: `N/A`
- Related spec: `N/A`

## Overview

Port the full `.opencode/skills/*` inventory into `.claude/skills/*` while preserving current names and keeping file count within the plan limits.

## Requirements

- Functional: provide Claude-native skills for the current repo workflow vocabulary without renaming existing skills.
- Non-functional: keep the skill port faithful and metadata-oriented, not a silent behavioral redesign.

## Architecture

**Data flow**

1. Input: approved mapping matrix, locked parity decisions, and the current `.opencode/skills/*` inventory.
2. Transform: port skill definitions into `.claude/skills/*`, preserving names and adding only the metadata Claude benefits from.
3. Output: repo-local Claude skills aligned with the current OpenCode workflow language.

Design constraints:

- Preserve every current skill name exactly.
- Keep source mappings visible so later maintainers can trace each skill back to `.opencode`.
- Do not use this phase to rename, merge, or consolidate skills.

## Related Code Files

- Create: `.claude/skills/spec/SKILL.md`
- Create: `.claude/skills/plan/SKILL.md`
- Create: `.claude/skills/cook/SKILL.md`
- Create: `.claude/skills/code-review/SKILL.md`
- Create: `.claude/skills/debug/SKILL.md`
- Create: `.claude/skills/fix/SKILL.md`
- Create: `.claude/skills/scout/SKILL.md`
- Create: `.claude/skills/journal/SKILL.md`
- Create: `.claude/skills/watzup/SKILL.md`
- Create: `.claude/skills/project-organization/SKILL.md`
- Create: `.claude/skills/commit-message/SKILL.md`
- Create: `.claude/skills/agent-browser/SKILL.md`
- Create: `.claude/skills/inertia-react-development/SKILL.md`
- Create: `.claude/skills/laravel-best-practices/SKILL.md`
- Create: `.claude/skills/pest-testing/SKILL.md`
- Create: `.claude/skills/tailwindcss-development/SKILL.md`
- Create: `.claude/skills/fe-integration-docs/SKILL.md`
- Create: `.claude/skills/brainstorm/SKILL.md`

## Implementation Steps

1. Port the full current `.opencode/skills/*` inventory with the same names.
2. Add source mapping metadata where it helps Claude discoverability or maintenance.
3. Keep wording faithful unless a target-platform-specific field requires adaptation.
4. Validate path layout and ensure no overlap with hooks, commands, or agents from Phase 3.

## Success Criteria

- [ ] Current `.opencode/skills/*` names are preserved under `.claude/skills/*`.
- [ ] Skill metadata additions do not rename or consolidate existing skills.
- [ ] No `.claude/skills/*` file depends on future Codex work to make sense.
- [ ] The phase stays within the file-count limit.

## Risk Assessment

- **Medium**: preserving every current skill name increases file count. Mitigation: split skills into this dedicated phase.
- **Medium**: platform-specific metadata could drift from source wording. Mitigation: keep source mapping visible in each migrated skill.

## Rollback Plan

- Revert `.claude/skills/*` independently from `.claude/hooks/*`, `.claude/commands/*`, and `.claude/agents/*`.
