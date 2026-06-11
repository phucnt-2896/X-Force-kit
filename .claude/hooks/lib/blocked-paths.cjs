const fs = require("fs");
const path = require("path");

function isPathBlocked(absPath, worktree, blockedDirs) {
  let resolved;

  try {
    resolved = fs.realpathSync(absPath);
  } catch {
    resolved = path.resolve(absPath);
  }

  const relative = path.relative(worktree, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return false;
  }

  const normalized = relative.split(path.sep).join("/");

  for (const dir of blockedDirs) {
    if (normalized === dir || normalized.startsWith(`${dir}/`)) {
      return true;
    }
  }

  return false;
}

function buildBlockedDirPattern(dirs) {
  const escaped = dirs.map((dir) => dir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  return new RegExp(`(^|["'\\s/=])(${escaped})(/|$|["'\\s])`);
}

function detectBlockedDir(eventPayload, repoRoot, blockedDirs) {
  const toolName = String(eventPayload.tool_name || eventPayload.toolName || "").toLowerCase();
  const toolInput = eventPayload.tool_input || eventPayload.toolInput || {};
  const blockedDirPattern = buildBlockedDirPattern(blockedDirs);

  if (toolName === "read") {
    const filePath = getStringValue(toolInput.filePath, toolInput.file_path);
    if (filePath && isPathBlocked(path.resolve(repoRoot, filePath), repoRoot, blockedDirs)) {
      return blockedDirs.find((dir) => filePath.includes(dir)) || findPathHit(filePath, repoRoot, blockedDirs);
    }
    return "";
  }

  if (toolName === "grep" || toolName === "glob") {
    const dirPath = getStringValue(toolInput.path);
    const includePattern = getStringValue(toolInput.include);
    const searchPattern = getStringValue(toolInput.pattern);
    if (dirPath && isPathBlocked(path.resolve(repoRoot, dirPath), repoRoot, blockedDirs)) {
      return blockedDirs.find((dir) => dirPath.includes(dir)) || findPathHit(dirPath, repoRoot, blockedDirs);
    }
    if (includePattern && blockedDirPattern.test(includePattern)) {
      return blockedDirs.find((dir) => includePattern.includes(dir)) || "blocked-dir";
    }
    if (searchPattern && blockedDirPattern.test(searchPattern)) {
      return blockedDirs.find((dir) => searchPattern.includes(dir)) || "blocked-dir";
    }
    return "";
  }

  if (toolName === "bash") {
    const command = getStringValue(toolInput.command);
    if (command && blockedDirPattern.test(command)) {
      return blockedDirs.find((dir) => command.includes(dir)) || "blocked-dir";
    }
    if (command && isDynamicShellCommand(command)) {
      return "dynamic-shell-command";
    }
  }

  return "";
}

function getStringValue(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return "";
}

function findPathHit(filePath, repoRoot, blockedDirs) {
  const absolute = path.resolve(repoRoot, filePath);
  const normalized = absolute.split(path.sep).join("/");
  return blockedDirs.find((dir) => normalized.includes(`/${dir}`)) || "blocked-dir";
}

function isDynamicShellCommand(command) {
  return /\$\(|\$\{|\$[A-Za-z_]|`|\beval\b/.test(command);
}

module.exports = {
  buildBlockedDirPattern,
  detectBlockedDir,
  isDynamicShellCommand,
  isPathBlocked,
};
