# Project Context Rules

You are working on a legacy renewal project.

## Project Context

- This is a renew/rewrite project.
- Existing DB schema is about 10 years old and contains legacy naming inconsistencies.
- Table names may not reflect business intent.
- Column names may be misleading, abbreviated, or historically renamed.
- Specs and design describe business meaning, not exact DB naming.

## HARD-GATE Critical Rule For Any BE Task Touching DB Meaning

Whenever a task touches backend logic that reads from DB, writes to DB, builds queries, maps model fields, derives data from persisted business fields, or depends on understanding legacy table/column meaning:

- This rule applies to both read-only and write flows.
- This rule applies even when the task only renders data from an existing data source.
- This rule applies even when no migration, no insert/update/delete, and no schema change are planned.
- This step is mandatory and cannot be skipped for BE-related work that depends on DB-backed business data.
- Do not assume that a read-only screen is safe to implement without approved mapping.
- Because this is a legacy renewal project, table/column meaning may be confusing and must be confirmed with the user before implementation.

**IMPORTANT** if you are making `spec` or `plan`, you MUST scout DB, model and then propose DB mapping for user approve. If `spec` and `plan` file is clearly, we don't need rework => save the time
**IMPORTANT** You MUST add `## propose DB mapping` in `spec` file if any. User need to review it.

### Step 1: Analyze spec language

- Extract business entities and implied fields.
- Infer the semantic meaning of each field.

### Step 2: Search DB schema

- Find candidate tables and columns that may correspond.
- Consider historical abbreviations.
- Consider typo-like names.
- Consider shifted business meaning over time.
- Consider reused columns with misleading names.
- Consider nullable columns acting as flags or state markers.

### Step 3: Produce a mapping proposal

Use this format:

```md
## Proposed DB Mapping

Business Entity: <entity>

Candidate Table:
- `<table_name>`
Confidence: High / Medium / Low
Reason:
- why this table likely matches

Field Mapping:
| Spec Field | Candidate Column | Confidence | Reasoning |
|------------|------------------|------------|-----------|

Unresolved Ambiguities:
- ...

Alternative Candidates:
- ...

Questions for User Approval:
1. Is `<spec field>` actually stored in `<column>`?
2. Is `<legacy column>` deprecated or still active?
3. Should new implementation preserve legacy semantics?
```

### Step 4: Stop

Do not:

- generate final implementation for BE or FE parts that depend on unapproved DB meaning
- generate final implementation
- generate migrations
- alter schema
- assume mapping correctness
- continue from "best guess" mapping just because the task is read-only

Wait for explicit user approval or correction before continuing.

After approval:

- lock the approved mapping as the source of truth for the current task
- proceed using only the approved mapping

## Additional Clarification

- If a UI screen needs backend data, and that backend data comes from legacy tables/columns, the DB mapping approval step must happen before implementation.
- If a repository/service/controller/resource/query is involved, assume this rule applies unless the task is proven to be completely DB-independent.
- If the task has both BE and FE scope, BE mapping approval is still required first when FE output depends on DB-backed field meaning.

## Project Environment

- This project runs in docker containers (`xs_php`, `xs_node`).
- When running tests or npm builds, execute them inside the side container.

## Project Lang 

This project only support 2 languese (ja and en). Ja is primary langue
