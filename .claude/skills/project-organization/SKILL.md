---
name: project-organization
description: "Standardize file locations, naming conventions, directory structures for any project. Use when creating files or organizing outputs."
---

# Project Organization

## Core Rules

### Rule 1 — Directory Categories
| Category | Path | Purpose |
|----------|------|---------|
| Source | `src/` or root | Application code |
| Docs | `docs/` | Human & AI readable docs |
| Plans | `plans/` | Implementation plans, reports |
| Tests | `tests/` | Test suites |
| Scripts | `scripts/` | Utility scripts |
| Assets | `assets/{type}/` | Media, designs |
| Config | Root or `.config/` | dotfiles, config |

### Rule 2 — Naming
- **Timestamped**: `{YYMMDD-HHmm}-{slug}` for plans, reports, journals
- **Evergreen**: `{slug}` for stable docs
- **Variant**: `{slug}-{variant}.{ext}` for asset versions
- All kebab-case, self-documenting, max 50 chars

### Rule 3 — Nesting
| Scenario | Pattern |
|----------|---------|
| Single file | Flat in category dir |
| Multi-file | Subdirectory with plan.md + phase-*.md |
| Scoped reports | `plans/{plan}/reports/{report}.md` |

### Rule 4 — Markdown Body Standards
| Type | Key sections |
|------|-------------|
| Plan | frontmatter → overview → phases → dependencies → success |
| Phase | overview → requirements → architecture → steps → risks |
| Report | summary → findings → recommendations → questions |
| Journal | context → what happened → reflection → decisions → next |

## Pre-Output Checklist
1. Determine category → base path
2. Choose naming mode (timestamped/evergreen/variant)
3. Decide nesting (flat vs subdirectory)
4. Create directory structure if needed
