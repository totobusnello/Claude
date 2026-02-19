import initSqlJs, { Database as SqlJsDatabase } from "sql.js";
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
  private db!: SqlJsDatabase;
  private dbPath: string;
  private ready: boolean = false;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(
      process.env.HOME || "~",
      ".claude", "memory", "amem.db"
    );
  }

  async init(): Promise<void> {
    if (this.ready) return;

    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const SQL = await initSqlJs();

    // Load existing DB or create new
    if (fs.existsSync(this.dbPath)) {
      const buffer = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(buffer);
    } else {
      this.db = new SQL.Database();
    }

    this.createTables();
    this.ready = true;
  }

  private createTables(): void {
    this.db.run(`
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
      )
    `);

    this.db.run(`CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_memories_created ON memories(created_at)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_memories_accessed ON memories(last_accessed)`);
  }

  private save(): void {
    // Debounced save - batches rapid writes
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.saveNow();
    }, 100);
  }

  private saveNow(): void {
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.dbPath, buffer);
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

    this.db.run(
      `INSERT INTO memories (id, content, keywords, context, tags, category, links,
        created_at, updated_at, last_accessed, retrieval_count, evolution_history)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
      ]
    );

    this.save();
    return memory;
  }

  get(id: string): MemoryNote | null {
    const stmt = this.db.prepare("SELECT * FROM memories WHERE id = ?");
    stmt.bind([id]);

    if (!stmt.step()) {
      stmt.free();
      return null;
    }

    const row = stmt.getAsObject();
    stmt.free();

    // Update access stats
    this.db.run(
      `UPDATE memories SET last_accessed = ?, retrieval_count = retrieval_count + 1 WHERE id = ?`,
      [new Date().toISOString(), id]
    );
    this.save();

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

    this.db.run(`UPDATE memories SET ${sets.join(", ")} WHERE id = ?`, values);
    this.save();

    return this.get(id);
  }

  delete(id: string): boolean {
    const before = this.db.getRowsModified();
    this.db.run("DELETE FROM memories WHERE id = ?", [id]);
    const after = this.db.getRowsModified();
    this.save();
    return after > 0;
  }

  searchFTS(query: string, limit: number = 10): MemoryNote[] {
    // sql.js doesn't support FTS5, use LIKE-based search instead
    const terms = query.split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];

    const conditions = terms.map(() =>
      "(content LIKE ? OR keywords LIKE ? OR tags LIKE ? OR context LIKE ?)"
    ).join(" AND ");

    const params: string[] = [];
    for (const term of terms) {
      const like = `%${term}%`;
      params.push(like, like, like, like);
    }

    const rows: any[] = [];
    const stmt = this.db.prepare(
      `SELECT * FROM memories WHERE ${conditions} ORDER BY created_at DESC LIMIT ?`
    );
    stmt.bind([...params, limit]);

    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();

    return rows.map((r) => this.parseRow(r));
  }

  getAll(): MemoryNote[] {
    const rows: any[] = [];
    const stmt = this.db.prepare("SELECT * FROM memories ORDER BY created_at DESC");

    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();

    return rows.map((r) => this.parseRow(r));
  }

  getByCategory(category: string): MemoryNote[] {
    const rows: any[] = [];
    const stmt = this.db.prepare(
      "SELECT * FROM memories WHERE category = ? ORDER BY created_at DESC"
    );
    stmt.bind([category]);

    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();

    return rows.map((r) => this.parseRow(r));
  }

  getLinkedMemories(id: string): MemoryNote[] {
    const memory = this.get(id);
    if (!memory || memory.links.length === 0) return [];

    const placeholders = memory.links.map(() => "?").join(",");
    const rows: any[] = [];
    const stmt = this.db.prepare(
      `SELECT * FROM memories WHERE id IN (${placeholders})`
    );
    stmt.bind(memory.links);

    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();

    return rows.map((r) => this.parseRow(r));
  }

  stats(): {
    total: number;
    by_category: Record<string, number>;
    most_accessed: MemoryNote[];
    least_accessed: MemoryNote[];
    stale_count: number;
  } {
    // Total count
    const totalStmt = this.db.prepare("SELECT COUNT(*) as c FROM memories");
    totalStmt.step();
    const total = (totalStmt.getAsObject() as any).c as number;
    totalStmt.free();

    // Categories
    const by_category: Record<string, number> = {};
    const catStmt = this.db.prepare(
      "SELECT category, COUNT(*) as c FROM memories GROUP BY category"
    );
    while (catStmt.step()) {
      const row = catStmt.getAsObject() as any;
      by_category[row.category as string] = row.c as number;
    }
    catStmt.free();

    // Most accessed
    const mostRows: any[] = [];
    const mostStmt = this.db.prepare(
      "SELECT * FROM memories ORDER BY retrieval_count DESC LIMIT 5"
    );
    while (mostStmt.step()) {
      mostRows.push(mostStmt.getAsObject());
    }
    mostStmt.free();
    const most_accessed = mostRows.map((r) => this.parseRow(r));

    // Least accessed
    const leastRows: any[] = [];
    const leastStmt = this.db.prepare(
      "SELECT * FROM memories ORDER BY retrieval_count ASC LIMIT 5"
    );
    while (leastStmt.step()) {
      leastRows.push(leastStmt.getAsObject());
    }
    leastStmt.free();
    const least_accessed = leastRows.map((r) => this.parseRow(r));

    // Stale count
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - 90);
    const staleStmt = this.db.prepare(
      "SELECT COUNT(*) as c FROM memories WHERE last_accessed < ?"
    );
    staleStmt.bind([staleDate.toISOString()]);
    staleStmt.step();
    const stale_count = (staleStmt.getAsObject() as any).c as number;
    staleStmt.free();

    return { total, by_category, most_accessed, least_accessed, stale_count };
  }

  private parseRow(row: any): MemoryNote {
    return {
      id: row.id as string,
      content: row.content as string,
      keywords: JSON.parse((row.keywords as string) || "[]"),
      context: (row.context as string) || "",
      tags: JSON.parse((row.tags as string) || "[]"),
      category: (row.category as string) || "general",
      links: JSON.parse((row.links as string) || "[]"),
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      last_accessed: row.last_accessed as string,
      retrieval_count: (row.retrieval_count as number) || 0,
      evolution_history: JSON.parse((row.evolution_history as string) || "[]"),
    };
  }

  close(): void {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveNow();
    this.db.close();
  }
}
