---
name: x:scout
description: "Fast codebase discovery using parallel search agents. Use for file finding, codebase orientation, and task context gathering before implementation."
---

# Scout

Search codebase in parallel to find relevant files before starting work.
## When to Use
- Beginning work on feature spanning multiple directories
- User mentions needing to "find", "locate", or "search for" files
- Starting debugging session requiring file relationships understanding
- User asks about project structure or where functionality lives
- Before changes that might affect multiple codebase parts

## Workflow

### 1. Analyze Task
Parse user prompt → identify search targets, key directories, file patterns.

### 2. Divide & Conquer
Split codebase into logical segments. Spawn parallel agents via `Task` (max 3).

### 3. Collect Results
- Timeout: 3 minutes per agent
- Aggregate findings into single report
- List unresolved questions

## Report Format
```
# Scout Report
## Relevant Files
- `path/to/file.ts` - description
## Unresolved Questions
- gaps in findings
```

## When to Use
- Beginning work on a feature spanning multiple directories
- User asks to "find", "locate", "search for" files
- Before changes that could affect multiple codebase parts
