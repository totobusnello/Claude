---
name: memory-recompile
description: Recompile the `compiled truth` section of a nox-mem entity file (memory/entities/<type>/<slug>.md) from its timeline using Gemini Flash-Lite. Preserves frontmatter and timeline, rewrites the middle section only. Trigger when user says "recompile entity X", "atualiza compiled do X", "/memory-recompile X", or when an entity's timeline has grown significantly and compiled is stale.
---

# memory-recompile

Skill for the nox-mem "compiled truth + timeline" entity format (Fase 1.7b-c).

## Purpose

Entity files in `memory/entities/<type>/<slug>.md` have 3 sections:

```
---
frontmatter (name, description, type, status, ...)
---

<!-- retention: X -->

Compiled truth — the CURRENT best understanding of this entity.
REWRITTEN as evidence accumulates in the timeline.

---

## Timeline

- **2026-04-24** — [event-type] description
- **2026-04-23** — [event-type] description
...
```

Over time, the timeline grows (new events appended) but the compiled section stays stale. This skill rewrites the compiled section based on the full timeline, using Gemini Flash-Lite (cheap, fast).

## When to use

- User asks "recompile entity X", "atualiza compiled do X", or `/memory-recompile <entity>`
- User reports that an entity has "outdated compiled" or "timeline has new events not reflected above"
- After a batch of timeline entries are appended (e.g. from a productive week)
- Never use automatically — always user-triggered or explicitly requested

## Workflow

1. **Locate the entity file**. If user gives just a name, search `memory/entities/*/` on VPS for a matching slug.
   ```bash
   ssh root@100.87.8.44 'find /root/.openclaw/workspace/memory/entities -name "*<slug>*.md"'
   ```

2. **Read the current entity file**. Parse into 3 sections via the `---` delimiters.

3. **Call Gemini Flash-Lite** with a recompile prompt. Model: `gemini/gemini-2.5-flash-lite` (already configured for infra tasks).

   System prompt:
   ```
   You are a compiler for structured memory files. The user gives you:
   1. An entity's YAML frontmatter (name, description, type, etc)
   2. The current "compiled truth" paragraph
   3. The full timeline (reverse-chronological event log)

   Your job: rewrite the compiled truth paragraph reflecting the latest state
   of this entity based on the timeline. Conservative with facts — only state
   what the timeline supports. Prefer "em andamento" over fabricating status.
   Preserve structure (bullets, headings, tone). 50-300 words. Plain markdown.
   Do NOT touch frontmatter or timeline — output ONLY the new compiled block.
   ```

4. **Validate the Gemini output**:
   - Must be plain markdown (no frontmatter, no `---` separators, no `## Timeline`)
   - Must be 50-300 words
   - Must not contradict the timeline

5. **Write back** the file with new compiled section, preserving frontmatter + timeline.

6. **Re-ingest** via the CLI (entity file change triggers watcher; or run manually):
   ```bash
   ssh root@100.87.8.44 'set -a; source /root/.openclaw/.env; set +a
     nox-mem ingest-entity /root/.openclaw/workspace/memory/entities/<type>/<slug>.md'
   ```

7. **Re-vectorize** (fast idempotent):
   ```bash
   ssh root@100.87.8.44 'set -a; source /root/.openclaw/.env; set +a; nox-mem vectorize'
   ```

8. **Confirm to user**: show diff of old vs new compiled (3-5 lines each).

## Safeguards

- **Backup first**: copy the file to `<path>.bak-<timestamp>` before overwriting
- **Dry-run mode**: if user says "dry-run" or "preview", show proposed compiled but don't write
- **Don't touch timeline**: even if timeline has typos, this skill NEVER edits it. Timeline is append-only evidence.
- **Respect frontmatter**: preserve all YAML fields including `retention`
- **Check HTML retention comment**: if present (`<!-- retention: never -->`), preserve

## Gemini call example

```bash
ssh root@100.87.8.44 'set -a; source /root/.openclaw/.env; set +a
  curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"contents\":[{\"parts\":[{\"text\":\"$PROMPT\"}]}]}" \
    | jq -r ".candidates[0].content.parts[0].text"'
```

## Example: recompile Nuvini

Input (timeline shows 2 new deals closed recently):
```
- **2026-04-22** — [deal-closed] Mercos deal fechado R$87M
- **2026-04-15** — [deal-won] SME deal venceu R$174M
- **2026-04-20** — [status] Em andamento, deals ativos
```

Old compiled:
```
Deals ativos: SME (R$174M), Mercos, outros em due diligence
```

New compiled (after recompile):
```
Nuvini segue como companhia advisory ativa. Dois deals fecharam recentemente:
SME (R$174M, abr/15) e Mercos (R$87M, abr/22). Pipeline continua ativo com
novos deals em due diligence não nomeados. Totó permanece no papel de
Financials Consultant.
```

## Related

- Fase 1.7b-c spec: `memoria-nox/plans/2026-04-24-fase-1.7b-c-close.md`
- Entity format spec: `memoria-nox/CLAUDE.md` + `reference_entity_file_format.md` auto-memory
- CLI: `nox-mem ingest-entity <file>` (added 2026-04-24)
