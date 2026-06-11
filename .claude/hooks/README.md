# Claude Hook Runtime

This directory contains the repo-local Claude hook runtime for the X-Force parity port.

## Canonical Sources

- Active hook manifest: `.claude/settings.json`
- Claude-owned hook config: `.claude/x-force.config.json`
- Runtime entrypoints: `.claude/hooks/scripts/*.cjs`
- Shared runtime helpers: `.claude/hooks/lib/*.cjs`
- Path anchor: `${CLAUDE_PROJECT_DIR}` when Claude provides it, otherwise the current repo root

## Non-Goals

- `.claude/hooks/hooks.json` is intentionally not used. That surface belongs to Claude plugin packaging, which is out of scope for this repo.
- The Claude runtime does not read `.opencode/x-force.config.json` at runtime.

## Runtime Ownership

- `SessionStart` injects dynamic system context as closely as Claude allows.
- `UserPromptSubmit` adds the first-prompt guidance behaviorally, but it cannot rewrite prompt text byte-for-byte the way OpenCode mutates the first user message.
- `PreToolUse` implements blocked-directory confirmation behavior.
- `PreToolUse` fails safe: if config is invalid or a bash command is dynamically constructed, the hook asks for confirmation instead of silently allowing access.
- `PostToolUse` writes lightweight operational logs.

## Logging

- Hook logs are written under `.claude/tmp/logs/`.
- Failures should degrade safely and avoid blocking the user's workflow unless the hook is explicitly making a permission decision.
