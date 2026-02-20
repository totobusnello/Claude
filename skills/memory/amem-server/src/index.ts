#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { MemoryDatabase, MemoryNote } from "./database.js";
import { VectorStore } from "./vector.js";
import { TOOL_DEFINITIONS } from "./tools.js";

// Initialize components
const db = new MemoryDatabase(process.env.AMEM_DB_PATH);
const vector = new VectorStore(process.env.AMEM_VECTOR_PATH);

// Create MCP server
const server = new Server(
  { name: "amem-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOL_DEFINITIONS,
}));

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "amem_add":
        return handleAdd(args as any);
      case "amem_search":
        return handleSearch(args as any);
      case "amem_evolve":
        return handleEvolve(args as any);
      case "amem_update":
        return handleUpdate(args as any);
      case "amem_stats":
        return handleStats();
      case "amem_delete":
        return handleDelete(args as any);
      case "amem_list":
        return handleList(args as any);
      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// === Tool Handlers ===

async function handleAdd(args: {
  content: string;
  keywords?: string[];
  context?: string;
  tags?: string[];
  category?: string;
}) {
  const memory = db.add({
    content: args.content,
    keywords: args.keywords || [],
    context: args.context || "",
    tags: args.tags || [],
    category: args.category || "general",
  });

  // Index in vector store
  await vector.addItem(
    memory.id,
    `${memory.content} ${memory.context} ${memory.keywords.join(" ")} ${memory.tags.join(" ")}`,
    { category: memory.category, memoryId: memory.id }
  );

  // Find similar existing memories
  let neighbors: Array<{ id: string; score: number }> = [];
  try {
    const similar = await vector.search(memory.content, 3);
    neighbors = similar
      .filter((s) => s.id !== memory.id && s.score > 0.5)
      .map((s) => ({ id: s.id, score: Math.round(s.score * 100) / 100 }));
  } catch {
    // Vector store may be empty on first add
  }

  const result: any = {
    memory,
    neighbors_found: neighbors.length,
  };

  if (neighbors.length > 0) {
    const neighborDetails = neighbors.map((n) => {
      const mem = db.get(n.id);
      return mem
        ? { id: n.id, score: n.score, content_preview: mem.content.slice(0, 100), tags: mem.tags }
        : null;
    }).filter(Boolean);

    result.similar_memories = neighborDetails;
    result.evolution_hint =
      `Found ${neighbors.length} similar memories. Consider calling amem_evolve with memory_id="${memory.id}" to analyze relationships and evolve the memory graph.`;
  }

  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
}

async function handleSearch(args: {
  query: string;
  k?: number;
  category?: string;
}) {
  const k = Math.min(args.k || 5, 20);

  // Semantic search via vectors
  const filter = args.category ? { category: args.category } : undefined;
  const vectorResults = await vector.search(args.query, k, filter);

  // Enrich with full memory data + linked memories
  const results = vectorResults.map((vr) => {
    const memory = db.get(vr.id);
    if (!memory) return null;

    const linked = db.getLinkedMemories(memory.id).map((lm) => ({
      id: lm.id,
      content_preview: lm.content.slice(0, 80),
      tags: lm.tags,
    }));

    return {
      id: memory.id,
      content: memory.content,
      context: memory.context,
      keywords: memory.keywords,
      tags: memory.tags,
      category: memory.category,
      similarity: Math.round(vr.score * 100) / 100,
      retrieval_count: memory.retrieval_count,
      created_at: memory.created_at,
      linked_memories: linked,
    };
  }).filter(Boolean);

  // Fallback to FTS if no vector results
  if (results.length === 0) {
    const ftsResults = db.searchFTS(args.query, k);
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          query: args.query,
          method: "full-text-search",
          total: ftsResults.length,
          results: ftsResults.map((m) => ({
            id: m.id,
            content: m.content,
            context: m.context,
            tags: m.tags,
            category: m.category,
          })),
        }, null, 2),
      }],
    };
  }

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        query: args.query,
        method: "semantic-similarity",
        total: results.length,
        results,
      }, null, 2),
    }],
  };
}

async function handleEvolve(args: { memory_id: string }) {
  const memory = db.get(args.memory_id);
  if (!memory) {
    return {
      content: [{ type: "text", text: `Memory not found: ${args.memory_id}` }],
      isError: true,
    };
  }

  // Find k=5 nearest neighbors
  const similar = await vector.search(memory.content, 6);
  const neighbors = similar
    .filter((s) => s.id !== memory.id)
    .slice(0, 5)
    .map((s) => {
      const mem = db.get(s.id);
      return mem
        ? {
            id: s.id,
            score: Math.round(s.score * 100) / 100,
            content: mem.content,
            context: mem.context,
            keywords: mem.keywords,
            tags: mem.tags,
            category: mem.category,
            links: mem.links,
          }
        : null;
    })
    .filter(Boolean);

  const evolutionContext = {
    target_memory: {
      id: memory.id,
      content: memory.content,
      context: memory.context,
      keywords: memory.keywords,
      tags: memory.tags,
      category: memory.category,
      links: memory.links,
    },
    neighbors,
    analysis_prompt: `Analyze the target memory and its ${neighbors.length} nearest neighbors.

Determine:
1. Should any existing memories be UPDATED with richer context based on the new memory?
2. Should LINKS be created between related memories?
3. Should TAGS be refined for better organization?

For each action, call amem_update with the specific changes. Example actions:
- Link target to neighbor: amem_update(id="${memory.id}", links=[${neighbors.map((n: any) => `"${n.id}"`).join(", ")}])
- Update neighbor context: amem_update(id="neighbor_id", context="enriched context")
- Refine tags: amem_update(id="memory_id", tags=["refined", "tags"])`,
  };

  return {
    content: [{
      type: "text",
      text: JSON.stringify(evolutionContext, null, 2),
    }],
  };
}

async function handleUpdate(args: {
  id: string;
  content?: string;
  keywords?: string[];
  context?: string;
  tags?: string[];
  links?: string[];
}) {
  const { id, ...updates } = args;

  const updated = db.update(id, updates);
  if (!updated) {
    return {
      content: [{ type: "text", text: `Memory not found: ${id}` }],
      isError: true,
    };
  }

  // Re-index in vector store
  await vector.addItem(
    updated.id,
    `${updated.content} ${updated.context} ${updated.keywords.join(" ")} ${updated.tags.join(" ")}`,
    { category: updated.category, memoryId: updated.id }
  );

  return {
    content: [{
      type: "text",
      text: JSON.stringify({ updated: true, memory: updated }, null, 2),
    }],
  };
}

async function handleStats() {
  const dbStats = db.stats();
  const vectorStats = await vector.getStats();

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        ...dbStats,
        vector_items: vectorStats.itemCount,
        most_accessed: dbStats.most_accessed.map((m) => ({
          id: m.id,
          content_preview: m.content.slice(0, 60),
          retrieval_count: m.retrieval_count,
        })),
        least_accessed: dbStats.least_accessed.map((m) => ({
          id: m.id,
          content_preview: m.content.slice(0, 60),
          retrieval_count: m.retrieval_count,
          last_accessed: m.last_accessed,
        })),
      }, null, 2),
    }],
  };
}

async function handleDelete(args: { id: string }) {
  const deleted = db.delete(args.id);
  if (!deleted) {
    return {
      content: [{ type: "text", text: `Memory not found: ${args.id}` }],
      isError: true,
    };
  }

  await vector.deleteItem(args.id);

  return {
    content: [{ type: "text", text: JSON.stringify({ deleted: true, id: args.id }) }],
  };
}

async function handleList(args: { category?: string; limit?: number }) {
  const limit = args.limit || 20;

  const memories = args.category
    ? db.getByCategory(args.category)
    : db.getAll();

  const results = memories.slice(0, limit).map((m) => ({
    id: m.id,
    content_preview: m.content.slice(0, 100) + (m.content.length > 100 ? "..." : ""),
    context: m.context,
    tags: m.tags,
    category: m.category,
    links_count: m.links.length,
    retrieval_count: m.retrieval_count,
    created_at: m.created_at,
  }));

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        total: memories.length,
        showing: results.length,
        category_filter: args.category || "all",
        memories: results,
      }, null, 2),
    }],
  };
}

// Start server
async function main() {
  await vector.init();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AMEM Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
