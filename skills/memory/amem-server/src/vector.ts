import { LocalIndex } from "vectra";
import path from "path";
import fs from "fs";
import { CachedEmbedder } from "./embeddings.js";

export class VectorStore {
  private index: LocalIndex;
  private ready: boolean = false;
  private embedder: CachedEmbedder;

  constructor(embedder: CachedEmbedder, vectorPath?: string) {
    this.embedder = embedder;

    const resolvedPath = vectorPath || path.join(
      process.env.HOME || "~",
      ".claude", "memory", "amem-vectors"
    );

    if (!fs.existsSync(resolvedPath)) {
      fs.mkdirSync(resolvedPath, { recursive: true });
    }

    this.index = new LocalIndex(resolvedPath);
  }

  async init(): Promise<void> {
    if (this.ready) return;

    if (!await this.index.isIndexCreated()) {
      await this.index.createIndex();
    }

    this.ready = true;
  }

  async addItem(id: string, text: string, metadata: Record<string, any> = {}): Promise<void> {
    await this.init();

    // Delete existing item if present
    try {
      const existing = await this.index.getItem(id);
      if (existing) {
        await this.index.deleteItem(id);
      }
    } catch {
      // Item didn't exist, that's fine
    }

    const vector = await this.embedder.embed(text);

    await this.index.upsertItem({
      id,
      vector,
      metadata: { ...metadata, memoryId: id },
    });
  }

  async search(
    query: string,
    k: number = 5,
    filter?: Record<string, any>
  ): Promise<Array<{ id: string; score: number; metadata: Record<string, any> }>> {
    await this.init();

    const queryVector = await this.embedder.embed(query);

    // Build MetadataFilter if filter provided
    let metadataFilter: any = undefined;
    if (filter) {
      const conditions = Object.entries(filter).map(([key, value]) => ({
        [key]: { $eq: value },
      }));
      if (conditions.length === 1) {
        metadataFilter = conditions[0];
      } else if (conditions.length > 1) {
        metadataFilter = { $and: conditions };
      }
    }

    const results = await this.index.queryItems(queryVector, k, metadataFilter);

    return results.map((r) => ({
      id: r.item.id,
      score: r.score,
      metadata: r.item.metadata as Record<string, any>,
    }));
  }

  async deleteItem(id: string): Promise<void> {
    await this.init();

    const item = await this.index.getItem(id);
    if (item) {
      await this.index.deleteItem(id);
    }
  }

  async getStats(): Promise<{ itemCount: number }> {
    await this.init();
    const items = await this.index.listItems();
    return { itemCount: items.length };
  }

  getDimensions(): number {
    return this.embedder.dimensions;
  }

  getProviderName(): string {
    return this.embedder.name;
  }
}
