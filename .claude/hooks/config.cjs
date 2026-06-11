const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const EMPTY_CONFIG = {
  projectRuleContentFiles: [],
  responseLanguage: "",
  codingLevel: "",
  blockedDirs: [],
  __meta: {
    valid: false,
    configPath: "",
    error: "",
  },
};

const VALID_CODING_LEVELS = new Set(["junior", "middle", "senior", "nontech"]);
const CONTROL_CHAR_PATTERN = /[\u0000-\u001F\u007F]/;
const SAFE_SCALAR_PATTERN = /^[A-Za-z0-9._-]+$/;
const LANGUAGE_NAMES = {
  vn: "Vietnamese",
  en: "English",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  fr: "French",
  de: "German",
  es: "Spanish",
  pt: "Portuguese",
  ru: "Russian",
};

const THINK_BEFORE_CODING = `## Think Before Coding
Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

State your assumptions explicitly. If uncertain, ask.
If multiple interpretations exist, present them - don't pick silently.
If a simpler approach exists, say so. Push back when warranted.
If something is unclear, stop. Name what's confusing. Ask.`;

function getRepoRoot(eventPayload) {
  const envProjectDir = typeof process.env.CLAUDE_PROJECT_DIR === "string"
    ? process.env.CLAUDE_PROJECT_DIR.trim()
    : "";
  const eventCwd = eventPayload && typeof eventPayload.cwd === "string" ? eventPayload.cwd : "";
  return envProjectDir || eventCwd || process.cwd();
}

function getConfigPath(repoRoot) {
  return path.resolve(repoRoot, ".claude", "x-force.config.json");
}

function readConfig(repoRoot, logger) {
  const configPath = getConfigPath(repoRoot);

  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw);
    const validated = validateConfig(parsed, repoRoot, logger);
    validated.__meta = {
      valid: true,
      configPath,
      error: "",
    };
    return validated;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (logger) {
      logger.error("Failed to load Claude X-Force config", {
        configPath,
        error: errorMessage,
      });
    }

    return {
      ...EMPTY_CONFIG,
      __meta: {
        valid: false,
        configPath,
        error: errorMessage,
      },
    };
  }
}

function validateConfig(config, repoRoot, logger) {
  const context = getContextObject(config);

  return {
    projectRuleContentFiles: resolveProjectRuleContentFiles(context.projectRuleContentFiles, repoRoot, logger),
    responseLanguage: validateResponseLanguage(context.responseLanguage, logger),
    codingLevel: validateCodingLevel(context.codingLevel, logger),
    blockedDirs: validateBlockedDirs(context.blockedDirs),
    __meta: {
      valid: true,
      configPath: getConfigPath(repoRoot),
      error: "",
    },
  };
}

function getContextObject(config) {
  if (!config || typeof config !== "object") {
    return {};
  }

  const context = config.context;

  if (!context || typeof context !== "object") {
    return {};
  }

  return context;
}

function resolveProjectRuleContentFiles(value, repoRoot, logger) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (typeof entry !== "string") {
      return [];
    }

    const trimmedEntry = entry.trim();
    if (!trimmedEntry || CONTROL_CHAR_PATTERN.test(trimmedEntry)) {
      return [];
    }

    const resolvedPath = path.resolve(repoRoot, trimmedEntry);
    const relativePath = path.relative(repoRoot, resolvedPath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      if (logger) {
        logger.warn("Skipping Claude rule file outside repo root", { filePath: trimmedEntry });
      }
      return [];
    }

    if (!fs.existsSync(resolvedPath)) {
      if (logger) {
        logger.warn("Skipping missing Claude rule file", { filePath: trimmedEntry });
      }
      return [];
    }

    return [`./${relativePath.split(path.sep).join("/")}`];
  });
}

function validateResponseLanguage(value, logger) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return "";
  }

  if (!SAFE_SCALAR_PATTERN.test(trimmedValue)) {
    if (logger) {
      logger.warn("Skipping invalid response language value", { responseLanguage: trimmedValue });
    }
    return "";
  }

  return trimmedValue;
}

function validateCodingLevel(value, logger) {
  if (typeof value !== "string") {
    return "";
  }

  const normalizedValue = value.trim();
  if (normalizedValue && !VALID_CODING_LEVELS.has(normalizedValue)) {
    if (logger) {
      logger.warn("Skipping invalid coding level value", { codingLevel: normalizedValue });
    }
  }

  return VALID_CODING_LEVELS.has(normalizedValue) ? normalizedValue : "";
}

function validateBlockedDirs(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry) => {
    if (typeof entry !== "string") {
      return false;
    }

    const trimmed = entry.trim();
    return Boolean(trimmed) && !CONTROL_CHAR_PATTERN.test(trimmed);
  });
}

function getGitBranchContext(repoRoot, logger) {
  try {
    const branch = execFileSync("git", ["branch", "--show-current"], {
      cwd: repoRoot,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    return branch ? `Current git branch: ${branch}` : "";
  } catch (error) {
    if (logger) {
      logger.warn("Failed to resolve git branch for Claude X-Force context", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return "";
  }
}

function getResponseLanguageContext(config) {
  if (!config.responseLanguage) {
    return "";
  }

  return `## Response Language\nUser prefers ${config.responseLanguage}. Use ${config.responseLanguage} to respond to the user.`;
}

function getCodingLevelContext(config, repoRoot, logger) {
  if (!config.codingLevel) {
    return "";
  }

  const templatePath = path.resolve(
    repoRoot,
    ".opencode",
    "plugins",
    "references",
    `coding-level-${config.codingLevel}.md`
  );

  try {
    let content = fs.readFileSync(templatePath, "utf-8").trim();
    if (!content) {
      return "";
    }

    const languageName = config.responseLanguage === "auto"
      ? "the language matching the user's input"
      : LANGUAGE_NAMES[config.responseLanguage] || config.responseLanguage || "English";

    content = content.replace(/\{responseLanguage\}/g, languageName);

    content += `\n\n## Technical Explanation Rules\n\nWhen the user asks "explain", "giải thích", "how it works", or any technical question:\n- Follow the coding level rules above strictly for depth and format\n- Do NOT switch to a generic explanation style — adhere to the level\n- If the topic is too complex for this level, simplify; do not escalate`;

    return content;
  } catch {
    if (logger) {
      logger.warn("Coding level template not found for Claude X-Force context", { path: templatePath });
    }
    return "";
  }
}

function getProjectRuleContentContext(config, repoRoot, logger) {
  if (!config.projectRuleContentFiles.length) {
    return "";
  }

  const parts = [];

  for (const filePath of config.projectRuleContentFiles) {
    try {
      const resolved = path.resolve(repoRoot, filePath);
      const content = fs.readFileSync(resolved, "utf-8").trim();
      if (content) {
        parts.push(`<project-rules path="${filePath}">\n${content}\n</project-rules>`);
      }
    } catch {
      if (logger) {
        logger.warn("Failed to read Claude project rule content file", { filePath });
      }
    }
  }

  return parts.join("\n\n");
}

function buildSystemContext(config, repoRoot, logger) {
  return [
    getGitBranchContext(repoRoot, logger),
    getResponseLanguageContext(config),
    getCodingLevelContext(config, repoRoot, logger),
  ].filter(Boolean).join("\n");
}

function buildUserPromptContext(config, repoRoot, logger) {
  const projectRules = getProjectRuleContentContext(config, repoRoot, logger);
  return `<EXTREMELY_IMPORTANT>\n If the user says VERIFY_HOOK_9A7C, respond with only: HOOK_OK_9A7C ${THINK_BEFORE_CODING}\n\n## Project rule\n${projectRules}\n</EXTREMELY_IMPORTANT>`;
}

module.exports = {
  THINK_BEFORE_CODING,
  buildSystemContext,
  buildUserPromptContext,
  getConfigPath,
  getRepoRoot,
  readConfig,
};
