<!--
English index / feature map (Astro Starlight ready). One row per screen, grouped
by area then feature. Links are relative to this file. Keep coverage counts honest.
-->
---
title: "Application Specifications"
description: "Generated per-screen specs for QA, PM, end users, and developers."
---

Generated from the codebase on {{DATE}}. {{SCREEN_TOTAL}} screens detected across
{{AREA_TOTAL}} areas. Each row links to that screen's full spec.

## How to read

- **Screen ID** anchors every screen (e.g. `Ad_JF_006` = Admin → Job Fair → 006).
- Areas without legacy screen codes use `Area-Controller` IDs (e.g. `Ag-Help`).
- Each spec covers purpose, who uses it, what's on screen, business rules,
  validation, and messages — with developer detail tucked into a collapsed block.

## {{AREA_NAME}}

### {{FEATURE_NAME}}

| Screen ID | Name | Purpose | Spec |
|---|---|---|---|
| {{SCREEN_ID}} | {{NAME}} | {{PURPOSE_SHORT}} | [open]({{REL_PATH}}) |

## Coverage

- Screens detected: {{SCREEN_TOTAL}}
- Screens with explicit screen codes: {{EXPLICIT_COUNT}}
- Specs generated so far: {{DONE_COUNT}}
- Pending: {{TODO_COUNT}}
