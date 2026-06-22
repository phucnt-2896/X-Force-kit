# X-Force Kit — OpenCode Configurations

This document describes the workflow skills and plugin features configured for the OpenCode environment.

---

## 🛠️ Workflow Skills

The system defines specialized skills to guide AI agents through structured development pipelines.

### 🔍 x:spec

- **Purpose**: Runs a spec-gated interview to clarify requirements, business goals, and visual details before planning or implementation.
- **Key Features**:
  - **Hard Gate**: No implementation action or coding is allowed until a written spec is approved by the user.
  - **Guided Interview**: Asks one focused question at a time, preferring structured options (2-5 choices) over open-ended questions.
  - **UI-Bearing Checkpoint**: If a task involves visual elements, it mandates collecting Figma URLs and screenshots, or proposing a UI layout style.
  - **Planning-Ready Standard**: Captures the actor, trigger, before/after states, and success criteria to prevent downstream planning from guessing business logic.
  - **Output**: Saves the approved spec to `docs/specs/YYYY-MM-DD-HHMM/<slug>-spec.md`.

### 📋 x:plan

- **Purpose**: Creates structured implementation plans with codebase analysis and risk assessment.
- **Workflow Modes**:
  - `--fast`: For trivial tasks. Skips deep research and inline Red-Teaming.
  - `--standard`: Default mode. Spawns 1 research subagent and performs basic Red-Teaming.
  - `--hard`: For critical tasks/migrations. Spawns 2 research subagents and runs a full Red-Team validation interview.
  - `--deep`: For architectural refactors. Spawns 2 research subagents, conducts targeted code searches, and performs full Red-Teaming.
- **Additional Flags**:
  - `--tdd`: Injects a mandatory `## Test Strategy` section into all phase files.
- **Key Features**:
  - **Cross-Plan Scan**: Scans existing plans for overlapping file targets or database schemas to prevent conflicts.
  - **Phase Decomposition Rules**: Enforces single-focus phases, estimated effort $\le$ 1 day per phase, touching $\le$ 20 files, and ensuring they are parallel-safe and independent.
  - **Red-Team Checklist**: Questions blast radius, fragility, rollback plans, security vectors, and performance bottlenecks.
  - **Output**: Produces `plans/{date}-{slug}/plan.md` and phase files.

### 🍳 x:cook

- **Purpose**: Executes phase-by-phase code implementation based on plans or task descriptions.
- **Key Features**:
  - **Hard Gates**: Enforces planning before coding, codebase scouting before implementation, and side-effect validation after code review.
  - **Testing & Review Loop**: Automatically runs tests and delegates to a code-reviewer subagent.
  - **Review Cycle Guard**: Limits review iterations to 3 cycles. Critical issues (security, performance bottlenecks, architectural violations) block merges. Escalates to the user if unresolved after 3 cycles.
  - **Finalization**: Syncs checklists back to phase files, updates plan status, offers git commits, and triggers journal writing.

### 🔎 x:code-review

- **Purpose**: Performs adversarial code quality reviews on PRs, commits, or pending changes.
- **Key Features**:
  - **3-Stage Process**: Spec compliance mapping (PASS/MISSING/EXTRA), two-pass quality check (Critical/Informational), and adversarial Red-Teaming (detecting false assumptions and memory leaks).
  - **Verification Gate**: Enforces running test suites and reporting exact execution outputs before claiming completion.

### 🐛 x:debug

- **Purpose**: Investigates bugs, test failures, and unexpected behaviors using root cause analysis (RCA).
- **Key Features**:
  - **Evidence Collection**: Gathers exact error traces, logs, and git commit history before hypothesizing.
  - **Hypothesis Testing**: Generates 2-3 competing explanations and tests each systematically.
  - **Output**: Produces a structured debug report outlining immediate vs. underlying causes, timeline, and mitigation options.

### 🔧 x:fix

- **Purpose**: Applies targeted bug fixes based on debug reports.
- **Key Features**:
  - **Regression Testing**: Ensures a test is written reproducing the bug to prevent future regressions.
  - **Scope Verification**: If a fix modifies >3 files or involves complex logic, it triggers the `x:code-review` workflow first.

### 🔭 x:scout

- **Purpose**: Discovers relevant files, modules, and API endpoints across directories.
- **Key Features**:
  - **Parallel Execution**: Spawns up to 3 parallel subagents to search segments of the codebase simultaneously.
  - **Output**: Aggregates findings into a single report containing relevant file paths and outstanding questions.

### 📓 x:journal

- **Purpose**: Captures technical decisions, architectural trade-offs, and lessons learned.
- **Key Features**:
  - **Honest Diaries**: Documents the root cause of issues, choices made/rejected, and emotional realities of debugging sessions.
  - **Output**: Written to `./docs/journals/`.

### 📊 x:watzup

- **Purpose**: Generates session hand-off summaries.
- **Key Features**:
  - **Summary Only**: Analyzes current branch and recent commits to report what shipped, what is in flight, and what is next without making any changes.

### 🌐 x:agent-browser

- **Purpose**: Automates browser tasks like form filling, clicking, scraping, and visual testing via CDP accessibility-tree snapshots.

### 📐 x:project-organization

- **Purpose**: Enforces standardized naming conventions and directory locations (timestamped plans, reports, journals, and evergreen docs).

---

## 🔌 Plugin Features (X-Force)

The `x-force.ts` plugin is an OpenCode extension that intercepts chat sessions and tool executions to inject context and enforce workspace security.

### 1. System Context Injection (`session.created` & `chat.system.transform`)

Prepares custom configurations and appends them to the system prompt context:

- **Git Branch Context**: Evaluates and injects the current active branch.
- **Language Customization**: Tailors the AI output language (e.g., Vietnamese, English) based on config settings.
- **Coding Level Adaptability**: Loads specific templates (`references/coding-level-*.md`) to adjust explanations, code complexity, and formatting to match the user's expertise (junior, middle, senior, nontech).

### 2. Message & Rule Injection (`chat.messages.transform`)

Injects strict guidelines into the first user message of a session:

- **Think Before Coding**: Mandates highlighting assumptions, surfacing trade-offs, and raising clarifications before generating code.
- **Project Rules Context**: Injects project-specific rules from files configured in `projectRuleContentFiles` (e.g., legacy database mapping protocols and frontend styling instructions).

### 3. Directory Blocking (`tool.execute.before`)

Acts as a security middleware to intercept and block read, glob, grep, and bash commands targeting restricted directories:

- **Blocked Paths**: Prevents interaction with `node_modules`, `vendor`, `.git`, `bootstrap/cache`, and `public/build`.
- **Execution Block**:
  - Throws errors if `read`, `glob`, or `grep` tools target a blocked folder.
  - Uses regex pattern matching to reject `bash` commands containing references to blocked directories.
