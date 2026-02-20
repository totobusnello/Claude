import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

export interface MemoryNote {
  id: string;
  content: string;
  keywords: string[];
  context: string;
  tags: string[];
  category: string;
  links: string[];
  created_at: string;
  updated_at: string;
  last_accessed: string;
  retrieval_count: number;
  evolution_history: Array<{ action: string; timestamp: string; details: string }>;
}

export class MemoryDatabase {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const resolvedPath = dbPath || path.join(
      process.env.HOME || "~",
      ".claude", "memory", "amem.db"
    );

    // Ensure directory exists
    const dir = path.dirname(resolvedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(resolvedPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
    this.init();
  }

  private init(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        keywords TEXT DEFAULT '[]',
        context TEXT DEFAULT '',
        tags TEXT DEFAULT '[]',
        category TEXT DEFAULT 'general',
        links TEXT DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        last_accessed TEXT NOT NULL,
        retrieval_count INTEGER DEFAULT 0,
        evolution_history TEXT DEFAULT '[]'
      );

      CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);
      CREATE INDEX IF NOT EXISTS idx_memories_created ON memories(created_at);
      CREATE INDEX IF NOT EXISTS idx_memories_accessed ON memories(last_accessed);
    `);

    // FTS5 for keyword search fallback
    this.db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts USING fts5(
        id UNINDEXED,
        content,
        keywords,
        tags,
        context,
        content='memories',
        content_rowid='rowid'
      );
    `);

    // Triggers to keep FTS in sync
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS memories_ai AFTER INSERT ON memories BEGIN
        INSERT INTO memories_fts(id, content, keywords, tags, context)
        VALUES (new.id, new.content, new.keywords, new.tags, new.context);
      END;

      CREATE TRIGGER IF NOT EXISTS memories_ad AFTER DELETE ON memories BEGIN
        INSERT INTO memories_fts(memories_fts, id, content, keywords, tags, context)
        VALUES ('delete', old.id, old.content, old.keywords, old.tags, old.context);
      END;

      CREATE TRIGGER IF NOT EXISTS memories_au AFTER UPDATE ON memories BEGIN
        INSERT INTO memories_fts(memories_fts, id, content, keywords, tags, context)
        VALUES ('delete', old.id, old.content, old.keywords, old.tags, old.context);
        INSERT INTO memories_fts(id, content, keywords, tags, context)
        VALUES (new.id, new.content, new.keywords, new.tags, new.context);
      END;
    `);
  }

  add(note: Partial<MemoryNote> & { content: string }): MemoryNote {
    const now = new Date().toISOString();
    const memory: MemoryNote = {
      id: note.id || `mem_${uuidv4().slice(0, 8)}`,
      content: note.content,
      keywords: note.keywords || [],
      context: note.context || "",
      tags: note.tags || [],
      category: note.category || "general",
      links: note.links || [],
      created_at: now,
      updated_at: now,
      last_accessed: now,
      retrieval_count: 0,
      evolution_history: [],
    };

    this.db.prepare(`
      INSERT INTO memories (id, content, keywords, context, tags, category, links,
        created_at, updated_at, last_accessed, retrieval_count, evolution_history)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      memory.id,
      memory.content,
      JSON.stringify(memory.keywords),
      memory.context,
      JSON.stringify(memory.tags),
      memory.category,
      JSON.stringify(memory.links),
      memory.created_at,
      memory.updated_at,
      memory.last_accessed,
      memory.retrieval_count,
      JSON.stringify(memory.evolution_history),
    );

    return memory;
  }

  get(id: string): MemoryNote | null {
    const row = this.db.prepare("SELECT * FROM memories WHERE id = ?").get(id) as any;
    if (!row) return null;

    // Update access stats
    this.db.prepare(`
      UPDATE memories SET last_accessed = ?, retrieval_count = retrieval_count + 1 WHERE id = ?
    `).run(new Date().toISOString(), id);

    return this.parseRow(row);
  }

  update(id: string, updates: Partial<MemoryNote>): MemoryNote | null {
    const existing = this.get(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const sets: string[] = ["updated_at = ?"];
    const values: any[] = [now];

    if (updates.content !== undefined) {
      sets.push("content = ?");
      values.push(updates.content);
    }
    if (updates.keywords !== undefined) {
      sets.push("keywords = ?");
      values.push(JSON.stringify(updates.keywords));
    }
    if (updates.context !== undefined) {
      sets.push("context = ?");
      values.push(updates.context);
    }
    if (updates.tags !== undefined) {
      sets.push("tags = ?");
      values.push(JSON.stringify(updates.tags));
    }
    if (updates.category !== undefined) {
      sets.push("category = ?");
      values.push(updates.category);
    }
    if (updates.links !== undefined) {
      sets.push("links = ?");
      values.push(JSON.stringify(updates.links));
    }

    // Add evolution entry
    const history = existing.evolution_history || [];
    history.push({
      action: "update",
      timestamp: now,
      details: `Updated fields: ${Object.keys(updates).join(", ")}`,
    });
    sets.push("evolution_history = ?");
    values.push(JSON.stringify(history));

    values.push(id);

    this.db.prepare(`UPDATE memories SET ${sets.join(", ")} WHERE id = ?`).run(...values);
    return this.get(id);
  }

  delete(id: string): boolean {
    const result = this.db.prepare("DELETE FROM memories WHERE id = ?").run(id);
    return result.changes > 0;
  }

  searchFTS(query: string, limit: number = 10): MemoryNote[] {
    const rows = this.db.prepare(`
      SELECT m.* FROM memories m
      JOIN memories_fts fts ON m.id = fts.id
      WHERE memories_fts MATCH ?
      ORDER BY rank
      LIMIT ?
    `).all(query, limit) as any[];

    return rows.map((r) => this.parseRow(r));
  }

  getAll(): MemoryNote[] {
    const rows = this.db.prepare("SELECT * FROM memories ORDER BY created_at DESC").all() as any[];
    return rows.map((r) => this.parseRow(r));
  }

  getByCategory(category: string): MemoryNote[] {
    const rows = this.db.prepare(
      "SELECT * FROM memories WHERE category = ? ORDER BY created_at DESC"
    ).all(category) as any[];
    return rows.map((r) => this.parseRow(r));
  }

  getLinkedMemories(id: string): MemoryNote[] {
    const memory = this.get(id);
    if (!memory || memory.links.length === 0) return [];

    const placeholders = memory.links.map(() => "?").join(",");
    const rows = this.db.prepare(
      `SELECT * FROM memories WHERE id IN (${placeholders})`
    ).all(...memory.links) as any[];

    return rows.map((r) => this.parseRow(r));
  }

  stats(): {
    total: number;
    by_category: Record<string, number>;
    most_accessed: MemoryNote[];
    least_accessed: MemoryNote[];
    stale_count: number;
  } {
    const total = (this.db.prepare("SELECT COUNT(*) as c FROM memories").get() as any).c;

    const categories = this.db.prepare(
      "SELECT category, COUNT(*) as c FROM memories GROUP BY category"
    ).all() as any[];
    const by_category: Record<string, number> = {};
    for (const cat of categories) {
      by_category[cat.category] = cat.c;
    }

    const most_accessed = (this.db.prepare(
      "SELECT * FROM memories ORDER BY retrieval_count DESC LIMIT 5"
    ).all() as any[]).map((r) => this.parseRow(r));

    const least_accessed = (this.db.prepare(
      "SELECT * FROM memories ORDER BY retrieval_count ASC LIMIT 5"
    ).all() as any[]).map((r) => this.parseRow(r));

    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - 90);
    const stale_count = (this.db.prepare(
      "SELECT COUNT(*) as c FROM memories WHERE last_accessed < ?"
    ).get(staleDate.toISOString()) as any).c;

    return { total, by_category, most_accessed, least_accessed, stale_count };
  }

  private parseRow(row: any): MemoryNote {
    return {
      id: row.id,
      content: row.content,
      keywords: JSON.parse(row.keywords || "[]"),
      context: row.context || "",
      tags: JSON.parse(row.tags || "[]"),
      category: row.category || "general",
      links: JSON.parse(row.links || "[]"),
      created_at: row.created_at,
      updated_at: row.updated_at,
      last_accessed: row.last_accessed,
      retrieval_count: row.retrieval_count || 0,
      evolution_history: JSON.parse(row.evolution_history || "[]"),
    };
  }

  close(): void {
    this.db.close();
  }
}
