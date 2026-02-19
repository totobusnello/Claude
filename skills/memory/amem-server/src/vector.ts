import { LocalIndex } from "vectra";
import path from "path";
import fs from "fs";

// Simple local embeddings using TF-IDF-like hashing
// No external API needed - deterministic and fast
function textToVector(text: string, dimensions: number = 384): number[] {
  const vector = new Float64Array(dimensions);
  const words = text.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);

  if (words.length === 0) return Array.from(vector);

  // Hash each word to a position and accumulate
  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // Simple hash function to map word to vector positions
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = ((hash << 5) - hash + word.charCodeAt(j)) | 0;
    }

    // Use multiple hash positions for each word (simulates richer embeddings)
    for (let k = 0; k < 3; k++) {
      const pos = Math.abs((hash * (k + 1) * 31) % dimensions);
      const sign = ((hash * (k + 1)) & 1) === 0 ? 1 : -1;
      // TF component: weight by 1/sqrt(word_count) for normalization
      vector[pos] += sign * (1.0 / Math.sqrt(words.length));
    }

    // Bigram features (word pairs for context)
    if (i > 0) {
      const bigram = words[i - 1] + "_" + word;
      let bigramHash = 0;
      for (let j = 0; j < bigram.length; j++) {
        bigramHash = ((bigramHash << 5) - bigramHash + bigram.charCodeAt(j)) | 0;
      }
      const biPos = Math.abs((bigramHash * 17) % dimensions);
      vector[biPos] += 0.5 / Math.sqrt(words.length);
    }
  }

  // L2 normalize
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] /= norm;
    }
  }

  return Array.from(vector);
}

export class VectorStore {
  private index: LocalIndex;
  private ready: boolean = false;

  constructor(vectorPath?: string) {
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

    const vector = textToVector(text);

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

    const queryVector = textToVector(query);

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
}
