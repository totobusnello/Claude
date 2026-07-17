# CTO-EXECUTE Pipeline — Idea → Code → Delivery

Load this file only in CTO-EXECUTE mode. The fable session (the CTO) drives every phase
inline; subagents are spawned only for execution, review and QA work. All artifacts persist to
disk so a run survives context clears.

## State contract (resumable)

All state lives in `.cto/exec/{feature-slug}/`:

- `state.json` — single source of truth (below)
- `product-spec.md`, `tech-spec.md`, `plan.md`, `qa-report.md` — phase artifacts

```json
{
  "featureSlug": "...",
  "featureDescription": "...",
  "currentPhase": "setup|spec|plan|execute|qa|fix|deliver|done",
  "project": {
    "name": "", "packageManager": "", "language": "", "framework": "", "monorepo": false,
    "commands": { "install": "", "typecheck": "", "lint": "", "test": "", "build": "", "dev": "" },
    "conventions": ""
  },
  "waves": [
    { "id": 1, "tasks": [
      { "id": "1.1", "desc": "", "files": [], "agent": "executor", "model": "sonnet",
        "discriminator": "explicit yes/no acceptance check", "status": "pending|done|reworked" }
    ] }
  ],
  "commits": [], "qaIterations": 0, "maxQaIterations": 3,
  "createdAt": "", "updatedAt": ""
}
```

On every invocation: check `.cto/exec/*/state.json`; if an incomplete run exists, offer to
resume unless the input clearly starts something new. Update `state.json` at every phase
transition and every completed task.

## Phase 0 — Setup

1. Slug the feature; create `.cto/exec/{slug}/` + `state.json`.
2. Project detection → `state.project`: read package.json / pyproject.toml / Cargo.toml /
   go.mod; package manager from lockfiles; framework; monorepo (turbo/nx/pnpm-workspace);
   verify commands from scripts; conventions from CLAUDE.md.
3. Prior art: `nox_mem_search` + `nox_mem_decision_list` on the subsystem; read
   `cto-requirements.md` if present.
4. Open the notes file `.cto/fable-notes-{slug}.md` — structural anchors (file→role,
   decision→dependency), not narrative.

## Phase 1 — Product spec (inline, CPO hat)

Skip condition: the user handed a detailed plan/spec → condense it into `product-spec.md`,
move on. Otherwise brainstorm with the user (AskUserQuestion only for genuine forks), then
write `product-spec.md`:

```markdown
# Product Spec: {name}
## Problem — user pain, why now
## Users — who benefits, how
## Scope — In (MVP) / Out (deferred)
## Stories — as X, I want Y, so that Z
## Success metrics
## Risks — | risk | impact | mitigation |
```

## Phase 2 — Tech spec (inline, CTO hat)

Write `tech-spec.md`:

```markdown
# Tech Spec: {name}
## Architecture decision — chosen approach + alternatives rejected and why
## Data changes — schema / migrations
## API design — endpoints / contracts
## Files — create / modify (explicit inventory)
## Dependencies — added / removed, why
## Security notes — anything security-adjacent routes to the opus lane (see SKILL.md)
```

Record every architecture decision in the ledger — `nox_mem_decision_set(key, content)`,
key slugged per subsystem, so future runs find it in Phase 0.

## Phase 3 — Workplan (inline)

Write `plan.md` as waves. A wave = tasks with no dependencies between them (parallelizable).
Every task carries:

- files touched (from the tech-spec inventory)
- agent + model tier (ladder in SKILL.md): `executor`/sonnet default; `executor-low`/haiku
  trivial; `architect`/`executor-high`/opus for heavy architecture; `security-reviewer`/opus
  for anything security-adjacent
- an explicit yes/no acceptance discriminator ("endpoint returns 200 with schema X on input
  Y", "typecheck passes with zero new errors") — Phase 5 gates on exactly this, fail-safe
  toward DEFER

## Phase 4 — Execute (the team)

Per wave:

1. Spawn all independent tasks in ONE message (parallel). Each agent prompt: the task, its
   file inventory, project conventions, its acceptance discriminator, and the instruction to
   report back the diff summary + how it verified the discriminator.
2. **HARD RULE:** any agent that mutates git runs in `isolation: "worktree"` — or a fresh
   `/tmp/<task>-$(uuidgen)` shallow clone. No exceptions with parallel agents
   (see `~/Claude/CLAUDE.md`, branch-checkout incidents).
3. Do NOT spawn for work completable directly in a single response — over-delegation is the
   measured fable failure mode; each spawn ≈ 20K tokens of cold-start.

## Phase 5 — Gate the wave (inline)

For each returned task: check its discriminator against primary state — the actual diff, the
actual test output — never the agent's claim alone. Aggregate fail-safe: any failed check →
task reworked before the wave merges; never "close enough". Design-heavy or risky diffs: fan
to the adversarial council (kimi/glm/grok/codex) before accepting. Security-touching diffs:
route to `security-reviewer`/opus — never adjudicated here. Log verdicts in the notes file.
Advance to the next wave only when the current one is fully green.

## Phase 6 — QA + fix cycles

1. Run the project's verify chain from `state.project.commands`: install → typecheck → lint →
   test → build. UI flows: chrome-devtools / `qa-tester` (sonnet).
2. Write `qa-report.md` — failures with actual output, not summaries of summaries.
3. Failures → fix tasks → back to Phase 4. `qaIterations++`; at `maxQaIterations` (3), STOP
   and report the open failures to the user — do not loop.

## Phase 7 — Deliver

1. Feature branch → selective `git add` (only files in the plan inventory) → commit
   (`COMMIT_TO_NON_MAIN_OK=1`) → push → PR. Never direct to main. PR body: what shipped,
   decisions made (ledger keys), gates passed, QA state.
2. Ledger: `nox_mem_decision_set` for any decision that changed during execution.
3. Report to the user: outcome first (PR link, what shipped), then open risks and deferred
   items.
4. `state.json` → `done`.
