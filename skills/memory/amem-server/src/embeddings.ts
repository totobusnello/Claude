/**
 * Embedding providers for A-MEM semantic search.
 *
 * Fallback chain: OpenAI → Ollama → Hash (offline)
 * No external npm dependencies — uses native fetch() (Node v24+).
 */

// ─── Interfaces ──────────────────────────────────────────────

export interface EmbeddingProvider {
  readonly name: string;
  readonly dimensions: number;
  embed(text: string): Promise<number[]>;
  embedBatch?(texts: string[]): Promise<number[][]>;
}

// ─── OpenAI Provider (1536-dim) ──────────────────────────────

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly name = "openai";
  readonly dimensions = 1536;
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(
    apiKey: string,
    model: string = "text-embedding-3-small",
    baseUrl: string = "https://api.openai.com/v1"
  ) {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = baseUrl;
  }

  async embed(text: string): Promise<number[]> {
    const batch = await this.embedBatch([text]);
    return batch[0];
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: texts,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      throw new Error(
        `OpenAI Embeddings API error ${response.status}: ${errBody}`
      );
    }

    const data = (await response.json()) as {
      data: Array<{ embedding: number[]; index: number }>;
    };

    // Sort by index to preserve order
    return data.data
      .sort((a, b) => a.index - b.index)
      .map((d) => d.embedding);
  }
}

// ─── Ollama Provider (768-dim) ───────────────────────────────

export class OllamaEmbeddingProvider implements EmbeddingProvider {
  readonly name = "ollama";
  readonly dimensions = 768;
  private model: string;
  private baseUrl: string;

  constructor(
    model: string = "nomic-embed-text",
    baseUrl: string = "http://localhost:11434"
  ) {
    this.model = model;
    this.baseUrl = baseUrl;
  }

  async embed(text: string): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        prompt: text,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      throw new Error(
        `Ollama Embeddings API error ${response.status}: ${errBody}`
      );
    }

    const data = (await response.json()) as { embedding: number[] };
    return data.embedding;
  }
}

// ─── Hash Provider (384-dim, offline fallback) ───────────────

export class HashEmbeddingProvider implements EmbeddingProvider {
  readonly name = "hash";
  readonly dimensions = 384;

  async embed(text: string): Promise<number[]> {
    return textToVector(text, this.dimensions);
  }
}

/**
 * Deterministic word hashing + bigrams → vector.
 * Moved here from vector.ts — serves as offline fallback.
 */
function textToVector(text: string, dimensions: number = 384): number[] {
  const vector = new Float64Array(dimensions);
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return Array.from(vector);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = ((hash << 5) - hash + word.charCodeAt(j)) | 0;
    }

    for (let k = 0; k < 3; k++) {
      const pos = Math.abs((hash * (k + 1) * 31) % dimensions);
      const sign = ((hash * (k + 1)) & 1) === 0 ? 1 : -1;
      vector[pos] += sign * (1.0 / Math.sqrt(words.length));
    }

    if (i > 0) {
      const bigram = words[i - 1] + "_" + word;
      let bigramHash = 0;
      for (let j = 0; j < bigram.length; j++) {
        bigramHash =
          ((bigramHash << 5) - bigramHash + bigram.charCodeAt(j)) | 0;
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

// ─── LRU Cache ───────────────────────────────────────────────

interface CacheEntry {
  vector: number[];
  timestamp: number;
}

class EmbeddingCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private ttlMs: number;

  constructor(maxSize: number = 500, ttlMinutes: number = 60) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  get(key: string): number[] | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (LRU refresh)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.vector;
  }

  set(key: string, vector: number[]): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) {
        this.cache.delete(oldest);
      }
    }
    this.cache.set(key, { vector, timestamp: Date.now() });
  }

  get size(): number {
    return this.cache.size;
  }

  clear(): void {
    this.cache.clear();
  }
}

// ─── CachedEmbedder (wrapper) ────────────────────────────────

export class CachedEmbedder {
  readonly provider: EmbeddingProvider;
  private cache: EmbeddingCache;

  constructor(provider: EmbeddingProvider, cacheSize: number = 500) {
    this.provider = provider;
    this.cache = new EmbeddingCache(cacheSize);
  }

  get name(): string {
    return this.provider.name;
  }

  get dimensions(): number {
    return this.provider.dimensions;
  }

  async embed(text: string): Promise<number[]> {
    const key = text.trim().toLowerCase().slice(0, 500); // Normalize key
    const cached = this.cache.get(key);
    if (cached) return cached;

    const vector = await this.provider.embed(text);
    this.cache.set(key, vector);
    return vector;
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

// ─── Factory with auto-detection ─────────────────────────────

export type ProviderChoice = "openai" | "ollama" | "hash" | "auto";

/**
 * Initialize the best available embedding provider.
 *
 * When `choice` is "auto" (default):
 *   1. Try OpenAI if OPENAI_API_KEY is set
 *   2. Try Ollama if running on localhost:11434
 *   3. Fall back to Hash (always works, offline)
 */
export async function initEmbedder(
  choice: ProviderChoice = "auto"
): Promise<CachedEmbedder> {
  // Explicit provider selection
  if (choice === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not set");
    const provider = new OpenAIEmbeddingProvider(apiKey);
    await testProvider(provider);
    return new CachedEmbedder(provider);
  }

  if (choice === "ollama") {
    const provider = new OllamaEmbeddingProvider();
    await testProvider(provider);
    return new CachedEmbedder(provider);
  }

  if (choice === "hash") {
    return new CachedEmbedder(new HashEmbeddingProvider());
  }

  // Auto-detection chain
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const provider = new OpenAIEmbeddingProvider(apiKey);
      await testProvider(provider);
      console.error("[amem] Embedding provider: openai (text-embedding-3-small, 1536-dim)");
      return new CachedEmbedder(provider);
    } catch (e: any) {
      console.error(`[amem] OpenAI embeddings unavailable: ${e.message}`);
    }
  }

  // Try Ollama
  try {
    const provider = new OllamaEmbeddingProvider();
    await testProvider(provider);
    console.error("[amem] Embedding provider: ollama (nomic-embed-text, 768-dim)");
    return new CachedEmbedder(provider);
  } catch (e: any) {
    console.error(`[amem] Ollama embeddings unavailable: ${e.message}`);
  }

  // Fallback to hash
  console.error("[amem] Embedding provider: hash (word-hashing, 384-dim) — offline fallback");
  return new CachedEmbedder(new HashEmbeddingProvider());
}

/**
 * Quick smoke test: embed a short string and verify dimension count.
 */
async function testProvider(provider: EmbeddingProvider): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const vec = await Promise.race([
      provider.embed("test"),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener("abort", () =>
          reject(new Error("Provider test timed out after 5s"))
        );
      }),
    ]);

    if (!Array.isArray(vec) || vec.length !== provider.dimensions) {
      throw new Error(
        `Expected ${provider.dimensions}-dim vector, got ${vec?.length ?? "null"}`
      );
    }
  } finally {
    clearTimeout(timeout);
  }
}
