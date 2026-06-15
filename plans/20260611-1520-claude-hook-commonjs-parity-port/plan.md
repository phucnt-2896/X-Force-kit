---
title: "Port X-Force OpenCode plugin behavior into Claude Code hooks"
description: "Supersede the old Claude hook phase with a Claude-native CommonJS hook plan that preserves X-Force behavior as closely as Claude allows."
status: completed
priority: P1
effort: "3 days"
tags: [planning, ai-tooling, claude-code, hooks, commonjs, parity]
created: "2026-06-11"
blockedBy: ["plans/20260611-0922-port-opencode-to-claude-codex/phase-01-mapping-and-decision-gate.md"]
blocks: []
---

# Plan: Port X-Force OpenCode plugin behavior into Claude Code hooks

## Context Inputs

- Spec file: `N/A`
- OpenCode plugin behavior to port: `.opencode/plugins/x-force.ts`
- OpenCode context/config helper: `.opencode/plugins/lib/x-force-context-helper.ts`
- Current OpenCode config source: `.opencode/x-force.config.json`
- Existing Claude workflow rule baseline: `.claude/rules/core-workflow.md`
- Existing Claude project hook manifest: `.claude/settings.json`
- Existing Claude duplicate hook manifest: `.claude/hooks/hooks.json`
- Existing Claude shell hook scripts: `.claude/hooks/scripts/warn-blocked-dir-access.sh`, `.claude/hooks/scripts/post-tool-log.sh`
- Existing migration plan that this plan supersedes for Claude hook runtime scope: `plans/20260611-0922-port-opencode-to-claude-codex/phase-03-claude-workflow-assets.md`
- Claude Code docs verified via Context7 on 2026-06-11 for `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, manifest location, and hook output contracts

## Context Summary

This repo already has partial Claude hook plumbing, but it is not the target shape for X-Force parity. The current Claude runtime duplicates hook declarations across `.claude/settings.json` and `.claude/hooks/hooks.json`, while the active behavior is implemented in fixed-content shell scripts under `.claude/hooks/scripts/*.sh`. That structure does not match the requested direction for this task.

The source behavior to port is the OpenCode plugin in `.opencode/plugins/x-force.ts`. It currently performs four meaningful responsibilities: blocked-directory guarding for `read`, `glob`, `grep`, and `bash`; post-tool logging; dynamic system context injection based on config and git state; and first-user-message injection that prepends the `EXTREMELY_IMPORTANT` block plus project rules. The user has explicitly chosen to port this into Claude hook surfaces using Node CommonJS `.cjs` scripts, clean up the existing fixed shell hooks, and create a Claude-owned config source of truth under `.claude/**` instead of reading `.opencode/x-force.config.json` at runtime.

The largest design constraint is that Claude hook APIs do not cleanly mirror every OpenCode plugin surface. `PreToolUse` and `PostToolUse` can closely match the tool guard and logging flows. `SessionStart` can inject dynamic context behaviorally. `UserPromptSubmit` can add context or block, but it cannot truly rewrite or prepend user prompt text the same way OpenCode mutates `output.messages`. Because of that, this plan must lock a parity contract first and document accepted non-1:1 behavior before runtime implementation begins.

## Overlap / Dependency Notes

- **Direct overlap**: this plan supersedes the Claude hook runtime direction in `plans/20260611-0922-port-opencode-to-claude-codex/phase-03-claude-workflow-assets.md` for `.claude/settings.json`, `.claude/hooks/hooks.json`, and `.claude/hooks/scripts/*`.
- **Dependency**: the older phase-01 decision gate remains upstream because this plan still relies on the approved migration stance already captured there.
- **Non-overlap**: this plan does not take ownership of `.claude/rules/*`, `.claude/commands/*`, `.claude/agents/*`, `.claude/skills/*`, any `.codex/**` files, or `.opencode/**` source files.
- **Operational rule**: the old Phase 03 should not be cooked for hook runtime work once this new plan is accepted.

## Workflow Mode

- Selected mode: `--hard`
- Reason: high blast radius on repo-wide AI workflow behavior, direct overlap with an unfinished plan, security-like blocked-dir enforcement, and known platform limits around prompt mutation parity.

## Data Flows

### Flow A: Blocked-directory guard

1. Claude emits a `PreToolUse` payload.
2. The hook runtime loads Claude-owned config from `.claude/**`.
3. The runtime normalizes path or command input.
4. The runtime compares inputs against blocked directory rules derived from the approved Claude config.
5. The runtime returns Claude hook JSON that either allows the tool or asks for confirmation.

### Flow B: Tool execution logging

1. Claude emits a `PostToolUse` payload.
2. The runtime extracts tool identity and minimal metadata.
3. The runtime emits safe logging output without blocking the underlying tool result.

### Flow C: Dynamic context parity

1. Claude emits `SessionStart` and optionally `UserPromptSubmit` payloads.
2. The runtime loads Claude-owned context values and any approved project rule references.
3. The runtime emits only behavior that Claude actually supports, while static long-lived guidance remains in `.claude/rules/*`.

## Non-1:1 Parity Areas To Lock Up Front

- OpenCode `session.created` toast has no guaranteed Claude hook equivalent and may need to be dropped or degraded.
- OpenCode throws hard errors for blocked access, while the approved Claude target is `warn + confirm` rather than hard deny.
- OpenCode injects text directly into system and first-user-message arrays; Claude can only achieve this behaviorally through static rules plus approved hook outputs.
- Claude runtime config will live in `.claude/**`, so config location parity is intentionally not 1:1 even if semantics are preserved.

## Backwards Compatibility Strategy

- Keep `.opencode/**` untouched so current OpenCode behavior remains available during rollout.
- Treat Claude hook work as additive until validation confirms parity is acceptable.
- Keep current `.claude/rules/*` as the stable instruction baseline; runtime hooks should only own approved parity gaps.
- Do not add a compatibility layer that reads `.opencode/x-force.config.json` at runtime.

## Rollback Strategy

- First rollback step: disable or simplify entries in `.claude/settings.json`.
- Second rollback step: revert `.cjs` hook scripts and shared runtime helpers.
- Third rollback step: revert Claude-owned config and hook documentation.
- `.opencode/**` remains untouched, so workflow fallback does not depend on reconstructing plugin behavior.

## Test Matrix

### Unit-level validation

- Claude-owned config parse validation
- Blocked-dir path normalization and bash pattern matching cases
- Hook stdin/stdout JSON contract validation for each active event

### Integration validation

- `.claude/settings.json` is the only active Claude project hook manifest
- No active runtime dependency remains on `.claude/hooks/hooks.json`
- `PreToolUse` returns confirmation behavior for blocked directory cases and does not silently widen access
- `PostToolUse` never blocks tool completion on logging failure
- Optional lifecycle hooks run only if approved by the parity contract

### End-to-end validation

- Re-run scenarios represented by `.opencode/plugins/x-force.ts`
- Confirm Vietnamese/junior/project-rule behavior still appears through Claude surfaces
- Confirm blocked paths `node_modules`, `vendor`, `.git`, `bootstrap/cache`, and `public/build` trigger the intended confirmation behavior
- Confirm no shell wrapper remains active under `.claude/hooks/scripts/`

## Risk Register

| Risk | Likelihood | Impact | Rating | Mitigation |
|---|---|---:|---|---|
| Claude cannot exactly mirror OpenCode prompt injection timing | High | High | High | Lock parity contract first and document lifecycle gaps before wiring hooks |
| Dual source of truth persists between `.claude/settings.json` and `.claude/hooks/hooks.json` | High | High | High | Make `.claude/settings.json` canonical and remove duplicate runtime manifest ownership |
| New `.cjs` runtime introduces path-matching regressions | Medium | High | High | Reuse semantics from the OpenCode implementation and validate each tool case explicitly |
| Claude-owned config drifts from OpenCode semantics unexpectedly | Medium | Medium | Medium | Copy only approved semantics into `.claude/**` and document differences explicitly |
| Dynamic lifecycle hooks duplicate static rule content | Medium | Medium | Medium | Require Phase 01 approval before adding lifecycle hooks |

## Dependency Graph

- `phase-01` blocks `phase-02`, `phase-03`, and `phase-04`
- `phase-02` blocks `phase-03` and `phase-04`
- `phase-03` blocks `phase-04`

## Phase Ownership Matrix

| Phase | Owns Files | Purpose |
|---|---|---|
| 01 | `docs/ai-tooling/claude-hook-port-matrix.md`, `docs/ai-tooling/claude-hook-parity-gaps.md` | Lock parity contract and runtime boundaries |
| 02 | `.claude/settings.json`, `.claude/x-force.config.json`, `.claude/hooks/README.md`, `.claude/hooks/hooks.json` | Establish Claude-only config source and canonical manifest cleanup |
| 03 | `.claude/hooks/config.cjs`, `.claude/hooks/lib/*.cjs`, `.claude/hooks/scripts/pre-tool-use.cjs`, `.claude/hooks/scripts/post-tool-use.cjs`, `.claude/hooks/scripts/*.sh` | Port core tool guard and logging runtime |
| 04 | `.claude/hooks/scripts/session-start.cjs`, `.claude/hooks/scripts/user-prompt-submit.cjs`, `docs/ai-tooling/claude-hook-validation-matrix.md`, `docs/ai-tooling/claude-hook-rollback.md` | Add approved lifecycle parity hooks and formal validation/rollback docs |

## Phases

- `phase-01-claude-hook-parity-contract.md`
- `phase-02-claude-hook-config-and-manifest.md`
- `phase-03-claude-hook-core-runtime.md`
- `phase-04-claude-hook-lifecycle-validation-and-rollback.md`

## Validation Log

### Standard Validation Checklist

1. **Dependencies** — Verified. Phase 01 defines parity boundaries, Phase 02 establishes canonical config and manifest ownership, Phase 03 ports the core tool runtime, and Phase 04 handles lifecycle parity plus validation artifacts.
2. **Scope Drift** — Controlled. This plan excludes `.claude/rules/*`, commands, agents, skills, plugin packaging, application code, database work, and Codex surfaces.
3. **Paths** — Verified against the current repo scan for all referenced source and target files.
4. **Measurability** — Each phase has explicit file ownership and observable success criteria.
5. **Assumptions** — Remaining assumptions are listed below and must stay visible until cooking starts.

### Inline Red-Team Checklist

1. **Blast Radius & Failure Mode** — Worst case is a broken Claude hook chain that either misses blocked-dir confirmations or duplicates hidden instruction context. Containment: `.opencode/**` remains intact, `.claude/settings.json` can be rolled back first, and lifecycle hooks are separated from the core tool runtime.
2. **Fragility** — Prompt and session parity are the most fragile surfaces because Claude lifecycle hooks are not identical to OpenCode system/message transforms.
3. **Rollback** — Roll back manifest wiring first, then runtime scripts, then config/docs. No rollback step depends on editing `.opencode/**`.
4. **Security Vectors** — Path normalization and bash matching remain the highest-risk areas because they guard access to blocked directories.
5. **Performance & Bottlenecks** — Runtime cost is low, but maintenance cost becomes high if static rules and dynamic hooks both own the same instruction text.

### Assumptions To Preserve

1. `.claude/settings.json` remains the only active Claude project hook manifest.
2. `.claude/hooks/hooks.json` is obsolete for runtime use in this repo because Claude plugin packaging is out of scope.
3. `node` is available anywhere Claude Code will execute repo-local hooks.
4. Existing `.claude/rules/*` remain the baseline persistent instruction source; runtime hooks add only approved parity behavior.
5. Claude runtime must not read `.opencode/x-force.config.json` directly; Claude gets its own checked-in config under `.claude/**`.

### Final Implementation Notes

- All four phases were implemented.
- Runtime validation passed after adding fail-safe confirmation for invalid config and conservative confirmation for dynamic bash commands.
- Final code review reported no remaining critical issues in the implemented Claude hook parity scope.

✅ Plan created: `plans/20260611-1520-claude-hook-commonjs-parity-port/plan.md`
   Phases: 4 phase(s)
   ⚠️ High-risk — please review the plan before proceeding.

👉 After review, implement with:
`/cook plans/20260611-1520-claude-hook-commonjs-parity-port/plan.md`
