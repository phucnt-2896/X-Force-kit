#!/usr/bin/env node

const { getRepoRoot } = require("../config.cjs");
const { readJsonFromStdin, writeJson } = require("../lib/hook-io.cjs");
const { createLogger } = require("../lib/logger.cjs");

const eventPayload = readJsonFromStdin();
const repoRoot = getRepoRoot(eventPayload);
const logger = createLogger(repoRoot);

try {
  logger.info("Tool executed", {
    tool: eventPayload.tool_name || eventPayload.toolName || "unknown",
    outputTitle:
      eventPayload.tool_output?.title ||
      eventPayload.output?.title ||
      eventPayload.title ||
      "",
  });
} catch (error) {
  logger.error("Claude PostToolUse hook failed", {
    error: error instanceof Error ? error.message : String(error),
  });
}

writeJson({});
