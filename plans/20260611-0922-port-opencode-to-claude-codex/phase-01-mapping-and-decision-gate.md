---
phase: 1
title: "Mapping matrix and parity decision gate"
status: completed
priority: P1
effort: "1 day"
dependencies: []
---

# Phase 1: Mapping matrix and parity decision gate

## Context Links

- Spec: `N/A`
- Figma: `N/A`
- Node IDs: `N/A`
- Related spec: `N/A`

## Overview

Create the authoritative cross-platform mapping from `.opencode` assets and behaviors into Claude Code and Codex CLI targets, and lock the approved migration constraints before any bulk file creation starts.

## Requirements

- Functional: inventory every repo-local OpenCode asset and every plugin behavior that must be carried, replaced, metadata-enriched, or intentionally dropped.
- Non-functional: the mapping document must be complete enough that later phases do not make silent assumptions.

## Architecture

**Data flow**

1. Input: `.opencode` assets, rule files, config, and plugin behaviors.
2. Transform: classify each item as instruction, rule, hook, command, agent, skill, plugin behavior, or unsupported feature.
3. Output: a mapping matrix and a parity decision log that later phases use as source of truth.

Key design rules:

- Every OpenCode behavior from `.opencode/plugins/x-force.ts:35-141` must be tagged as one of: `direct-port`, `adapt`, `metadata-only`, `drop`, or `unknown`.
- Session toast from `.opencode/plugins/x-force.ts:49-53` should be evaluated explicitly and likely tagged `drop` unless a real operator-visible equivalent exists.
- Missing `docs/development-rules.md` must be recorded as a gap, not backfilled.
- Root-level `CLAUDE.md`, root-level `AGENTS.md`, and Claude plugin packaging must be tagged `out-of-scope` for this migration.

## Related Code Files

- Create: `docs/ai-tooling/opencode-port-matrix.md`
- Create: `docs/ai-tooling/parity-decisions.md`

## Implementation Steps

1. Inventory all `.opencode/agents/*`, `.opencode/skills/*/SKILL.md`, `.opencode/rules/*`, `.opencode/x-force.config.json`, and `.opencode/plugins/x-force.ts` behaviors.
2. Build a matrix with columns for OpenCode source, business purpose, Claude target, Codex target, parity type, risks, and implementation notes.
3. Record explicit decisions for unsupported or non-1:1 items, especially session toast and blocked-dir enforcement.
4. Record that agent and skill names stay unchanged, with metadata enrichment allowed where helpful.
5. Freeze the approved matrix as the only reference allowed for later migration phases.

## Success Criteria

- [x] Every current `.opencode` asset is listed exactly once in the mapping matrix.
- [x] Every plugin behavior is tagged with a parity decision.
- [x] The plan names which items will be dropped or metadata-only instead of leaving them implicit.
- [x] The missing `docs/development-rules.md` reference is recorded as a risk.

## Risk Assessment

- **High**: missing or ambiguous mapping decisions will cause later phases to invent behavior. Mitigation: phase cannot close without 100% coverage of inventoried assets.
- **Medium**: overcommitting to 1:1 parity may create fragile maintenance. Mitigation: require explicit justification for each direct-port choice.

## Rollback Plan

- Delete only the new mapping docs if they are wrong.
- No runtime behavior changes occur in this phase.
