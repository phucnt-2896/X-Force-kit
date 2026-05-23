import * as fs from "fs";
import * as path from "path";

type LogLevel = "debug" | "info" | "warn" | "error";

function safeStringify(data: unknown): string {
  try {
    return JSON.stringify(data);
  } catch {
    return `[Unserializable: ${typeof data}]`;
  }
}

export function createLogger(baseDir: string) {
  const LOG_DIR = path.resolve(baseDir, ".opencode", "tmp", "logs");

  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }

  function dateStamp(): string {
    return new Date().toISOString().slice(0, 10);
  }

  function logFile(): string {
    return path.join(LOG_DIR, `${dateStamp()}.log`);
  }

  function write(level: LogLevel, message: string, data?: unknown): void {
    try {
      const ts = new Date().toISOString();
      const dataStr = data !== undefined ? ` ${safeStringify(data)}` : "";
      const line = `[${ts}] [${level.toUpperCase()}] ${message}${dataStr}\n`;
      fs.appendFileSync(logFile(), line, "utf-8");
    } catch (e) {
      console.error(`[logger] Failed to write log:`, e);
    }
  }

  return {
    debug: (message: string, data?: unknown) => write("debug", message, data),
    info: (message: string, data?: unknown) => write("info", message, data),
    warn: (message: string, data?: unknown) => write("warn", message, data),
    error: (message: string, data?: unknown) => write("error", message, data),
  };
}
