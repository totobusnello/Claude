# Agentic Memory (A-MEM) MCP Server

Evolutive memory system with semantic search, automatic relationship detection, and memory evolution.

## When to Use
- When storing learnings, decisions, patterns, or insights across sessions
- When recalling past context ("what did we decide about...", "remind me about...")
- When building connections between related pieces of knowledge
- Keywords: "lembrar", "memorizar", "guardar isso", "o que aprendemos", "decisão sobre"

## Tools Available (via MCP)

| Tool | Purpose |
|------|---------|
| `amem_add` | Store a new memory with semantic indexing |
| `amem_search` | Semantic search across all memories |
| `amem_evolve` | Analyze relationships and evolve memory graph |
| `amem_update` | Update memory content, tags, links |
| `amem_list` | List memories by category |
| `amem_stats` | Memory system statistics |
| `amem_delete` | Remove a memory |

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
- **Vectors**: Vectra (local embeddings, no API needed)
- **Evolution**: LLM-driven relationship analysis via Claude
- **Data**: `~/.claude/memory/amem.db` + `~/.claude/memory/amem-vectors/`
