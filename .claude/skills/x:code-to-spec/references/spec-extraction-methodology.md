# Spec Extraction Methodology

How to turn a Laravel codebase into per-screen specifications. Read this when the
spec graph is ambiguous, an area has no screen codes, or a field needs a
non-obvious source. Examples below use one recruitment app's conventions
(`Ad_*`/`Ag_*`/`Ca_*` codes); detect the equivalents in the project at hand.

## Source-to-spec mapping

| Spec field | Primary source | Notes |
|---|---|---|
| **Screen ID** | Trailing route comment `// Ad_JF_006` | Synthesized `Area-Controller` when absent |
| **Screen name** | `resources/lang/{ja,en}` labels, route name, controller name | Prefer a UI label; fall back to a humanized route/controller name |
| **Feature / module** | Screen-ID group segment + controller namespace | `Ad_JF_*` → "Job Fair (admin)" |
| **Area / actor** | Route file + group `domain` + auth guard | admin / agent / candidate |
| **URL & HTTP method** | Route definition (full URI through group prefixes) | From the spec graph `routes[]` |
| **Permissions / access** | Route `middleware` (`auth:agent`, `activity-log`, policies) | Map guard → role |
| **Business rules** | Controller method body + Form Request `withValidator` + domain logic | The narrative core |
| **Input & validation** | Form Request `rules()` | From graph `form_requests[].rules` |
| **Data entities** | `use App\Models\*` in the controller + model relations | From graph `models[]` |
| **UI elements** | React pages `resources/assets/<area>/pages` + Blade `views[]` | Open the page/view to list forms, tables, buttons |
| **Messages & labels** | `resources/lang/<locale>/*.php` (and JSON lang files) | Quote original strings verbatim for traceability |
| **Related screens** | Shared controllers/models, redirect targets, link targets | Cross-reference by screen ID |

## Screen-ID taxonomy

Format `{Area}_{Group}_{Number}` — e.g. `Ad_JF_006`:

- **Area prefix**: `Ad` = Admin, `Ag` = Agent, `Ca` = Candidate (extend as found).
- **Group**: feature cluster — `TOP` dashboard, `JF` job fair, `L`/`LAG`/`LAD` login/account, `MS` master data, `CL` candidate list, `SM` settings, etc. Derive the human feature name from the controllers and lang labels in that group, not from the abbreviation alone.
- **Number**: sequence within the group. Multiple routes share one screen ID (a screen = the page plus its async endpoints).

## Areas without explicit screen codes

Often only some areas carry `// code` comments (in the reference app, only Admin
does). For any area without codes, the spec graph synthesizes a screen ID as
`Area-Controller` (e.g. `Ag-Help`, `Ca-Candidate`) by grouping routes per
controller. When writing specs for these:

- Treat one synthesized screen as one feature surface owned by that controller.
- Name it from the controller + its lang labels / React page, not the synthetic ID.
- If a controller is very large (many unrelated methods), split into multiple
  specs by URI sub-path and note the split in **Traceability**. Log any split so
  coverage stays honest — do not silently drop methods.

## Reading lang files

`resources/lang/{ja,en}/<file>.php` return nested PHP arrays. Dotted keys map to
nesting: `admin.candidate.not_found_curriculum_vitae`. To find a screen's labels,
grep the controller/view/page for `trans('...')`, `__('...')`, `@lang('...')`, or
`t('...')` (frontend) keys, then resolve each key in both `ja` and `en`. Quote the
original JA and EN strings as-is in the spec's **Messages & labels** section — do
not translate them; they are the source of truth the QA team verifies against.

## Edge cases & honesty rules

- **Concatenated / dynamic validation** — rules like `'in:' . implode(',', $x)` or
  `"in:{$ids}"` extract only their static skeleton. Open the Form Request and read
  `withValidator()` / `prepareForValidation()` for the real constraint, and state
  it in prose. Never present a truncated rule as the whole rule.
- **Closures & invokable controllers** — routes with closure actions (`action_kind:
  "closure"`) have no controller file; describe them from the route + closure body.
- **Single-action controllers** — `__invoke`; the whole class is the method.
- **Resource controllers** — `Route::resource` expands to standard CRUD verbs; if
  present, enumerate the implied routes.
- **Unverified claims** — if a business rule cannot be traced to code, mark it
  `(needs confirmation)` rather than inventing behavior. Specs must reflect what the
  code does, not what it ideally should do.
- **Message fidelity** — never paraphrase or translate a user-facing message. The
  app shows the resolved lang value (e.g. `trans('auth.locked')`), not your wording.
  When prose references a message, quote the original string verbatim or name its
  lang key; resolve the key in `resources/lang/<locale>` to get the real text. If a
  locale lacks the key, say so and mark `(needs confirmation)` — do not fill the gap
  with invented text.
- **Auth guard → role** — `auth:admin`→Admin user, `auth:agent`→Agent (enterprise)
  user, `auth:candidate`/`auth:web`→Candidate. `activity-log` = audited action.
