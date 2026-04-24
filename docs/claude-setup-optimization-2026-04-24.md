# Claude Setup Optimization Report — 2026-04-24

**Your CLI version:** 2.1.119 (latest) ✅
**Source of truth:** `~/Claude/` (synced to `~/.claude/` via `scripts/sync-all-to-home.sh`)
**Scope analyzed:** 225 skills · 173 agents · 27 command dirs · `settings.json` · plugins · hooks

---

## Setup Health Snapshot

| Metric | Value | Status |
|---|---|---|
| SKILL.md files | 225 | ✅ |
| Skills missing `name:` | 3 | ⚠️ |
| Skills missing frontmatter | 1 (`memory/amem-server`) | 🔴 |
| Agent files | 173 | ✅ |
| Agents with `model:` field | 44 / 173 (25%) | ⚠️ |
| Agents with `tools:` field | 171 / 173 | ✅ |
| Duplicate skills (same name in 2+ dirs) | 13 | ⚠️ |
| `permissions.allow` entries | 211 (0 duplicates) | ⚠️ sprawl |
| Hook events configured | `SessionStart` only | ⚠️ |
| Plugins enabled | claude-hud, claude-mem, claude-code-setup, chrome-devtools, context-mode, claude-md-management | ✅ |
| Plugins installed but disabled | 40+ | ℹ️ |

---

## HIGH PRIORITY

### 1. Fix 4 broken skills (loader errors)
**Affected:**
- `skills/memory/amem-server/SKILL.md` — **no frontmatter at all** (won't load)
- `skills/multi-agent-patterns/SKILL.md` — no `name:` field
- `skills/software-architecture/SKILL.md` — no `name:` field
- `skills/subagent-driven-dev/SKILL.md` — no `name:` field
- `skills/context-mode/SKILL.md` — description is literal `|` (YAML block scalar with empty body)
- `skills/tob-codeql/SKILL.md` — description is literal `>-`

**Why:** Skills without `name:` or `description:` silently fail to load (changelog notes fix for this as a known failure mode). These are invisible to the loader right now.

**Fix:** Add frontmatter with `name` + a ≥30-char `description` starting with "Use when…".

---

### 2. De-duplicate 13 skills living in multiple categories
The sync script uses `rsync --delete`, but duplicates still ship (same filename under different category dirs). Examples: `agile-product-owner` (3×), `analytics-tracking`, `ab-test-setup`, `ai-product`, `cto-advisor`, `ceo-advisor`, `product-manager-toolkit`, `product-strategist`, `playwright-expert`, `content-creator`, `app-store-optimization`, `marketing-strategy-pmm`, `marketing-demand-acquisition` (all 2×).

**Why:** Duplicates cause ambiguous trigger matching and bloat context at session start (~225 skills listed).
**Fix:** Pick one canonical path per skill, delete the rest. Consider collapsing `business-cpo/` + `business-marketing/` overlap.

---

### 3. Add `model:` to the 129 agents missing it (75%)
Only 44 of 173 agents set `model:`. Without it, all of them run on the primary session model. Your own `CLAUDE.md` rule says *"Haiku first — only escalate if the task requires"*.

**Fix pattern:**
```yaml
# explore-*.md, *-low.md → model: haiku
# most development agents → model: sonnet
# architect, planner, critic → model: opus
```
**Impact:** 3-5× lower cost on routine explore/review flows; your CLAUDE.md already documents the intended routing.

---

### 4. Migrate off deprecated output styles
The changelog (v2.0.30) deprecated output styles: *"Review options in `/output-style` and use `--system-prompt-file`, `--system-prompt`, `--append-system-prompt`, CLAUDE.md, or plugins instead."* You're currently running under `learning` output style (per session-start context).

**Fix:** Either (a) stop using the output style and put the learning-mode instructions in a CLAUDE.md section or a slash command, or (b) accept that it's legacy. If keeping, document it in `~/Claude/CLAUDE.md` so it's intentional.

---

## MEDIUM PRIORITY

### 5. Clean up `permissions.allow` (211 entries, lots of one-off literals)
Entries like:
```
"Bash(# Comparar o que tem instalado vs repo echo "=== Instalado === ...)"
"Bash(for dir in /Users/lab/Claude/Projetos/*/)"
"Bash(do echo \"=== $dir ===\")"
"Bash(BUTTONDOWN_API_KEY=\"...\" python3 scripts/feedback.py)"  ← leaked key!
```
**Why:** Auto-allow grew as one-off approvals instead of wildcards. There's also a **Buttondown API key literal** in the allowlist — rotate it.

**Fix:**
```bash
/fewer-permission-prompts   # skill that scans transcripts and proposes wildcards
```
Then manually prune historical literal commands. Target: ≤60 wildcard entries.

---

### 6. Adopt new hook events (changelog highlights you're missing)
Your `hooks:` only has `SessionStart`. Recent additions worth considering:

| Hook | Added | Use case |
|---|---|---|
| `PermissionRequest` | 2.0.45 | Auto-approve/deny tool calls with custom logic — could replace half your allowlist |
| `PreCompact` / `PostCompact` | 2.1.105 / 2.0.x | Snapshot important state before compaction |
| `SubagentStart` | 2.0.43 | Warm up subagent context (e.g., load project memory) |
| `TeammateIdle` / `TaskCompleted` | recent | Notify on long-running agents |
| `if:` filter on hooks | recent | Scope hooks with permission-rule syntax (reduces overhead) |
| `once: true` | recent | One-shot hooks |

**Fix:** Start with `PermissionRequest` — it's the biggest leverage against your 211-entry allowlist.

---

### 7. Use `skills:` frontmatter in agents to auto-load relevant skills
Changelog (v2.0.43): *"Added skills frontmatter field to declare skills to auto-load for subagents."* None of your 173 agents use this. Agents like `designer`, `frontend-agent`, `backend-developer` would benefit.

---

### 8. Audit plugin double-install
`claude-code-setup@claude-plugins-official` shows **both** `Scope: project` AND `Scope: user`. Pick one scope to avoid divergence.

---

### 9. Agent `permissionMode:` field (v2.0.43)
Custom agents can now declare their own permission mode. `executor-high` and `opus`-level architects probably want `dontAsk` baked into their frontmatter rather than inheriting from the session.

---

## LOW PRIORITY

### 10. YAML-list form in `allowed-tools` (14 skills already use it)
Changelog added support for YAML sequences. If you touch older skills, migrate:
```yaml
allowed-tools:
  - Read
  - Bash
  - WebSearch
```

### 11. `memory:` frontmatter for agents (recent)
Agents can now have `user`/`project`/`local` persistent memory. Useful for `architect`, `planner`, `critic`.

### 12. `prUrlTemplate` setting (v2.1.119)
If you use a non-GitHub code-review URL anywhere, this points the footer badge at it.

### 13. `autoMemoryDirectory` (v2.1.74)
You already have `~/.claude/projects/-Users-lab-Claude/memory/` — consider making it explicit in settings so it doesn't silently move.

---

## Version-Specific Wins Since Your Last Review

From v2.1.x (the deltas that matter for your workflows):
- **v2.1.119** — `PostToolUse` hooks get `duration_ms`; PowerShell tool auto-approve; parallel MCP reconnect; `--print` honors agent `tools:`/`disallowedTools:`
- **v2.1.107** — `path` param for `EnterWorktree`; PreCompact can block compaction
- **v2.1.74** — `/context` gives actionable suggestions on bloat
- **v2.1.51** — Custom npm registries for plugin install; BashTool skips login shell (faster)
- **v2.1.32** — Agent teams (experimental, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`); auto-memory feature; `.claude/skills/` in `--add-dir` auto-loaded

---

## Suggested Action Sequence

1. **Now (30 min):** Fix the 4 broken skills (#1) + de-dup the 13 skill name collisions (#2).
2. **Today (1h):** Run `/fewer-permission-prompts` and prune the allowlist (#5). Rotate the Buttondown key.
3. **This week:** Batch-add `model:` to agents based on category (#3).
4. **Experiment:** Draft a `PermissionRequest` hook to kill 50% of your allowlist (#6).
5. **Decision to make:** Keep the `learning` output style or migrate to CLAUDE.md (#4).
