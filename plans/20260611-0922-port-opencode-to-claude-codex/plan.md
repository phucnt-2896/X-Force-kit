---
title: "Port repo-local OpenCode setup to Claude Code and Codex CLI"
description: "Plan the migration of this repository's .opencode rules, skills, agents, and plugin behaviors into repo-local .claude and .codex surfaces."
status: in_progress
priority: P2
effort: "7 days"
tags: [planning, ai-tooling, claude-code, codex-cli, opencode-migration]
created: "2026-06-11"
blockedBy: []
blocks: []
---

# Plan: Port repo-local OpenCode setup to Claude Code and Codex CLI

## Context Inputs

- Existing OpenCode skill and plugin overview: `.opencode/README.md:7-124`
- Repo-local context config and blocked directory list: `.opencode/x-force.config.json:2-17`
- OpenCode plugin behavior to port/analyze: `.opencode/plugins/x-force.ts:35-141`
- Project context rule injected today: `.opencode/rules/project-context-rules.md:1-72`
- Front-end rule injected today: `.opencode/rules/front-end-development-rules.md:1-13`
- Back-end rule injected today: `.opencode/rules/back-end-development-rules.md:1-5`
- Verified OpenCode agents present: `.opencode/agents/planner.md`, `.opencode/agents/researcher.md`, `.opencode/agents/fullstack-developer.md`, `.opencode/agents/tester.md`, `.opencode/agents/project-manager.md`, `.opencode/agents/docs-manager.md`, `.opencode/agents/journal-writer.md`, `.opencode/agents/debugger.md`, `.opencode/agents/code-reviewer.md`, `.opencode/agents/brainstormer.md`
- Verified OpenCode skills present: `.opencode/skills/spec/SKILL.md`, `.opencode/skills/plan/SKILL.md`, `.opencode/skills/cook/SKILL.md`, `.opencode/skills/code-review/SKILL.md`, `.opencode/skills/debug/SKILL.md`, `.opencode/skills/fix/SKILL.md`, `.opencode/skills/scout/SKILL.md`, `.opencode/skills/journal/SKILL.md`, `.opencode/skills/watzup/SKILL.md`, `.opencode/skills/project-organization/SKILL.md`, `.opencode/skills/commit-message/SKILL.md`, `.opencode/skills/agent-browser/SKILL.md`, `.opencode/skills/inertia-react-development/SKILL.md`, `.opencode/skills/laravel-best-practices/SKILL.md`, `.opencode/skills/pest-testing/SKILL.md`, `.opencode/skills/tailwindcss-development/SKILL.md`, `.opencode/skills/fe-integration-docs/SKILL.md`, `.opencode/skills/brainstorm/SKILL.md`
- Verified repository state: no existing `plans/*/plan.md`, no repo-local `.claude/**`, no repo-local `.codex/**`, no repo-root `AGENTS.md`, and no `docs/development-rules.md`
- Current platform research source: Context7 docs for `/anthropics/claude-code` and `/openai/codex` queried on 2026-06-11 for rules, hooks, commands, agents, plugins, `AGENTS.md`, `config.toml`, and skill roots

## Context Summary

This repo currently centralizes AI workflow behavior inside `.opencode`, especially via three rule files configured in `.opencode/x-force.config.json:2-17` and runtime hook logic in `.opencode/plugins/x-force.ts:35-141`. The migration target is not just content copying; it is a platform translation problem because Claude Code and Codex CLI expose different instruction, hook, and skill surfaces.

Approved migration stance from user clarification: keep `.opencode/**` as the current supported surface while porting equivalent repo-local workflow assets into `.claude/**` and `.codex/**`. Preserve current agent and skill names. Prefer hook- and rules-based integration over root-level `CLAUDE.md`, root-level `AGENTS.md`, or Claude plugin packaging, because those surfaces are intentionally reserved for other repositories in the team's broader workflow.

Known platform mismatches already visible during planning:

- OpenCode session toast (`session.created`) in `.opencode/plugins/x-force.ts:49-53` likely has no meaningful 1:1 equivalent in Claude Code or Codex CLI and should probably be dropped.
- OpenCode blocks `read`, `glob`, `grep`, and `bash` against configured directories in `.opencode/plugins/x-force.ts:55-91`; the approved first-pass target is `warn + confirm`, not hard deny, so parity here is intentionally relaxed and must be documented.
- OpenCode injects both system context and first-user-message context in `.opencode/plugins/x-force.ts:96-141`; Claude and Codex must represent this without using root-level `CLAUDE.md` or `AGENTS.md`, which means `.claude/rules/**`, `.codex/config.toml`, hooks, and repo-local docs become the primary carriers.
- OpenCode agent and skill names must be preserved; only metadata enrichment is allowed where the target platform benefits from descriptions or display text.
- `docs/development-rules.md` does not exist, so any migration design that assumes an external consolidated rules document would be speculative.

Out of scope for this plan:

- Application runtime code changes outside AI-tooling surfaces
- DB/schema work
- CI/CD automation beyond what is required to validate the migrated AI-tooling behavior

## Assumptions to Validate Before Cooking

1. The user wants repo-local configuration checked into git for both platforms, not only user-home configuration.
2. `.opencode/**` remains in place alongside `.claude/**` and `.codex/**` rather than being deprecated by this plan.
3. Root-level `CLAUDE.md`, root-level `AGENTS.md`, and `.claude-plugin/plugin.json` are intentionally out of scope for this migration.
4. It is acceptable to introduce migration/mapping docs under `docs/ai-tooling/` to record cross-platform behavior decisions.

## Dependency Graph

- `phase-01` blocks `phase-02`, `phase-03`, `phase-03b`, `phase-04`, `phase-05`
- `phase-02` blocks `phase-03` and `phase-03b` because Claude workflow assets must follow the approved instruction/rules design
- `phase-04` blocks `phase-05` because Codex skill packaging must follow the approved `.codex/config.toml` and `.codex/rules/*` design
- `phase-06` depends on `phase-02`, `phase-03`, `phase-03b`, `phase-04`, `phase-05`

## Phase Ownership Matrix

| Phase | Owns Files | Notes |
|---|---|---|
| 01 | `docs/ai-tooling/opencode-port-matrix.md`, `docs/ai-tooling/parity-decisions.md` | Design-only gate; no runtime config |
| 02 | `.claude/rules/*.md` | Claude persistent instruction layer without `CLAUDE.md` |
| 03 | `.claude/settings.json`, `.claude/hooks/hooks.json`, `.claude/hooks/scripts/*`, `.claude/commands/*`, `.claude/agents/*` | Claude execution surface without plugin packaging |
| 03b | `.claude/skills/*` | Claude skill surface split out to keep phases within file-count limits |
| 04 | `.codex/config.toml`, `.codex/hooks/*`, `.codex/rules/*` | Codex instruction/config/hook layer without `AGENTS.md` |
| 05 | `.codex/skills/*`, `docs/ai-tooling/codex-agent-skill-mapping.md` | Codex reusable workflow layer |
| 06 | `docs/ai-tooling/parity-test-matrix.md`, `docs/ai-tooling/rollout-and-rollback.md`, optional validation helper scripts under `scripts/ai-tooling/*` | Validation and release safety |

## Test Matrix

### Unit-like validation

- Hook config schema validation for Claude and Codex manifests/config files
- Script-level validation for blocked-directory matcher behavior
- Static lint/parse validation for TOML, JSON, and Markdown frontmatter

### Integration validation

- New Claude session loads `.claude/rules/*` as intended without relying on `CLAUDE.md`
- Claude hook flow covers pre-tool blocking and post-tool logging equivalents
- Codex session loads `.codex/config.toml` instructions, uses repo-local rules docs as the source for injected wording, and discovers repo skills
- Plugin/command/agent definitions resolve from repo-local paths

### End-to-end validation

- Run the same prompt scenarios that currently rely on OpenCode injection:
  - “Think Before Coding” prompt priming
  - Legacy project rule visibility
  - Blocked-dir warning / confirmation flow
  - Skill discoverability for FE/BE/test workflows
  - Logging / operator visibility after tool use

### Manual review checklist

- Compare resulting model behavior against current OpenCode behavior for the same prompts
- Confirm no blocked directory can be accessed through a missed tool path
- Confirm no generated instruction duplicates conflict across Claude and Codex

## Backwards Compatibility Strategy

- Keep `.opencode/**` intact during the first rollout so the existing workflow remains the source of truth until parity is proven.
- Add `.claude/**` and `.codex/**` in parallel rather than replacing `.opencode/**` immediately.
- Document unsupported parity items explicitly instead of silently approximating them.
- Only consider deprecating `.opencode/**` in a later, separate plan after real-world validation.

## Rollback Strategy

- If Claude migration is wrong, revert only `.claude/**`; leave Codex and `.opencode/**` untouched.
- If Codex migration is wrong, revert only `.codex/**`; leave Claude and `.opencode/**` untouched.
- If blocked-dir enforcement causes noisy prompts or false positives, downgrade or disable hook references first before deleting instructional docs.
- If parity docs become inaccurate, revert docs independently; they must not be coupled to runtime behavior files.

## Risk Register

| Risk | Likelihood | Impact | Rating | Mitigation |
|---|---|---:|---|---|
| Exact parity is impossible for some OpenCode plugin behaviors | High | High | High | Force an early decision gate in phase 01 and document accepted deviations |
| Hook enforcement semantics differ between Claude and Codex | High | High | High | Implement platform-specific `warn + confirm` behavior; avoid shared assumptions |
| Preserving every current skill and agent name may create a larger migration surface | Medium | High | High | Keep names stable but limit changes to metadata and platform packaging, not role redesign |
| Missing `docs/development-rules.md` hides expected conventions | Medium | Medium | Medium | Treat as explicit gap; do not invent contents; request user clarification if needed |
| Duplicate or conflicting instructions across rules surfaces | Medium | High | High | Keep source mapping matrix authoritative; run parity prompts before rollout |

## Phases

- `phase-01-mapping-and-decision-gate.md`
- `phase-02-claude-instructions-and-rules.md`
- `phase-03-claude-workflow-assets.md`
- `phase-03b-claude-skills.md`
- `phase-04-codex-instructions-and-hooks.md`
- `phase-05-codex-skills-and-agent-mapping.md`
- `phase-06-validation-rollout-and-rollback.md`

## Validation Log

### Standard Validation Checklist

1. **Dependencies** — Verified. Phase 01 is the design gate. Phase 06 is terminal validation. Intermediate phases have explicit blockers.
2. **Scope Drift** — Controlled. Plan excludes application feature work, DB changes, speculative `docs/development-rules.md` content, and root-level `CLAUDE.md` / `AGENTS.md` adoption.
3. **Paths** — Verified current source paths from repo scan. Target paths are proposed new files and are grouped to avoid cross-phase ownership overlap.
4. **Measurability** — Each phase defines observable files and parity checks, not subjective “looks good” criteria.
5. **Assumptions** — Remaining assumptions are listed above, and the user-approved constraints are captured in the locked decisions below.

### Inline Red-Team Checklist

1. **Blast Radius & Failure Mode** — Worst case is broken or conflicting AI instructions that cause unsafe tool access or misleading implementation behavior across both Claude and Codex. Containment: parallel rollout, per-platform rollback, `.opencode/**` retained.
2. **Fragility** — The most fragile assumption is that OpenCode message injection can be represented cleanly by static instruction files in both target platforms.
3. **Rollback** — Roll back by platform surface, starting with hook/config disablement before content removal.
4. **Security Vectors** — Main vector is blocked-directory enforcement drift, causing either accidental access or overblocking. Hooks must be explicitly tested.
5. **Performance & Bottlenecks** — Low runtime app risk, but high maintenance risk if too many duplicated commands/skills/agents are created.

## Locked Decisions

1. Migration interpretation resolved: preserve workflow behavior where practical, but document deviations where the target platform cannot support 1:1 parity cleanly.
2. `.opencode/**` stays supported in parallel with `.claude/**` and `.codex/**`.
3. Claude plugin packaging is intentionally excluded from the first pass; prefer hooks, rules, commands, agents, and skills under `.claude/**` only.
4. Codex blocked-directory enforcement should use `warn + confirm` rather than hard deny.
5. OpenCode agent and skill names must be preserved; only metadata enrichment is allowed.
6. No additional convention document is expected besides the already-missing `docs/development-rules.md`.

✅ Plan created: `plans/20260611-0922-port-opencode-to-claude-codex/plan.md`
   Phases: 7 phase(s)
   ⚠️ High-risk — please review the plan before proceeding.

👉 After review, implement with:
`/cook plans/20260611-0922-port-opencode-to-claude-codex/plan.md`
