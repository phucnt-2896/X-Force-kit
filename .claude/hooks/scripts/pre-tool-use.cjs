#!/usr/bin/env node

const { getRepoRoot, readConfig } = require("../config.cjs");
const { detectBlockedDir } = require("../lib/blocked-paths.cjs");
const { readJsonFromStdin, writeJson } = require("../lib/hook-io.cjs");
const { createLogger } = require("../lib/logger.cjs");

const eventPayload = readJsonFromStdin();
const repoRoot = getRepoRoot(eventPayload);
const logger = createLogger(repoRoot);
const config = readConfig(repoRoot, logger);

try {
  if (!config.__meta.valid) {
    logger.warn("Claude X-Force config is invalid; requiring confirmation", {
      configPath: config.__meta.configPath,
      error: config.__meta.error,
      tool: eventPayload.tool_name || eventPayload.toolName || "unknown",
    });

    writeJson({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "ask",
        permissionDecisionReason: "Claude hook config is invalid or unreadable. Confirm this tool run only if the access is intentional.",
      },
      systemMessage: "Claude hook config is invalid or unreadable. Confirm this tool run only if the access is intentional.",
    });
    process.exit(0);
  }

  const hit = detectBlockedDir(eventPayload, repoRoot, config.blockedDirs);

  if (hit) {
    logger.warn("Blocked Claude hook tool call", {
      tool: eventPayload.tool_name || eventPayload.toolName || "unknown",
      blockedDir: hit,
    });

    writeJson({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "ask",
        permissionDecisionReason: `This action touches blocked path '${hit}'. Confirm only if the access is intentional and necessary for repository tooling work.`,
      },
      systemMessage: `Warning: this action touches blocked path '${hit}'. Confirm only if the access is intentional and necessary for repository tooling work.`,
    });
  } else {
    writeJson({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "allow",
      },
    });
  }
} catch (error) {
  logger.error("Claude PreToolUse hook failed; allowing tool execution", {
    error: error instanceof Error ? error.message : String(error),
  });

  writeJson({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: "Claude hook validation failed unexpectedly. Confirm this tool run only if the access is intentional.",
    },
    systemMessage: "Claude hook validation failed unexpectedly. Confirm this tool run only if the access is intentional.",
  });
}
