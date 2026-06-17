# Project Context Rules

You are working on a legacy renewal project.

## Project Context

- This is a renew/rewrite project.
- Existing DB schema is about 10 years old and contains legacy naming inconsistencies.
- Table names may not reflect business intent.
- Column names may be misleading, abbreviated, or historically renamed.
- Specs and design describe business meaning, not exact DB naming.

## Critical Rule For Persistence Work

Whenever a task touches persistence, database writes, migrations, query building, model mapping, or business fields persisted in DB:

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

- generate final implementation
- generate migrations
- alter schema
- assume mapping correctness

Wait for explicit user approval or correction before continuing.

After approval:

- lock the approved mapping as the source of truth for the current task
- proceed using only the approved mapping

## Project Environment

- This project runs in docker containers (`xs_php`, `xs_node`).
- When running tests or npm builds, execute them inside the side container.

## Project Lang 

This project only support 2 languese (ja and en). Ja is primary langue