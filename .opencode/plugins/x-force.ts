import type { Plugin } from "@opencode-ai/plugin";
import * as fs from "fs";
import * as path from "path";
import { createLogger } from "./lib/logger";
import { XForceContextHelper } from "./lib/x-force-context-helper";

const SYSTEM_CONTEXT_KEYS = ["gitBranch", "responseLanguage", "codingLevel"] as const;
const MESSAGE_CONTEXT_KEYS = [ "projectRuleContentFiles"] as const;
function isPathBlocked(absPath: string, worktree: string, blockedDirs: string[]): boolean {
  let resolved: string;
  try {
    resolved = fs.realpathSync(absPath);
  } catch {
    resolved = path.resolve(absPath);
  }

  const relative = path.relative(worktree, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return false;

  const normalized = relative.split(path.sep).join("/");

  for (const dir of blockedDirs) {
    if (normalized === dir || normalized.startsWith(dir + "/")) {
      return true;
    }
  }
  return false;
}

function buildBlockedDirPattern(dirs: string[]): RegExp {
  const escaped = dirs.map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  return new RegExp(`(^|["'\\s/=])(${escaped})(/|$|["'\\s])`);
}

export const XForcePlugin: Plugin = async ({ directory, worktree, client }) => {
  const log = createLogger(directory);
  const helper = new XForceContextHelper(directory, log);


  const blockedDirs = helper.getBlockedDirs();
  const blockedDirPattern = buildBlockedDirPattern(blockedDirs);

  function buildDefaultContextBlock(): string {
    return helper.getSelectedContexts([...SYSTEM_CONTEXT_KEYS]).join("\n");
  }

  return {
    event: async ({ event }) => {
      if (event.type === "session.created") {
        client.tui.showToast({
          body: {message: "X-Force activated", variant: "success", duration: 5000},
        });
      }
    },
    "tool.execute.before": async (input, output) => {
      if (!output.args) return;

      const tool = input.tool;

      if (tool === "read") {
        const filePath = output.args.filePath;
        if (filePath && isPathBlocked(path.resolve(worktree, filePath), worktree, blockedDirs)) {
          log.warn("Blocked Read call", { filePath });
          throw new Error(
            `Can't read (${blockedDirs.find((d) => filePath.includes(d))}). Update .opencode/x-force.config.js to allow these directories`
          );
        }
        return;
      }

      if (tool === "glob" || tool === "grep") {
        const dirPath = output.args.path;
        if (dirPath && isPathBlocked(path.resolve(worktree, dirPath), worktree, blockedDirs)) {
          log.warn("Blocked Glob/Grep call", { tool, path: dirPath });
          throw new Error(
            `Can't read (${blockedDirs.find((d) => dirPath.includes(d))}). Update .opencode/x-force.config.js to allow these directories`
          );
        }
        return;
      }

      if (tool === "bash") {
        const command = output.args.command;
        if (command && blockedDirPattern.test(command)) {
          log.warn("Blocked bash call referencing generated dir", { command });
          throw new Error(
            `Can't read (${blockedDirs.find((d) => command.includes(d))}). Update .opencode/x-force.config.js to allow these directories`
          );
        }
        return;
      }
    },
    "tool.execute.after": async (input, output) => {
      log.info("Tool executed", { tool: input.tool, outputTitle: output.title });
    },
    "experimental.chat.system.transform": async (_input, output) => {
      try {
        const contextBlock = buildDefaultContextBlock();
        const systemContext = `<system-context>\n${contextBlock}\n</system-context>`;
        if (systemContext) {
          output.system.unshift(systemContext);
        }
        log.info("Injecting X-Force chat system context", {output});
      } catch (error) {
        log.error("Failed to inject X-Force chat system context", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
    "experimental.chat.messages.transform": async (input, output) => {
      return;
      const firstUser = output.messages.find(m => m.info.role === 'user');
      if (!firstUser || !firstUser.parts.length) return;
      if (firstUser.parts.some(p => p.type === 'text' && p.text.includes('EXTREMELY_IMPORTANT'))) return;
      const ref = firstUser.parts[0];
      const projectRules = helper.getSelectedContexts([...MESSAGE_CONTEXT_KEYS]).join("\n");

      const text = `<EXTREMELY_IMPORTANT> 
      ## Think Before Coding
      Don't assume. Don't hide confusion. Surface tradeoffs.

      Before implementing:

      State your assumptions explicitly. If uncertain, ask.
      If multiple interpretations exist, present them - don't pick silently.
      If a simpler approach exists, say so. Push back when warranted.
      If something is unclear, stop. Name what's confusing. Ask.
      
      ## Project rule
      ${projectRules}
       </EXTREMELY_IMPORTANT>
      `;
      const { id, sessionID, messageID } = ref;
      firstUser.parts.unshift({
        type: "text",
        text,
        id,
        sessionID,
        messageID,
      });
      log.info("Injecting X-Force message context", { output});
    }
  }
};
