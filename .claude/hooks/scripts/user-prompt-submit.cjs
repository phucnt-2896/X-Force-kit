#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { buildUserPromptContext, getRepoRoot, readConfig } = require("../config.cjs");
const { readJsonFromStdin, writeJson } = require("../lib/hook-io.cjs");
const { createLogger } = require("../lib/logger.cjs");

const eventPayload = readJsonFromStdin();
const repoRoot = getRepoRoot(eventPayload);
const logger = createLogger(repoRoot);
const config = readConfig(repoRoot, logger);

try {
  const promptText = extractPromptText(eventPayload);
  if (promptText.includes("EXTREMELY_IMPORTANT")) {
    writeJson({ continue: true, suppressOutput: true });
    process.exit(0);
  }

  const sessionKey = resolveSessionKey(eventPayload);
  if (hasInjectedPrompt(repoRoot, sessionKey)) {
    writeJson({ continue: true, suppressOutput: true });
    process.exit(0);
  }

  const contextBlock = buildUserPromptContext(config, repoRoot, logger);
  markPromptInjected(repoRoot, sessionKey);

  logger.info("Injected Claude UserPromptSubmit context", { sessionKey });
  writeJson({
    continue: true,
    suppressOutput: true,
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: contextBlock,
    },
    // systemMessage: contextBlock,
  });
} catch (error) {
  logger.error("Failed to inject Claude UserPromptSubmit context", {
    error: error instanceof Error ? error.message : String(error),
  });

  writeJson({ continue: true, suppressOutput: true });
}

function extractPromptText(payload) {
  const candidates = [
    payload.prompt,
    payload.user_prompt,
    payload.userPrompt,
    payload.text,
  ];

  for (const value of candidates) {
    if (typeof value === "string") {
      return value;
    }
  }

  return "";
}

function resolveSessionKey(payload) {
  const candidates = [
    payload.session_id,
    payload.sessionId,
    payload.conversation_id,
    payload.conversationId,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return sanitizeKey(value);
    }
  }

  return "default-session";
}

function sanitizeKey(value) {
  return value.replace(/[^A-Za-z0-9._-]/g, "_");
}

function getStatePath(repoRoot, sessionKey) {
  return path.resolve(repoRoot, ".claude", "tmp", "state", `${sessionKey}.json`);
}

function hasInjectedPrompt(repoRoot, sessionKey) {
  const statePath = getStatePath(repoRoot, sessionKey);

  try {
    const raw = fs.readFileSync(statePath, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed && parsed.promptInjected === true;
  } catch {
    return false;
  }
}

function markPromptInjected(repoRoot, sessionKey) {
  const statePath = getStatePath(repoRoot, sessionKey);
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify({ promptInjected: true }), "utf-8");
}
