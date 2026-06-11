---
phase: 4
title: "Codex instruction, config, and hook layer"
status: pending
priority: P1
effort: "1 day"
dependencies: [phase-01]
---

# Phase 4: Codex instruction, config, and hook layer

## Context Links

- Spec: `N/A`
- Figma: `N/A`
- Node IDs: `N/A`
- Related spec: `N/A`

## Overview

Establish the repo-local Codex instruction surfaces that replace OpenCode system/message injection without relying on root-level `AGENTS.md`, and define the first-pass hook policy.

## Requirements

- Functional: create project-level Codex config, repo-local rules sources, and hook entrypoints for blocked-dir and logging behavior.
- Non-functional: respect Codex's instruction layering while avoiding root-level `AGENTS.md` in this repository.

## Architecture

**Data flow**

1. Input: approved parity matrix, current injected instruction content, and blocked-dir settings from `.opencode/x-force.config.json:2-17`.
2. Transform: divide content between `.codex/config.toml`, `.codex/rules/*`, and hook executables.
3. Output: repo-local Codex bootstrap that loads consistently from the repository root.

Design constraints:

- `.codex/config.toml` should be used for `instructions` and `developer_instructions` where appropriate.
- `.codex/rules/*` should remain the canonical checked-in wording source where maintainers need readable repo-local rule files.
- Hook implementation must explicitly use the approved `warn + confirm` blocked-dir policy.

## Related Code Files

- Create: `.codex/config.toml`
- Create: `.codex/rules/core-workflow.md`
- Create: `.codex/rules/project-context.md`
- Create: `.codex/rules/front-end-development.md`
- Create: `.codex/rules/back-end-development.md`
- Create: `.codex/hooks/session-start.sh`
- Create: `.codex/hooks/user-prompt-submit.sh`
- Create: `.codex/hooks/pre-tool-use.sh`
- Create: `.codex/hooks/post-tool-use.sh`
- Create: `.codex/hooks/stop.sh`

## Implementation Steps

1. Map high-level repo guidance into `.codex/rules/*` and decide what must also be embedded into `.codex/config.toml` for Codex to actually consume.
2. Move developer/system-style instructions into `.codex/config.toml` without duplicating every checked-in rule file verbatim.
3. Implement hook shell entrypoints for session setup, user prompt augmentation if needed, blocked-dir warning/confirmation, and logging.
4. Define whether `PermissionRequest` needs a dedicated policy or documentation note.
5. Validate TOML syntax and hook path references.

## Success Criteria

- [ ] Codex can load repo-local instructions from `.codex/config.toml`, with `.codex/rules/*` preserved as the canonical checked-in source text.
- [ ] Hook entrypoints exist for the planned Codex lifecycle.
- [ ] Blocked-dir enforcement behavior is explicitly documented, not implied.
- [ ] This phase does not create any Codex skill files yet.

## Risk Assessment

- **High**: duplicated instructions across `.codex/rules/*` and `.codex/config.toml` can drift. Mitigation: treat `.codex/rules/*` as canonical wording and keep `config.toml` minimal.
- **High**: Codex hook semantics may not exactly match OpenCode injection timing. Mitigation: prefer stable repo instructions over dynamic prompt mutation where possible.
- **Medium**: `warn + confirm` may be weaker than hard deny. Mitigation: cover every blocked directory in parity tests and document the accepted tradeoff.

## Rollback Plan

- Revert `.codex/config.toml` and `.codex/rules/*` independently from hook scripts.
- Disable hook references before deleting scripts if a hook causes failures.
