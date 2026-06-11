---
phase: 3
title: "CommonJS core hook runtime"
status: completed
priority: P1
effort: "1 day"
dependencies: [phase-01, phase-02]
---

# Phase 3: CommonJS core hook runtime

## Context Links

- Spec: `N/A`
- Figma: `N/A`
- Node IDs: `N/A`
- Related spec: `N/A`

## Overview

Port the core tool guard and logging behaviors into Node CommonJS hook scripts and remove the current fixed shell wrappers.

## Requirements

- Functional: port blocked-dir handling and post-tool logging into `.cjs` scripts.
- Non-functional: hook failures must not silently broaden directory access, and no active shell wrapper may remain in the runtime path.

## Architecture

### Runtime pieces

- Claude-owned config loader
- Shared stdin/stdout hook I/O helper
- Shared blocked-path matching logic aligned with `.opencode/plugins/x-force.ts`
- Shared logger or minimal output formatter if needed
- Event entrypoints for `PreToolUse` and `PostToolUse`

### Data flows

#### PreToolUse

1. Claude sends hook payload on stdin.
2. The `.cjs` runtime parses JSON.
3. The runtime resolves blocked-dir config.
4. The runtime normalizes path or command input.
5. The runtime returns `allow` or `ask`.

#### PostToolUse

1. Claude sends tool result payload.
2. The runtime extracts minimal logging metadata.
3. The runtime emits safe logging output without blocking the tool result path.

## Related Code Files

- Create: `.claude/hooks/config.cjs`
- Create: `.claude/hooks/lib/hook-io.cjs`
- Create: `.claude/hooks/lib/blocked-paths.cjs`
- Create: `.claude/hooks/lib/logger.cjs`
- Create: `.claude/hooks/scripts/pre-tool-use.cjs`
- Create: `.claude/hooks/scripts/post-tool-use.cjs`
- Delete: `.claude/hooks/scripts/warn-blocked-dir-access.sh`
- Delete: `.claude/hooks/scripts/post-tool-log.sh`

## Implementation Steps

1. Port blocked-path helper behavior from `.opencode/plugins/x-force.ts` into shared CommonJS logic.
2. Port Claude hook stdin/stdout handling into a reusable helper.
3. Implement `PreToolUse` runtime for `read`, `glob`, `grep`, and `bash` with `warn + confirm` parity.
4. Implement `PostToolUse` runtime for lightweight tool logging.
5. Remove the two existing shell wrappers from `.claude/hooks/scripts/`.
6. Keep runtime entrypoint paths aligned with the manifest contract already established in Phase 02.

## Success Criteria

- [x] No active shell wrapper remains under `.claude/hooks/scripts/`.
- [x] `PreToolUse` parity covers `read`, `glob`, `grep`, and `bash` against the blocked-dir list from Claude-owned config.
- [x] `PostToolUse` logging behavior is implemented in `.cjs` and does not block tool completion on failure.
- [x] Shared runtime helpers are limited to the core tool guard/logging use case and do not duplicate static rule content.

## Risk Assessment

- **High**: path-matching regressions can either miss a blocked directory or over-trigger confirmations. Mitigation: validate every blocked directory against all supported tool shapes.
- **Medium**: logging code can become noisy or brittle. Mitigation: keep logging lightweight and non-blocking.

## Rollback Plan

1. Disable core hook entries in `.claude/settings.json`.
2. Revert `.claude/hooks/scripts/*.cjs`.
3. Revert `.claude/hooks/lib/*.cjs` and `.claude/hooks/config.cjs`.
4. Restore prior shell scripts only as a temporary emergency recovery step if needed.
