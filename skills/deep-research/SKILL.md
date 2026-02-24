---
name: deep-research
description: "Execute autonomous multi-step research. Two modes: 'native' (default) uses Claude + WebSearch in an iterative plan-search-think loop; 'gemini' delegates to Google Gemini Deep Research API ($2-5, 2-10 min). Use for: market analysis, competitive landscaping, literature reviews, technical research, due diligence."
---

# Deep Research Skill

Autonomous multi-step research with iterative search, extraction, and synthesis.

## Mode Selection

| Mode | When to Use | Cost | Time |
|------|-------------|------|------|
| **native** (default) | Most research tasks; want control and transparency | WebSearch tokens only | 1-5 min |
| **gemini** | Massive scope tasks; 100+ sources; don't need intermediate control | $2-5 per task | 2-10 min |

Use **native** by default. Switch to **gemini** only when user explicitly requests it or the scope clearly demands 100+ sources.

---

## Native Mode — Iterative Research Loop

Claude executes the full research loop itself using WebSearch, following a structured methodology.

### Phase 1: Plan (Research Brief)

Before any searching, produce a Research Brief:

```
RESEARCH BRIEF
══════════════
Objective: [What we need to find out]
Scope: [Boundaries — what's in/out]
Complexity: simple | moderate | complex
Search Budget: [3 / 5 / 8 searches based on complexity]
Subtopics:
  1. [First angle to investigate]
  2. [Second angle]
  3. [Third angle if complex]
Key Questions:
  - [Specific question 1]
  - [Specific question 2]
```

**Budget allocation:**
- **Simple** (single fact, definition, quick lookup): 3 searches
- **Moderate** (comparison, overview, multi-faceted): 5 searches
- **Complex** (deep analysis, market research, literature review): 8 searches

### Phase 2: Search-Think Loop

Execute iteratively:

```
┌─────────────┐
│  1. SEARCH  │ → WebSearch with targeted query
└──────┬──────┘
       ▼
┌─────────────┐
│  2. EXTRACT │ → Pull facts VERBATIM (numbers, dates, names, quotes)
└──────┬──────┘
       ▼
┌─────────────┐
│  3. THINK   │ → What did we learn? What gaps remain?
└──────┬──────┘
       ▼
┌──────────────────┐
│  4. COMPRESS?    │ → Every 3-5 searches, compress accumulated facts
└──────┬───────────┘
       ▼
┌──────────────────┐
│  5. CONTINUE?    │ → Gaps remain AND budget left? → Go to 1
│     STOP?        │ → Budget exhausted OR gaps filled → Phase 3
└──────────────────┘
```

#### Search Strategy Rules

1. **Start broad, go narrow**: First search = overview query. Subsequent = targeted follow-ups.
2. **Verbatim Preservation**: NEVER paraphrase numbers, dates, percentages, names, or direct quotes during extraction. Copy them exactly.
3. **Compression**: After every 3-5 searches, compress your accumulated notes into a structured summary. Discard redundant info but keep ALL specific data points.
4. **Parallel Decomposition**: For comparisons (e.g., "compare X vs Y vs Z"), research each item separately, then cross-reference.
5. **Source Diversity**: Don't rely on a single source. Cross-reference key claims across 2+ sources.
6. **Tiered Queries**:
   - Round 1: `"[topic] overview"` or `"what is [topic]"`
   - Round 2: `"[topic] [specific subtopic]"` targeting gaps
   - Round 3+: `"[topic] [specific data point] site:authoritative-source.com"`

#### Think Step Template

After each search, briefly note:
```
THINK #N (search N of budget)
├── Found: [key facts extracted]
├── Confirmed: [facts corroborated by multiple sources]
├── Gaps: [what's still missing]
├── Contradictions: [conflicting info to resolve]
└── Next: [what to search next, or "ready to synthesize"]
```

### Phase 3: Synthesis

Produce a structured report:

```markdown
# [Research Topic]

## Executive Summary
[2-3 sentences capturing the key finding]

## Key Findings

### [Subtopic 1]
[Findings with specific data points]

### [Subtopic 2]
[Findings with specific data points]

[... more subtopics as needed ...]

## Sources
- [Source 1 title](URL) — [what it contributed]
- [Source 2 title](URL) — [what it contributed]
[... all sources used ...]
```

#### Report Quality Rules

- Every claim must trace to a source
- Include specific numbers/dates/quotes (verbatim from extraction)
- Flag uncertainty: "According to [source]..." or "Estimates range from X to Y"
- Note contradictions between sources when found
- Keep executive summary under 100 words

---

## Gemini Mode — Delegated Research

Delegates to Google Gemini Deep Research API. Runs a fully autonomous research agent that plans, searches, reads, and synthesizes.

### Requirements

- Python 3.8+
- httpx: `pip install -r requirements.txt`
- GEMINI_API_KEY environment variable

### Setup

1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/)
2. Set the environment variable:
   ```bash
   export GEMINI_API_KEY=your-api-key-here
   ```

### Usage

```bash
# Start research
python3 scripts/research.py --query "Research the history of Kubernetes"

# With format template
python3 scripts/research.py --query "Compare Python web frameworks" \
  --format "1. Executive Summary\n2. Comparison Table\n3. Recommendations"

# Stream progress
python3 scripts/research.py --query "Analyze EV battery market" --stream

# Start without waiting
python3 scripts/research.py --query "Research topic" --no-wait

# Check status
python3 scripts/research.py --status <interaction_id>

# Wait for completion
python3 scripts/research.py --wait <interaction_id>

# Continue from previous
python3 scripts/research.py --query "Elaborate on point 2" --continue <interaction_id>

# List recent research
python3 scripts/research.py --list
```

### Cost & Time (Gemini)

| Metric | Value |
|--------|-------|
| Time | 2-10 minutes per task |
| Cost | $2-5 per task (varies by complexity) |
| Token usage | ~250k-900k input, ~60k-80k output |

---

## Workflow Decision Tree

```
User asks for research
       │
       ▼
  Scope > 100 sources OR user says "gemini"?
       │
  YES ─┤─── NO
  │         │
  ▼         ▼
Gemini    Native
Mode      Mode
```

## Best Use Cases

- Market analysis and competitive landscaping
- Technical literature reviews
- Due diligence research
- Historical research and timelines
- Comparative analysis (frameworks, products, technologies)
- Current events and recent developments
