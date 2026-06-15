---
phase: 2
title: "Claude-only config and canonical hook manifest"
status: completed
priority: P1
effort: "0.5 day"
dependencies: [phase-01]
---

# Phase 2: Claude-only config and canonical hook manifest

## Context Links

- Spec: `N/A`
- Figma: `N/A`
- Node IDs: `N/A`
- Related spec: `N/A`

## Overview

Establish the Claude-owned config source of truth and remove dual-manifest ambiguity before runtime logic is ported.

## Requirements

- Functional: create the Claude-specific config file and make `.claude/settings.json` the only active hook manifest.
- Non-functional: no active runtime hook configuration may remain in `.claude/hooks/hooks.json`.

## Architecture

### Data flow

1. Claude loads project hook declarations from `.claude/settings.json`.
2. Hook scripts read Claude-owned config from `.claude/**`.
3. No runtime lookup falls back to `.opencode/x-force.config.json`.

### Boundaries

- Active manifest target: `.claude/settings.json`
- Obsolete duplicate manifest: `.claude/hooks/hooks.json`
- Claude-owned config preserves approved semantics from OpenCode without becoming a runtime dependency on `.opencode/x-force.config.json`

## Related Code Files

- Modify: `.claude/settings.json`
- Create: `.claude/x-force.config.json`
- Create: `.claude/hooks/README.md`
- Delete: `.claude/hooks/hooks.json`

## Implementation Steps

1. Replace the duplicated-manifest model with a single active project manifest in `.claude/settings.json`.
2. Define the checked-in Claude config contract in `.claude/x-force.config.json`.
3. Document what the Claude config owns, what the hook runtime owns, and why `.claude/hooks/hooks.json` is removed.
4. Ensure the manifest references only Node `.cjs` runtime entries approved in Phase 01.

## Success Criteria

- [x] `.claude/settings.json` is the only active Claude hook manifest in the repo.
- [x] `.claude/x-force.config.json` exists and captures the approved Claude-side settings derived from OpenCode semantics.
- [x] `.claude/hooks/hooks.json` is removed from the active runtime path.
- [x] `.claude/hooks/README.md` documents the canonical manifest, config source of truth, and non-goal of Claude plugin packaging.

## Risk Assessment

- **High**: leaving both manifests active will create immediate drift. Mitigation: delete the duplicate manifest rather than keeping a second runtime source.
- **Medium**: copying OpenCode config semantics into Claude config may accidentally preserve fields that should stay static in `.claude/rules/*`. Mitigation: include only fields approved in Phase 01.

## Rollback Plan

- Restore the previous `.claude/settings.json` if the new manifest shape is invalid.
- Restore `.claude/hooks/hooks.json` only as a temporary recovery step, not as the intended steady state.
- Revert `.claude/x-force.config.json` and `.claude/hooks/README.md` together if the config contract is wrong.
