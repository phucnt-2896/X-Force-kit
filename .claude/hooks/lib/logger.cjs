const fs = require("fs");
const path = require("path");

function safeStringify(data) {
  try {
    return JSON.stringify(data);
  } catch {
    return `[Unserializable: ${typeof data}]`;
  }
}

function createLogger(baseDir) {
  const logDir = path.resolve(baseDir, ".claude", "tmp", "logs");

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  function logFile() {
    return path.join(logDir, `${new Date().toISOString().slice(0, 10)}.log`);
  }

  function write(level, message, data) {
    try {
      const ts = new Date().toISOString();
      const dataStr = data !== undefined ? ` ${safeStringify(data)}` : "";
      const line = `[${ts}] [${level.toUpperCase()}] ${message}${dataStr}\n`;
      fs.appendFileSync(logFile(), line, "utf-8");
    } catch {
      // Hook logging must never break the user workflow.
    }
  }

  return {
    debug: (message, data) => write("debug", message, data),
    info: (message, data) => write("info", message, data),
    warn: (message, data) => write("warn", message, data),
    error: (message, data) => write("error", message, data),
  };
}

module.exports = {
  createLogger,
};
