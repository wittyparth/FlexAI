
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
      whereConditions.push(`difficulty = '${filters.difficulty}'`);
    }

    // Equipment filter (simplified: if list provided, must match one of/contain - conceptual)
    // Since equipment is an array in DB (String[]), we check overlap.
    if (filters.equipment && filters.equipment.length > 0) {
      // Postgres array overlap operator &&
      const equipmentArrayLiteral = `{${filters.equipment.map(e => `"${e}"`).join(",")}}`;
      whereConditions.push(`equipment && '${equipmentArrayLiteral}'`);
    }

    if (filters.muscleGroups && filters.muscleGroups.length > 0) {
        const muscleGroupArrayLiteral = `{${filters.muscleGroups.map(m => `"${m}"`).join(",")}}`;
        whereConditions.push(`"primaryMuscleGroups" && '${muscleGroupArrayLiteral}'`);
    }

    const whereClause = whereConditions.join(" AND ");

    // Execute raw query using pgvector operator <=> (cosine distance)
    // We order by distance ASC (closest first)
    const query = `
      SELECT id, name, description, equipment, difficulty, "primaryMuscleGroups",
             1 - (embedding <=> '${vectorString}'::vector) as similarity
      FROM "exercises"
      WHERE ${whereClause}
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
