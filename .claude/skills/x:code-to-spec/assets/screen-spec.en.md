<!--
English per-screen spec template (Astro Starlight ready).
Write in PLAIN BUSINESS LANGUAGE — a PM or end user must understand every section.
Keep all code/file/route detail inside the collapsed "Developer notes" block only.
Fill every {{PLACEHOLDER}}; delete a section only if it truly does not apply.
-->
---
title: "{{SCREEN_ID}} — {{SCREEN_NAME}}"
description: "{{ONE_LINE_DESCRIPTION}}"
---

> **Screen ID:** {{SCREEN_ID}} · **Feature:** {{FEATURE}} · **Area:** {{AREA}} ({{ACTOR}})
> _Generated from code on {{DATE}}._

## Purpose

{{PURPOSE_PLAIN}}

## Who uses it

- **Users:** {{ACTORS}}
- **Access:** {{ACCESS_CONDITIONS_PLAIN}}

## What's on the screen

{{UI_ELEMENTS_PLAIN}}

## How it works

1. {{FLOW_STEP}}

## Business rules

> What the screen does and the conditions behind each behavior.
> When a rule mentions a message, quote the app's original string verbatim or
> point to "Messages shown" — never paraphrase or translate the message text.

- **BR-1.** {{RULE_PLAIN}}
- **BR-2.** {{RULE_PLAIN}}

## Inputs & validation

| Field | What's allowed | Required |
|---|---|---|
| {{FIELD_LABEL}} | {{RULE_IN_PLAIN_WORDS}} | {{Yes/No}} |

## Messages shown

| Situation | Message (original) |
|---|---|
| {{SITUATION}} | {{ORIGINAL_STRING}} |

## Related screens

- {{RELATED_SCREEN_ID}} — {{RELATION_REASON}}

## Notes

- {{EDGE_CASE_OR_OPEN_QUESTION}}

<details>
<summary>Developer notes (routes, validation, source)</summary>

**Routes**

| Method | URL | Route name | Action | Middleware |
|---|---|---|---|---|
| {{METHOD}} | `{{URI}}` | {{ROUTE_NAME}} | `{{CONTROLLER@ACTION}}` | {{MIDDLEWARE}} |

**Raw validation rules**

| Field | Rule |
|---|---|
| `{{FIELD}}` | `{{RAW_RULE}}` |

**Data models:** {{MODELS}}

**Source files:**
- Routes: `{{ROUTE_FILE}}`
- Controller(s): {{CONTROLLER_FILES}}
- Form Request(s): {{REQUEST_FILES}}
- View / Page: {{VIEW_FILES}}
- Lang: {{LANG_FILES}}

</details>
