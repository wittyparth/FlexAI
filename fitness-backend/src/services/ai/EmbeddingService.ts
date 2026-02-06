
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

export class EmbeddingService {
  /**
   * Generates an embedding vector for a single string of text.
   * @param text The text to embed.
   * @returns An array of numbers representing the embedding vector (768 dimensions).
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }

    try {
      const result = await model.embedContent(text);
      const embedding = result.embedding;
      return embedding.values;
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw new Error("Failed to generate embedding");
    }
  }

  /**
   * Generates embeddings for multiple strings in batch.
   * Note: Gemini API might have limits on batch size, handled here sequentially or batched if API supports.
   * text-embedding-004 supports batching via `batchEmbedContents` but strictly we can map for now.
   * @param texts Array of strings.
   * @returns Array of embedding vectors.
   */
  async generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
      // For simplicity and to avoid hitting complex batch limits immediately, map parallel.
      // In production, consider rate limiting or using the specific batch endpoint if volume is high.
      return Promise.all(texts.map(text => this.generateEmbedding(text)));
  }
}
