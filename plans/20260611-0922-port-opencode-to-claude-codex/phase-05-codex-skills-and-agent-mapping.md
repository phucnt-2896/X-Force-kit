---
phase: 5
title: "Codex skills and agent-role migration"
status: pending
priority: P2
effort: "1 day"
dependencies: [phase-01, phase-04]
---

# Phase 5: Codex skills and agent-role migration

## Context Links

- Spec: `N/A`
- Figma: `N/A`
- Node IDs: `N/A`
- Related spec: `N/A`

## Overview

Port the reusable workflow layer from OpenCode skills and agents into Codex-discoverable repo skills while preserving current names and documenting any metadata additions.

## Requirements

- Functional: provide Codex repo skills that preserve the current team workflow vocabulary and current OpenCode names (`spec`, `plan`, `cook`, `debug`, `code-review`, etc.).
- Non-functional: keep naming stable and avoid silent renames or role consolidation.

## Architecture

**Data flow**

1. Input: OpenCode skills/agents inventory and parity decisions.
2. Transform: port the current skills and agent-role vocabulary into Codex skill packages and a mapping note for platform-specific metadata differences.
3. Output: `.codex/skills/*` plus a maintainers' mapping document.

Design rules:

- Preserve current skill and agent names exactly.
- If an OpenCode agent cannot map directly to a Codex runtime surface, record it as a name-preserved documentation mapping rather than renaming it.
- Keep role mapping human-readable so future maintainers know which differences are metadata-only versus behavioral.

## Related Code Files

- Create: `.codex/skills/spec/SKILL.md`
- Create: `.codex/skills/plan/SKILL.md`
- Create: `.codex/skills/cook/SKILL.md`
- Create: `.codex/skills/debug/SKILL.md`
- Create: `.codex/skills/code-review/SKILL.md`
- Create: `.codex/skills/fix/SKILL.md`
- Create: `.codex/skills/scout/SKILL.md`
- Create: `.codex/skills/journal/SKILL.md`
- Create: `.codex/skills/watzup/SKILL.md`
- Create: `.codex/skills/project-organization/SKILL.md`
- Create: `.codex/skills/commit-message/SKILL.md`
- Create: `.codex/skills/agent-browser/SKILL.md`
- Create: `.codex/skills/inertia-react-development/SKILL.md`
- Create: `.codex/skills/laravel-best-practices/SKILL.md`
- Create: `.codex/skills/pest-testing/SKILL.md`
- Create: `.codex/skills/tailwindcss-development/SKILL.md`
- Create: `.codex/skills/fe-integration-docs/SKILL.md`
- Create: `.codex/skills/brainstorm/SKILL.md`
- Create: `docs/ai-tooling/codex-agent-skill-mapping.md`

## Implementation Steps

1. Port the full current skill inventory with the same names used under `.opencode/skills/*`.
2. Translate only the skill metadata and instructions that Codex can actually discover and use.
3. Preserve current agent names in the mapping doc even if some are represented as supporting workflow documentation rather than a direct Codex runtime primitive.
4. Record exact mappings, metadata additions, and dropped items in `docs/ai-tooling/codex-agent-skill-mapping.md`.
5. Validate that repo-local skill paths align with Codex skill discovery expectations.

## Success Criteria

- [ ] Current `.opencode/skills/*` names are preserved under `.codex/skills/*` where applicable.
- [ ] Every migrated skill has a clear source mapping back to `.opencode`.
- [ ] Agent mappings preserve current names and document any metadata-only differences explicitly.
- [ ] The Codex workflow vocabulary remains recognizable to current maintainers.

## Risk Assessment

- **Medium**: literal name preservation increases the number of files to maintain. Mitigation: keep content lean and focus metadata additions only where useful.
- **Medium**: role mapping may become opaque later. Mitigation: maintain a dedicated mapping doc.

## Rollback Plan

- Revert `.codex/skills/*` without touching `.codex/config.toml`, `.codex/rules/*`, or hook files.
- Keep the mapping doc only if it remains useful as historical reference; otherwise revert it too.
