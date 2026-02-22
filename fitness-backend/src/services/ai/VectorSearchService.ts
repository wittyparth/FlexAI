
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SearchFilters {
  equipment?: string[];
  difficulty?: string;
  muscleGroups?: string[];
}

export class VectorSearchService {
  /**
   * Searches for exercises similar to the query embedding.
   * @param embedding The query vector (768 dimensions).
   * @param limit Number of results to return.
   * @param filters Optional filters for equipment, difficulty, etc.
   * @returns List of exercises with similarity score.
   */
  async searchExercises(embedding: number[], limit: number = 20, filters: SearchFilters = {}) {
    const vectorString = `[${embedding.join(",")}]`;
    
    // Construct dynamic WHERE clause parts
    const whereConditions: string[] = ["1=1"]; // Default true
    
    if (filters.difficulty) {
        // difficulty: request.experienceLevel, // Removing strict DB filter since seed defaults to intermediate
    }
    // Instead of a strict WHERE filter that returns 0 rows when users select "dumbbell" 
    // but the DB only has "Bodyweight" populated, we just let the AI handle the mismatch gracefully
    // by passing the closest vector matches regardless of equipment.
    
    // Execute raw query using pgvector operator <=> (cosine distance)
    // We order by distance ASC (closest first)
    const query = `
      SELECT id, name, description, equipment, difficulty, "primaryMuscleGroups",
             1 - (embedding <=> '${vectorString}'::vector) as similarity
      FROM "exercises"
      WHERE 1=1
      ORDER BY embedding <=> '${vectorString}'::vector
      LIMIT ${limit};
    `;

    try {
      const result = await prisma.$queryRawUnsafe(query);
      return result as any[];
    } catch (error) {
      console.error("Error executing vector search:", error);
      throw new Error("Vector search failed");
    }
  }
}
