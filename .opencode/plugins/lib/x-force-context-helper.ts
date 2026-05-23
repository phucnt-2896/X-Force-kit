import * as fs from "fs";
import * as path from "path";
import { execFileSync } from "child_process";

type CodingLevel = "junior" | "middle" | "senior" | "nontech";
type ContextKey = "gitBranch" | "projectRuleContentFiles" | "responseLanguage" | "codingLevel";

type XForceContextConfig = {
  projectRuleContentFiles: string[];
  responseLanguage: string;
  codingLevel: CodingLevel | "";
  blockedDirs: string[];
};

type Logger = {
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
};

const LANGUAGE_NAMES: Record<string, string> = {
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

const VALID_CODING_LEVELS = new Set<CodingLevel>(["junior", "middle", "senior", "nontech"]);
const EMPTY_CONFIG: XForceContextConfig = {
  projectRuleContentFiles: [],
  responseLanguage: "",
  codingLevel: "",
  blockedDirs: [],
};
const CONTROL_CHAR_PATTERN = /[\u0000-\u001F\u007F]/;
const SAFE_SCALAR_PATTERN = /^[A-Za-z0-9._-]+$/;

export class XForceContextHelper {
  private readonly configPath: string;
  private cacheKey = "";
  private cachedConfig: XForceContextConfig = EMPTY_CONFIG;

  constructor(
    private readonly baseDir: string,
    private readonly log: Logger,
  ) {
    this.configPath = path.resolve(baseDir, ".opencode", "x-force.config.json");
  }

  getGitBranchContext(): string {
    const branch = this.runGitBranchCommand();

    return branch ? `Current git branch: ${branch}` : "";
  }

  getProjectRuleContentContext(): string {
    const files = this.readConfig().projectRuleContentFiles;
    if (!files.length) return "";

    const parts: string[] = [];
    for (const filePath of files) {
      try {
        const resolved = path.resolve(this.baseDir, filePath);
        const content = fs.readFileSync(resolved, "utf-8").trim();
        if (content) {
          parts.push(`<project-rules path="${filePath}">\n${content}\n</project-rules>`);
        }
      } catch {
        this.log.warn("Failed to read project rule content file", { filePath });
      }
    }
    return parts.join("\n\n");
  }

  getResponseLanguageContext(): string {
    const responseLanguage = this.readConfig().responseLanguage;

    if ((responseLanguage && responseLanguage == "auto") && !responseLanguage) {
      // auto langue mode 
      return `## Response Language
      User prefers responses in the same language as their input. You MUST respond in the language used by the user.`;
    }

    return responseLanguage ? `
    ## Response Language
    User prefers ${responseLanguage}. Use ${responseLanguage} to respond to the user.` : "";
  }

  getCodingLevelContext(): string {
    const codingLevel = this.readConfig().codingLevel;
    if (!codingLevel) return "";

    const templatePath = path.resolve(
      this.baseDir,
      ".opencode", "plugins", "references",
      `coding-level-${codingLevel}.md`
    );

    try {
      let content = fs.readFileSync(templatePath, "utf-8").trim();
      if (!content) return "";

      const responseLanguage = this.readConfig().responseLanguage;
      const languageName = responseLanguage === "auto"
        ? "the language matching the user's input"
        : LANGUAGE_NAMES[responseLanguage] || responseLanguage || "English";

      content = content.replace(/\{responseLanguage\}/g, languageName);

      content += `

## Technical Explanation Rules

When the user asks "explain", "giải thích", "how it works", or any technical question:
- Follow the coding level rules above strictly for depth and format
- Do NOT switch to a generic explanation style — adhere to the level
- If the topic is too complex for this level, simplify; do not escalate
`;

      return content;
    } catch {
      this.log.warn("Coding level template not found", { path: templatePath });
      return "";
    }
  }

  getBlockedDirs(): string[] {
    return this.readConfig().blockedDirs;
  }

  getSelectedContexts(keys: ContextKey[]): string[] {
    return keys
      .map((key) => {
        switch (key) {
          case "gitBranch":
            return this.getGitBranchContext();
          case "projectRuleContentFiles":
            return this.getProjectRuleContentContext();
          case "responseLanguage":
            return this.getResponseLanguageContext();
          case "codingLevel":
            return this.getCodingLevelContext();
        }
      })
      .filter((value): value is string => Boolean(value));
  }

  private readConfig(): XForceContextConfig {
    const stats = this.getConfigStats();

    if (!stats) {
      if (this.cacheKey !== "missing") {
        this.log.warn("X-Force context config file not found", {
          configPath: this.configPath,
        });
      }
      this.cacheKey = "missing";
      this.cachedConfig = EMPTY_CONFIG;
      return this.cachedConfig;
    }

    const validCacheKey = `valid:${stats.mtimeMs}`;
    const invalidCacheKey = `invalid:${stats.mtimeMs}`;

    if (this.cacheKey === validCacheKey || this.cacheKey === invalidCacheKey) {
      return this.cachedConfig;
    }

    try {
      const rawConfig = fs.readFileSync(this.configPath, "utf-8");
      const parsedConfig = JSON.parse(rawConfig) as unknown;

      this.cachedConfig = this.validateConfig(parsedConfig);
      this.cacheKey = validCacheKey;
    } catch (error) {
      if (this.cacheKey !== invalidCacheKey) {
        this.log.error("Failed to load X-Force context config", {
          configPath: this.configPath,
          error: error instanceof Error ? error.message : String(error),
        });
      }
      this.cacheKey = invalidCacheKey;
      this.cachedConfig = EMPTY_CONFIG;
    }

    return this.cachedConfig;
  }

  private validateConfig(config: unknown): XForceContextConfig {
    const context = this.getContextObject(config);

    return {
      projectRuleContentFiles: this.resolveProjectRuleContentFiles(context.projectRuleContentFiles),
      responseLanguage: this.validateResponseLanguage(context.responseLanguage),
      codingLevel: this.validateCodingLevel(context.codingLevel),
      blockedDirs: this.validateBlockedDirs(context.blockedDirs),
    };
  }

  private getContextObject(config: unknown): Record<string, unknown> {
    if (!config || typeof config !== "object") {
      return {};
    }

    const context = (config as { context?: unknown }).context;

    if (!context || typeof context !== "object") {
      return {};
    }

    return context as Record<string, unknown>;
  }

  private resolveProjectRuleContentFiles(value: unknown): string[] {
    if (!Array.isArray(value)) return [];

    return value.flatMap((entry) => {
      if (typeof entry !== "string") return [];

      const trimmedEntry = entry.trim();
      if (!trimmedEntry || CONTROL_CHAR_PATTERN.test(trimmedEntry)) return [];

      const resolvedPath = path.resolve(this.baseDir, trimmedEntry);
      const relativePath = path.relative(this.baseDir, resolvedPath);

      if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        this.log.warn("Skipping project rule content file outside repo root", {
          filePath: trimmedEntry,
        });
        return [];
      }

      if (!fs.existsSync(resolvedPath)) {
        this.log.warn("Skipping missing project rule content file", {
          filePath: trimmedEntry,
        });
        return [];
      }

      const normalizedPath = `./${relativePath.split(path.sep).join("/")}`;
      return CONTROL_CHAR_PATTERN.test(normalizedPath) ? [] : [normalizedPath];
    });
  }

  private validateResponseLanguage(value: unknown): string {
    if (typeof value !== "string") {
      return "";
    }

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return "";
    }

    if (!SAFE_SCALAR_PATTERN.test(trimmedValue)) {
      this.log.warn("Skipping invalid response language value", {
        responseLanguage: trimmedValue,
      });
      return "";
    }

    return trimmedValue;
  }

  private validateCodingLevel(value: unknown): CodingLevel | "" {
    if (typeof value !== "string") {
      return "";
    }

    const normalizedValue = value.trim() as CodingLevel;

    if (normalizedValue && !VALID_CODING_LEVELS.has(normalizedValue)) {
      this.log.warn("Skipping invalid coding level value", {
        codingLevel: normalizedValue,
      });
    }

    return VALID_CODING_LEVELS.has(normalizedValue) ? normalizedValue : "";
  }

  private validateBlockedDirs(value: unknown): string[] {
    if (!Array.isArray(value)) return [];

    return value.filter((entry): entry is string => {
      if (typeof entry !== "string") return false;
      const trimmed = entry.trim();
      if (!trimmed || CONTROL_CHAR_PATTERN.test(trimmed)) return false;
      return true;
    });
  }

  private getConfigStats(): fs.Stats | null {
    try {
      return fs.statSync(this.configPath);
    } catch {
      return null;
    }
  }

  private runGitBranchCommand(): string {
    try {
      return execFileSync("git", ["branch", "--show-current"], {
        cwd: this.baseDir,
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
    } catch (error) {
      this.log.warn("Failed to resolve git branch for X-Force context", {
        error: error instanceof Error ? error.message : String(error),
      });
      return "";
    }
  }
}
