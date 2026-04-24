---
name: amem-server
description: Use when the user asks to save, recall, search, evolve, or consolidate long-term memories, or references the Agentic Memory / A-MEM system. Provides evolutive memory with semantic search (OpenAI/Ollama embeddings), automatic relationship detection, and cross-session persistence via MCP tools (amem_add, amem_search, amem_evolve, amem_consolidate).
---

# Agentic Memory (A-MEM) MCP Server

Evolutive memory system with real semantic search, automatic relationship detection, memory evolution, and consolidation.

## When to Use
- When storing learnings, decisions, patterns, or insights across sessions
- When recalling past context ("what did we decide about...", "remind me about...")
- When building connections between related pieces of knowledge
- When memory count grows large and needs hygiene/consolidation
- Keywords: "lembrar", "memorizar", "guardar isso", "o que aprendemos", "decisão sobre"

## Tools Available (via MCP)

| Tool | Purpose |
|------|---------|
| `amem_add` | Store a new memory with semantic indexing |
| `amem_search` | Semantic search across all memories |
| `amem_evolve` | Analyze relationships and evolve memory graph |
| `amem_update` | Update memory content, tags, links |
| `amem_list` | List memories by category |
| `amem_stats` | Memory system statistics (includes embedding provider info) |
| `amem_delete` | Remove a memory |
| `amem_consolidate` | Cluster similar memories and suggest merge/generalize/link |

## Embedding Providers

A-MEM uses real semantic embeddings for similarity search. Provider is auto-detected on startup:

| Provider | Dimensions | Quality | Requirements |
|----------|-----------|---------|-------------|
| **OpenAI** (preferred) | 1536 | Excellent | `OPENAI_API_KEY` env var |
| **Ollama** (local) | 768 | Good | Ollama running on localhost:11434 with `nomic-embed-text` |
| **Hash** (offline fallback) | 384 | Basic | None — always works |

### Auto-Detection Chain
1. If `OPENAI_API_KEY` is set → try OpenAI `text-embedding-3-small`
2. If Ollama is running → try `nomic-embed-text`
3. Fallback → deterministic word hashing (offline, no API needed)

### Manual Override
Set `AMEM_EMBEDDING_PROVIDER` env var to: `openai`, `ollama`, `hash`, or `auto` (default).

### Check Current Provider
Run `amem_stats` — the response includes `embedding_provider` and `embedding_dimensions`.

### Switching Providers
When switching from one provider to another, the vector dimensions change. The existing vector index will need to be rebuilt:
1. Delete `~/.claude/memory/amem-vectors/` directory
2. Restart the MCP server
3. Re-index existing memories (they're safe in SQLite)

## Workflow

### Adding a Memory
```
1. User shares a learning/decision/insight
2. Claude extracts keywords, context, tags
3. Call amem_add with structured data
4. Server returns similar memories (neighbors)
5. If neighbors found, call amem_evolve to strengthen connections
```

### Recalling Context
```
1. User asks about a past topic
2. Call amem_search with natural language query
3. Results include linked memories (graph traversal)
4. Use combined context to inform response
```

### Memory Consolidation
```
1. Run amem_stats to check memory health
2. If total > 20 or stale_count > 10, run amem_consolidate
3. Review returned clusters:
   - MERGE (>0.9): near-duplicates → unify into one
   - GENERALIZE (0.8-0.9): same theme → create broader insight
   - LINK (0.7-0.8): related → add bidirectional links
4. Execute suggested actions via amem_update / amem_delete / amem_add
5. Run amem_stats again to verify improvement
```

### Memory Hygiene Checklist
- [ ] Total memories > 20? → Run `amem_consolidate`
- [ ] Stale count > 10? → Review and delete/update stale memories
- [ ] Duplicate-looking entries? → `amem_consolidate` with threshold 0.85
- [ ] Weak connections? → `amem_consolidate` with threshold 0.6 to find hidden links

### Memory Categories
- `project-learning` — Things learned about specific projects
- `decision` — Decisions made and their rationale
- `pattern` — Recurring patterns or best practices
- `preference` — User preferences and style choices
- `belief` — Core beliefs and principles
- `insight` — Cross-domain insights and connections
- `fact` — Factual information to remember
- `todo` — Things to remember to do

## Architecture
- **Storage**: SQLite + FTS5 full-text search
- **Vectors**: Vectra with real embeddings (OpenAI / Ollama / Hash fallback)
- **Evolution**: LLM-driven relationship analysis via Claude
- **Consolidation**: Cluster-based memory hygiene with 3-phase review
- **Data**: `~/.claude/memory/amem.db` + `~/.claude/memory/amem-vectors/`
