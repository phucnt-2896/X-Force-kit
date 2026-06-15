---
title: "Restructure Claude hooks for config-driven CommonJS port"
description: "Recommendation for porting .opencode/plugins/x-force.ts into .claude/hooks with config-driven behavior and Node .cjs scripts."
status: pending
priority: P1
effort: "0.5 day"
tags: [planning, ai-tooling, claude-code, hooks, commonjs]
created: "2026-06-11"
blockedBy: ["plans/20260611-0922-port-opencode-to-claude-codex/phase-01-mapping-and-decision-gate.md"]
blocks: []
---

# Plan: Restructure Claude hooks for config-driven CommonJS port

## Context Inputs

- OpenCode plugin behavior: `.opencode/plugins/x-force.ts`
- OpenCode config source: `.opencode/x-force.config.json`
- Existing Claude hook config: `.claude/settings.json`, `.claude/hooks/hooks.json`
- Existing Claude scripts: `.claude/hooks/scripts/warn-blocked-dir-access.sh`, `.claude/hooks/scripts/post-tool-log.sh`
- Existing migration plan: `plans/20260611-0922-port-opencode-to-claude-codex/phase-03-claude-workflow-assets.md`
- Parity decisions: `docs/ai-tooling/parity-decisions.md`
- Port matrix: `docs/ai-tooling/opencode-port-matrix.md`
- Claude Code official docs: hooks reference and settings reference (project hooks belong in `.claude/settings.json`; `hooks/hooks.json` is plugin-oriented)

## Context Summary

Current `.claude` duplicates hook declarations in both `.claude/settings.json` and `.claude/hooks/hooks.json`, while the scripts are shell+Python wrappers and only cover blocked-dir warning plus post-tool logging. That shape is workable short-term, but it is not the cleanest port target for `.opencode/plugins/x-force.ts` because the original plugin is config-driven and centered on reusable logic. Claude Code also treats `.claude/settings.json` as the project hook source, while `hooks/hooks.json` is the plugin source.

## Recommendation

Use one checked-in project settings file as the canonical hook manifest, and move hook behavior into small Node CommonJS entrypoints under `.claude/hooks/scripts/`. Keep rule files, commands, agents, and skills untouched. Add one repo-local hook config module that translates the current `.opencode/x-force.config.json` shape into Claude hook runtime needs.

## Recommended File Layout

```text
.claude/
├── settings.json                         # canonical Claude project config, owns hooks
├── hooks/
│   ├── config.cjs                       # loads/normalizes repo hook config
│   ├── lib/
│   │   ├── context-loader.cjs           # responseLanguage, codingLevel, project rules, branch helpers if needed later
│   │   ├── blocked-paths.cjs            # path and bash matching logic
│   │   ├── hook-io.cjs                  # stdin JSON parsing + safe JSON responses
│   │   └── logger.cjs                   # file logger for hook scripts
│   ├── scripts/
│   │   ├── pre-tool-use.cjs             # warn + confirm for blocked dirs
│   │   ├── post-tool-use.cjs            # lightweight logging
│   │   ├── user-prompt-submit.cjs       # optional, only if prompt mutation is reintroduced
│   │   └── session-start.cjs            # optional, only if runtime branch/session context is needed
│   └── README.md                        # contract: what is canonical, what is optional
└── rules/
    ├── core-workflow.md
    ├── response-style.md
    ├── project-context.md
    ├── front-end-development.md
    └── back-end-development.md
```

## Replace vs Keep

### Replace

- `.claude/settings.json` → replace contents so it becomes the single canonical hook declaration surface, with explicit `hooks` key and Node script paths.
- `.claude/hooks/scripts/warn-blocked-dir-access.sh` → replace with `pre-tool-use.cjs`.
- `.claude/hooks/scripts/post-tool-log.sh` → replace with `post-tool-use.cjs`.
- `.claude/hooks/hooks.json` → remove from runtime path; keep only if you intentionally package a Claude plugin later.

### Keep

- `.claude/rules/*.md` → keep. They are the right stable replacement for prompt injection content.
- `.claude/commands/*.md` → keep.
- `.claude/agents/*.md` → keep.
- `.claude/skills/*` → keep.

## Canonical Config Decision

Canonical file should be **`.claude/settings.json` only** for project hooks.

Do **not** keep both `.claude/settings.json` and `.claude/hooks/hooks.json` as active sources for the same hooks.

Reason:

1. Official Claude docs place project hooks in `.claude/settings.json`.
2. `hooks/hooks.json` is a plugin packaging surface, and this repo already decided not to use Claude plugin packaging first pass.
3. Duplicating both creates drift risk immediately; current repo already has identical duplication.

If maintainers want readability, keep comments/explanation in `.claude/hooks/README.md`, not a second active JSON manifest.

## Minimum Viable Phase Split

This should supersede the current Claude hook part of `phase-03-claude-workflow-assets.md` with **3 phases only**:

1. **Phase A — Canonical config + runtime boundaries**
   - Lock `.claude/settings.json` as sole hook manifest
   - Define config contract for `.claude/hooks/config.cjs`
   - Remove dual-manifest design

2. **Phase B — Hook runtime port**
   - Port blocked-dir matching and post-tool logging from shell/Python to Node `.cjs`
   - Reuse config loader and shared helpers
   - Preserve approved `warn + confirm` behavior

3. **Phase C — Optional dynamic context hooks**
   - Decide whether `UserPromptSubmit` or `SessionStart` is actually needed
   - Default: skip unless static `.claude/rules/*.md` is proven insufficient

## Trade-off Matrix

| Option | Performance | Complexity | Maintenance | Risk | Fit |
|---|---|---:|---:|---:|---|
| Keep shell scripts + duplicate JSON manifests | Good | Low | Poor | High drift | Weak |
| Single settings manifest + Node `.cjs` scripts | Good enough | Medium | Best | Medium | Best |
| Claude plugin packaging + `hooks/hooks.json` | Good | High | Medium | Higher adoption risk | Bad first-pass fit |

## Adoption Risk

- **Low** for moving to `.claude/settings.json` canonical: matches official Claude project settings model.
- **Medium** for Node `.cjs` scripts: requires `node` available wherever Claude Code runs, but this repo already uses Node tooling.
- **Low** for keeping prompt mutation optional: aligns with current parity decision to prefer checked-in rules over hidden injection.

## Architectural Fit

- Fits current repo rule: no Claude plugin packaging first pass.
- Fits current parity decision: `warn + confirm`, not hard deny.
- Fits maintainability need: config-driven logic closer to `.opencode/plugins/x-force.ts` than ad-hoc shell wrappers.
- Avoids over-porting: only blocked-dir and logging need runtime hooks today; message/system injection should stay static unless proven insufficient.

## What This Supersedes

- Supersedes the hook-implementation portion of `plans/20260611-0922-port-opencode-to-claude-codex/phase-03-claude-workflow-assets.md`.
- Does **not** supersede `.claude/rules`, commands, agents, or skills work.

## Unresolved Questions

1. Should `.claude/hooks/config.cjs` read directly from `.opencode/x-force.config.json` during transition, or should Claude get its own config file immediately?
2. Do you want file logging kept at all, or is Claude `systemMessage` output enough?
3. Is dynamic git-branch/session context still required, or are checked-in rules sufficient for this repo?
