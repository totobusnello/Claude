export const TOOL_DEFINITIONS = [
  {
    name: "amem_add",
    description:
      "Add a new memory to the agentic memory system. The memory is stored with semantic indexing for later retrieval. Provide keywords and tags for better organization, or let Claude extract them.",
    inputSchema: {
      type: "object" as const,
      properties: {
        content: {
          type: "string",
          description: "The memory content to store",
        },
        keywords: {
          type: "array",
          items: { type: "string" },
          description: "Key terms for this memory (nouns, verbs, concepts). If omitted, you should extract them from the content.",
        },
        context: {
          type: "string",
          description: "One-sentence summary: topic/domain, key points, purpose",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Broad classification tags (domain, format, type). If omitted, you should generate them.",
        },
        category: {
          type: "string",
          description: "Category: project-learning, decision, pattern, preference, belief, insight, fact, todo",
          enum: ["project-learning", "decision", "pattern", "preference", "belief", "insight", "fact", "todo", "general"],
        },
      },
      required: ["content"],
    },
  },
  {
    name: "amem_search",
    description:
      "Search memories using semantic similarity. Returns the most relevant memories with their linked neighbors. Use this to recall past decisions, learnings, patterns, and context.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Natural language search query",
        },
        k: {
          type: "number",
          description: "Number of results to return (default: 5, max: 20)",
        },
        category: {
          type: "string",
          description: "Filter by category (optional)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "amem_evolve",
    description:
      "Trigger memory evolution analysis. Finds the nearest neighbor memories and returns context for deciding how to evolve them. After reviewing, use amem_update to apply changes. Use this when adding important new information that may relate to existing memories.",
    inputSchema: {
      type: "object" as const,
      properties: {
        memory_id: {
          type: "string",
          description: "ID of the memory to evolve from",
        },
      },
      required: ["memory_id"],
    },
  },
  {
    name: "amem_update",
    description:
      "Update an existing memory's content, tags, context, or links. Use after amem_evolve to apply evolution decisions.",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: {
          type: "string",
          description: "Memory ID to update",
        },
        content: {
          type: "string",
          description: "Updated content (optional)",
        },
        keywords: {
          type: "array",
          items: { type: "string" },
          description: "Updated keywords (optional)",
        },
        context: {
          type: "string",
          description: "Updated context summary (optional)",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Updated tags (optional)",
        },
        links: {
          type: "array",
          items: { type: "string" },
          description: "Memory IDs to link to (optional)",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "amem_stats",
    description:
      "Get memory system statistics: total count, categories breakdown, most/least accessed, stale memories count.",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "amem_delete",
    description: "Delete a memory by ID. This also removes it from the vector index.",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: {
          type: "string",
          description: "Memory ID to delete",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "amem_list",
    description: "List all memories, optionally filtered by category. Returns summaries.",
    inputSchema: {
      type: "object" as const,
      properties: {
        category: {
          type: "string",
          description: "Filter by category (optional)",
        },
        limit: {
          type: "number",
          description: "Max results (default: 20)",
        },
      },
    },
  },
  {
    name: "amem_consolidate",
    description:
      "Analyze all memories for consolidation opportunities. Clusters similar memories and suggests actions: MERGE (>0.9 similarity, near-duplicates), GENERALIZE (0.8-0.9, same theme), or LINK (0.7-0.8, related). Use when memory count exceeds 20+ or stale_count is high. After reviewing clusters, execute suggested actions via amem_update/amem_delete/amem_add.",
    inputSchema: {
      type: "object" as const,
      properties: {
        category: {
          type: "string",
          description: "Filter consolidation to a specific category (optional)",
        },
        similarity_threshold: {
          type: "number",
          description: "Minimum similarity score to form clusters (default: 0.7, range: 0.5-0.95)",
        },
        max_clusters: {
          type: "number",
          description: "Maximum number of clusters to return (default: 5)",
        },
      },
    },
  },
];
