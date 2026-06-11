# Claude Code ↔ OpenCode Mapping Reference

## Built-in Tools Mapping

| Claude Code Tool | OpenCode Tool             | Notes                                 |
| ---------------- | ------------------------- | ------------------------------------- |
| Read             | read                      | Read files                            |
| Write            | write                     | Create/update files                   |
| Edit             | write                     | OpenCode uses write for modifications |
| Bash             | bash                      | Execute shell commands                |
| Glob             | glob                      | Find files by pattern                 |
| Grep             | grep                      | Search text/content                   |
| WebFetch         | fetch                     | HTTP requests                         |
| WebSearch        | Search plugin / MCP       | No direct built-in equivalent         |
| TodoWrite        | Task plugin / custom tool | No built-in equivalent                |
| Task (Sub-agent) | Agent                     | Agent execution                       |
| MCP Tools        | MCP Tools                 | Native MCP support                    |
| Memory           | Memory plugin             | Plugin-based in OpenCode              |

---

## Hooks / Lifecycle Mapping

### Core Hook Mapping

| Claude Code Hook   | OpenCode Event                       |
| ------------------ | ------------------------------------ |
| SessionStart       | session.created                      |
| UserPromptSubmit   | experimental.chat.messages.transform |
| PreToolUse         | tool.execute.before                  |
| PostToolUse        | tool.execute.after                   |
| PermissionRequest  | permission.asked                     |
| PermissionResponse | permission.replied                   |
| Stop               | session.idle                         |
| StopFailure        | session.error                        |
| FileChanged        | file.watcher.updated                 |
| PreCompact         | experimental.session.compacting      |
| PostCompact        | session.compacted                    |
| SessionEnd         | session.deleted (closest equivalent) |
| Notification       | tui.toast.show                       |

---

## Hook Examples

### UserPromptSubmit

Claude Code:

```json
{
  "hooks": {
    "UserPromptSubmit": {
      "command": "inject-context.sh"
    }
  }
}
```

OpenCode:

```ts
{
  "experimental.chat.messages.transform": async (messages) => {
    return [
      {
        role: "system",
        content: "Additional instructions"
      },
      ...messages
    ]
  }
}
```

---

### PreToolUse

Claude Code:

```json
{
  "hooks": {
    "PreToolUse": {
      "command": "security-check.sh"
    }
  }
}
```

OpenCode:

```ts
{
  "tool.execute.before": async (input, output) => {
    // security validation
  }
}
```

---

### PostToolUse

Claude Code:

```json
{
  "hooks": {
    "PostToolUse": {
      "command": "format-output.sh"
    }
  }
}
```

OpenCode:

```ts
{
  "tool.execute.after": async (input, output) => {
    // post processing
  }
}
```

---

## Permissions Mapping

| Claude Code          | OpenCode                              |
| -------------------- | ------------------------------------- |
| Permission Rules     | Permissions Config                    |
| Allow Tool           | Tool Allow List                       |
| Deny Tool            | Tool Deny List                        |
| Auto Approve         | Auto Allow                            |
| Interactive Approval | permission.asked                      |
| Permission Hooks     | permission.asked / permission.replied |

---

## Project Instructions Mapping

| Claude Code         | OpenCode    |
| ------------------- | ----------- |
| CLAUDE.md           | AGENTS.md   |
| Custom Instructions | AGENTS.md   |
| Skills              | Agents      |
| Slash Commands      | Commands    |
| Subagents           | Agents      |
| Hooks               | Plugins     |
| MCP Servers         | MCP Servers |

---

## Architecture Comparison

### Claude Code

```text
User Prompt
    ↓
UserPromptSubmit
    ↓
PreToolUse
    ↓
Tool Execute
    ↓
PostToolUse
    ↓
Stop
```

### OpenCode

```text
User Prompt
    ↓
experimental.chat.messages.transform
    ↓
tool.execute.before
    ↓
Tool Execute
    ↓
tool.execute.after
    ↓
session.idle
```

---

## SuperClaude Migration Mapping

| SuperClaude Feature | Claude Code            | OpenCode                                            |
| ------------------- | ---------------------- | --------------------------------------------------- |
| Context Injection   | UserPromptSubmit       | experimental.chat.messages.transform                |
| Security Checks     | PreToolUse             | tool.execute.before                                 |
| Auto Formatting     | PostToolUse            | tool.execute.after                                  |
| Memory Injection    | UserPromptSubmit       | experimental.chat.messages.transform                |
| Notifications       | Notification           | tui.toast.show                                      |
| Session Summary     | Stop                   | session.idle                                        |
| Compaction Logic    | PreCompact/PostCompact | experimental.session.compacting + session.compacted |

---

## Most Important Mappings

If migrating SuperClaude or similar frameworks, these are the critical equivalents:

| Claude Code      | OpenCode                             |
| ---------------- | ------------------------------------ |
| UserPromptSubmit | experimental.chat.messages.transform |
| PreToolUse       | tool.execute.before                  |
| PostToolUse      | tool.execute.after                   |

These three hooks usually account for the majority of framework migration effort.
