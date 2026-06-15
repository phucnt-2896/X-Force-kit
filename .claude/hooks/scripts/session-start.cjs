#!/usr/bin/env node

const { buildSystemContext, getRepoRoot, readConfig } = require("../config.cjs");
const { readJsonFromStdin, writeJson } = require("../lib/hook-io.cjs");
const { createLogger } = require("../lib/logger.cjs");

const eventPayload = readJsonFromStdin();
const repoRoot = getRepoRoot(eventPayload);
const logger = createLogger(repoRoot);
const config = readConfig(repoRoot, logger);

try {
  const additionalContext = buildSystemContext(config, repoRoot, logger);
  logger.info("Injected Claude SessionStart context", { additionalContext });
  if (additionalContext) {
    logger.info("Injected Claude SessionStart context", { repoRoot });
    writeJson({
      continue: true,
      suppressOutput: true,
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        additionalContext,
      },
    });
  } else {
    writeJson({ continue: true, suppressOutput: true });
  }
} catch (error) {
  logger.error("Failed to inject Claude SessionStart context", {
    error: error instanceof Error ? error.message : String(error),
  });

  writeJson({ continue: true, suppressOutput: true });
}
