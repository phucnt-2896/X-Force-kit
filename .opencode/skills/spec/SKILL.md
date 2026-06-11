---
name: spec
description: "/spec, write spec, refine requirements, new feature, new page, CRUD, UI task. Use in this repo to run a spec-gated interview before plan or cook. Explores project context first, asks one focused question at a time with options, drafts a reviewed spec, and stops for user approval before handoff."
---

# Spec - Spec-Gated Interview

Use this repo-local `spec` skill to discover the right requirement before planning or implementation.

In this repo, treat this repo-local skill as the source of truth for `spec` behavior.
If older `prep` or `spec` variants under `.claude/` or `.agents/` conflict with this file, follow this file.

Default stance:
- explore project context before asking for assets
- ask one focused question at a time
- prefer guided options over broad free-text prompts
- ask `WHY` before `WHAT`
- move from big-picture understanding into execution-relevant detail before stopping
- write a spec, self-review it, then stop for user review
- save the approved result as a spec file that downstream planning can reuse
- for UI-bearing requests, always pass through an explicit UI checkpoint before the spec is final

<HARD-GATE>
Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it. This applies to EVERY project regardless of perceived simplicity.
</HARD-GATE>

## When To Use

- before `plan` or `cook` for a new feature, page, flow, CRUD surface, or meaningful UI change
- when the task sounds clear at first glance but still has product or workflow ambiguity
- when a request needs context, business purpose, workflow placement, or user-behavior discovery

## Anti-Pattern: "This Is Too Simple To Need A Design"

Every project goes through this process. A todo list, a single-function utility, a config change — all of them. "Simple" projects are where unexamined assumptions cause the most wasted work. The design can be short (a few sentences for truly simple projects), but you MUST present it and get approval.

## Do Not Use

- tiny mechanical edits with no product ambiguity
- tasks where the user explicitly says to skip discovery and go straight to implementation, unless the request is UI-bearing

If the request is UI-bearing and the user wants to move fast, compress discovery to the minimum needed, but do not skip the hard gates or the UI checkpoint.

## Hard Gates

Do not hand off to planning or implementation until a written spec exists and the user has reviewed it.

Do not treat a spec as ready if downstream planning would still need to guess key behavior, rules, decisions, or outcomes in order to complete the request end to end.

The spec must either confirm or clearly mark assumptions for:
- actor
- trigger moment
- before state
- after state
- business outcome
- success criteria
- inferred user behavior

## Planning-Ready Standard

The goal is not just to understand the request.
The goal is to define the request deeply enough that downstream `plan` can produce an end-to-end plan that stays close to the user's real intent.

Keep interviewing when any in-scope area still has undefined behavior that would force planning or implementation to invent important details.

Common examples of missing detail:
- business rules or decision rules are still implied, not stated
- a user action is known, but the exact expected result is still vague
- success path is known, but failure, empty, error, or edge behavior is not
- inputs or editable data are known, but rules, limits, dependencies, or allowed values are not
- a step exists in the workflow, but entry condition, exit condition, or handoff is unclear
- scope says something should happen, but the trigger or ownership is still fuzzy

When this happens, ask follow-up questions until the behavior is defined enough to plan confidently, or mark the gap explicitly as an assumption that the user must review.

## Workflow

1. Explore project context
2. Identify missing requirement facts
3. Ask the next highest-leverage question
4. Insert summary checkpoints as soon as enough is known
5. Assess scope and split if too broad
6. Check whether the spec is detailed enough for downstream planning
7. Ask one final context-sweep question for anything still not loaded
8. Draft written spec
9. Self-review spec
10. Ask user to approve the spec before any handoff
11. Save the approved spec file for downstream use

## Phase 1: Explore Project Context First

Before asking questions, inspect only the most relevant local context:
- `README.md`
- relevant docs under `docs/`
- related plan/spec files if the task references one
- nearby implementation files if the task points to an existing flow
- recent commits only when change history is likely to clarify intent

Goal:
- understand where the request sits in the product
- avoid asking the user for facts the repo already reveals
- delay UI artifact questions until they are actually needed

## Phase 2: Interview In The Right Order

Cover these four lenses before field-level detail:

1. Context
2. Business goal
3. Workflow
4. Inferred user behavior

Required discovery points:
- who is doing this
- why this matters to the business
- what moment triggers the need
- what they do before this step
- what should happen after this step
- how success will be judged
- what the user is likely trying to optimize or avoid

Only after those are clear, move into detailed field, page, or interaction questions.

Ask actor and business goal before you go deep into workflow shape.

## Summary Checkpoints

Do not let one-question mode turn into a long, exhausting interview.

Insert a short summary checkpoint when either is true:
- two or three material answers have been collected
- the next question would move from `WHY` into detailed `WHAT`

At each checkpoint:
- summarize what is now understood
- list the remaining unknowns
- ask for confirmation before continuing if the direction still has risk

If the summary already supports a reliable spec and downstream planning would not need to invent key in-scope behavior, stop asking and draft it.

Exception:
- if the request is UI-bearing, do not finalize the spec until the UI checkpoint has been completed

If the big picture is clear but in-scope behavior is still underdefined, continue the interview and go one level deeper.

## Question Format Rules

- ask exactly one focused question per turn
- prefer 2-5 suggested options
- always allow a custom answer fallback
- confirm likely assumptions directly when possible
- keep each question narrow and high-leverage
- skip lenses already answered by the user

Prefer questions like:
- who is the main actor here?
- what event triggers this flow?
- which business outcome matters most?
- is this a forced step, an optional edit, or a maintenance action?

Avoid questions like:
- tell me more
- what do you want this screen to do?
- do you have Figma?

## Suggested Question Shapes

### Context
- actor options: admin, agent, candidate, internal operator, other
- environment options: onboarding, daily operation, exception handling, reporting, other

### Workflow
- trigger options: first-time setup, edit later, approval step, follow-up action, system reminder
- flow placement options: before X, between X and Y, after X, standalone utility

### Business Goal
- goal options: reduce drop-off, improve data quality, speed up operations, enforce compliance, improve visibility
- success options: completion rate, fewer support questions, faster handling time, fewer errors, higher adoption

### Inferred User Behavior
- behavior options: likely rushes through, compares options carefully, returns later to edit, needs reassurance, often misses required data

## Scope Control

If the request is too broad, say so plainly and stop to narrow it.

Offer a small set of slicing options, for example:
- core happy path only
- one actor or portal first
- one page or one workflow step first
- spec this now and leave adjacent actions for later

Do not quietly absorb scope creep into the spec.

## Final Context Sweep

Before drafting the spec, ask one final question to catch anything important that has not been loaded yet.

Purpose:
- catch hidden business rules
- catch copied behavior from an old system or old screen
- catch constraints, exceptions, approvals, or policy notes
- catch details the user assumed were obvious and therefore never mentioned

Preferred shape:
- before I freeze the spec, is there any extra rule, exception, constraint, old behavior, or context you want me to load so the later plan can stay accurate end to end?

If the user adds new material detail, continue the interview instead of drafting immediately.

## UI-Bearing Request Detection

Treat the request as UI-bearing when it includes or strongly implies any visible user interface surface, for example:
- page
- screen
- form
- modal
- dialog
- dashboard
- table
- list
- detail view
- settings
- profile
- edit or create screen
- anything the user sees, fills, clicks, compares, or navigates through

When in doubt, assume it is UI-bearing.

## UI Evidence Policy

For any UI-bearing request, run a mandatory UI checkpoint before finalizing the spec.

At that checkpoint, ask one focused UI evidence question that covers:
- whether a Figma URL exists
- whether a screenshot exists
- whether neither exists

Do not skip this checkpoint just because the business workflow is already clear.

Use this timing:
- after the four core lenses are clear enough to understand the request
- before the spec is finalized
- earlier only when the user explicitly starts from visual matching

For UI-bearing requests, do not skip UI evidence questions based on your own judgment about visual complexity.

When UI evidence matters, ask for both:
- Figma URL: useful for structure, spacing, tokens, and node-level details
- screenshot: useful for overall hierarchy and visual intent

Rules:
- if both exist, use both
- if only one exists, continue and record the missing evidence type as a limitation
- if neither exists, propose a design direction and stop for explicit approval

If neither exists, the design-direction response must include at least:
- layout style or structure
- information hierarchy
- interaction style for the main actions
- any important assumptions that still need user approval

The proposed design direction must be labeled as a proposal, not a fact.
Do not let missing artifacts replace requirement discovery.
Do not continue to plan or implementation from a design proposal without approval.

If the user starts by asking for visual matching, you may ask for visual evidence earlier, but still gather the four lenses before handoff.

### Recommended UI Checkpoint Question Shape

For UI-bearing requests, prefer a guided question like:
- I have enough workflow context. For the UI, which situation applies?

Suggested options:
- I have both Figma and screenshot
- I have only Figma
- I have only screenshot
- I have neither, please propose a UI direction

## Written Spec Format

Produce concise markdown in chat, then save the approved result as a spec file for downstream use.

Default saved artifact:
- `docs/specs/YYYY-MM-DD-HHMM/<slug>-spec.md`

Create the minimum needed timestamped folder when it does not exist.

Use a slug derived from the request so `plan` can auto-match it later.

Keep YAML frontmatter at the top of the saved spec so downstream planning can read it reliably.

If the user explicitly wants chat-only output, you may skip file creation, but you must warn that later planning may need manual context re-entry.

The spec should include:
- request summary
- context
- before state
- after state
- workflow placement
- business goal
- inferred user behavior
- UI evidence status
- proposed UI direction if no evidence exists
- scope in
- scope out
- operational details needed for planning
- success criteria
- dependencies or evidence
- open assumptions
- recommended next step

## Self-Review Checklist

Before showing the spec to the user, review it for:
- missing actor, trigger, before state, after state, workflow, business goal, success criteria, or inferred behavior
- missing detail that would force downstream planning to guess key in-scope behavior
- placeholders or vague filler
- contradictions
- unresolved core ambiguity not labeled as an assumption
- scope creep beyond the request
- UI evidence gaps not called out clearly
- missing mandatory UI checkpoint for a UI-bearing request
- missing proposed UI direction when no Figma or screenshot exists
- missing final context sweep before freezing the spec

Revise the spec before presenting it if any item fails.

## User Review Gate

After self-review, present the written spec and ask the user to approve or correct it.

Do not move to `plan`, `cook`, or implementation handoff until the user approves the spec.

If the user corrects it:
- update the spec
- re-check the checklist
- ask for approval again

After approval:
- save the final spec file to `docs/YYYY-MM-DD-HHMM/<slug>-spec.md` unless the user explicitly asked for chat-only
- mention the saved path in the handoff summary
- recommend the next step with a **concrete, copy-pasteable command**

### Actionable Next-Step Suggestion (mandatory)

After the spec file is saved, always present the next step in this exact format:

```
✅ Spec saved: docs/specs/YYYY-MM-DD-HHMM/<slug>-spec.md

👉 Next step — create an implementation plan:
/plan <one-line task summary> docs/specs/YYYY-MM-DD-HHMM/<slug>-spec.md
```

Rules:
- Replace `<one-line task summary>` with a concise description derived from the spec's request summary
- Use the **actual saved file path**, not a placeholder
- Do NOT say "you can now run plan" without providing the full command

## Output Style

- concise, structured, and decision-oriented
- use selectable options during interview when the tool allows it
- summarize assumptions explicitly instead of hiding them
- keep question count low by choosing the highest-leverage unknown first

## Sanity Scenarios

Use these as quick internal checks:

1. `Implement candidate profile input screen`
Ask actor and trigger before asking for fields.

2. `Update enterprise dashboard filter panel`
Inspect current workflow first and avoid jumping straight to screenshot questions.

3. `Create settings page based on old product`
Ask for both Figma and screenshot when relevant; if neither exists, propose a design direction and wait.

## Completion Rule

This skill is complete only when the user has a reviewed written spec that is ready for planning or implementation handoff.
