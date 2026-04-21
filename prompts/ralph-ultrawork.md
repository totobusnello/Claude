# Ralph + ULTRAWORK Template

Use this as your prompt for `/ralph-loop` to combine the official loop mechanism with ULTRAWORK intelligence.

## Usage

```bash
/ralph-loop "[ULTRAWORK MODE]

## Smart Model Routing (SAVE TOKENS)
- Simple lookups → haiku agents (architect-low, explore, executor-low)
- Standard work → sonnet agents (executor, designer, build-fixer)
- Complex analysis → opus agents (architect, planner, critic)
- ALWAYS pass model parameter explicitly to Agent tool

## Parallel Execution Rules
- Fire independent calls simultaneously - NEVER wait sequentially
- Use run_in_background=true for long operations (builds, tests, installs)
- Delegate to specialist agents immediately

## Verification Before Completion (IRON LAW)
1. IDENTIFY: What command proves the task is complete?
2. RUN: Execute verification (test, build, lint)
3. READ: Check output - did it actually pass?
4. SPAWN: architect agent (opus) to verify implementation
5. ONLY THEN: Output <promise>DONE</promise>

## Zero Tolerance
- NO scope reduction - deliver FULL implementation
- NO partial completion - finish 100%
- NO test deletion - fix code, not tests
- NO premature stopping - ALL TODOs must be complete

## Task
[YOUR TASK HERE]

When ALL requirements met AND architect verified: <promise>DONE</promise>
" --max-iterations 50 --completion-promise "DONE"
```

## With PRD Mode

For complex tasks, initialize a PRD first:

```bash
/ralph-loop "[ULTRAWORK MODE + PRD]

## PRD Initialization
Before starting work:
1. Create .omc/prd.json with user stories (right-sized, verifiable, independent)
2. Create .omc/progress.txt with progress log
3. Priority order: foundational work before UI

## Smart Model Routing
[same as above]

## Task
[YOUR COMPLEX TASK HERE]

When ALL user stories pass AND architect verified: <promise>DONE</promise>
" --max-iterations 100 --completion-promise "DONE"
```
