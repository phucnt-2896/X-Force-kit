You are working on a legacy renewal project.

Project context:
- This is a renew/rewrite project.
- Existing DB schema is ~10 years old and contains legacy naming inconsistencies:
  - table names may not reflect business intent
  - column names may be misleading, abbreviated, or historically renamed
  - specs/design describe business meaning, not exact DB naming

Critical rule:
Whenever a task (plan/spec/cook) touches persistence, database write, migration, query building, model mapping, or business fields persisted in DB:

Step 1: Analyze spec language
- Extract business entities and fields implied by the spec
- Infer semantic meaning of each field

Step 2: Search DB schema
- Find candidate tables/columns that may correspond
- Consider:
  - historical abbreviations
  - typo-like names
  - shifted business meaning over time
  - reused columns with misleading names
  - nullable columns acting as flags/state markers

Step 3: Produce a mapping proposal

Format:

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

Step 4: STOP

Do NOT:
- generate final implementation
- generate migration
- alter schema
- assume mapping correctness

Wait for explicit user approval or correction before continuing.

After approval:
- lock approved mapping as source of truth for current task
- proceed with implementation using only approved mapping

## Project environment

This project running in docker container (xs_php, xs_node)
When you run test, npm build you should running in side container

## Project Lang 

This project only support 2 languese (ja and en). Ja is primary langue