
import { GoogleGenAI } from "@google/genai";
import { EmbeddingService } from "./EmbeddingService";
import { VectorSearchService } from "./VectorSearchService";



const embeddingService = new EmbeddingService();
const vectorSearchService = new VectorSearchService();

interface GenerationRequest {
  goal: string;
  duration: number; // minutes
  equipment: string[];
  experienceLevel: string;
  injuries?: string;
  preferences?: string;
  userId: number;
}

export class WorkoutGenerationService {
  async generateWorkout(request: GenerationRequest) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    // 1. Construct search query from requirements
    // We combine key factors to find semantically relevant exercises
    const searchQuery = `
      Workout for ${request.experienceLevel} level.
      Goal: ${request.goal}.
      Equipment: ${request.equipment.join(", ")}.
      ${request.preferences || ""}
    `.trim();

    // 2. Generate embedding for query
    const queryEmbedding = await embeddingService.generateEmbedding(searchQuery);

    // Normalize equipment and ignore "full gym" as a strict filter restriction
    const normalizedEquipment = request.equipment.map(e => e.toLowerCase().trim().replace('-', ' '));
    const isFullGym = normalizedEquipment.some(e => e === "full gym" || e === "any" || e === "all");
    const equipmentFilter = isFullGym ? [] : normalizedEquipment;

    // 3. Search for relevant exercises (RAG Retrieval)
    // We select top 30 to give AI enough variety to choose from
    const relevantExercises = await vectorSearchService.searchExercises(
      queryEmbedding, 
      30, 
      {
        equipment: equipmentFilter,
        // difficulty: request.experienceLevel, // Removing strict DB filter since seed data defaults to intermediate
        // For simplicity search service applies these strictly if provided
      }
    );

    if (relevantExercises.length === 0) {
        throw new Error("No suitable exercises found matching criteria.");
    }

    // 4. Construct Prompt (RAG Augmentation)
    const exerciseList = relevantExercises.map((ex: any) => 
        `- ID: ${ex.id}, Name: ${ex.name}, Muscle: ${ex.primaryMuscleGroups.join(", ")}, Difficulty: ${ex.difficulty}`
    ).join("\n");

    const prompt = `
      You are an expert fitness coach. Create a ${request.duration}-minute workout.
      
      User Profile:
      - Goal: ${request.goal}
      - Level: ${request.experienceLevel}
      - Equipment: ${request.equipment.join(", ")}
      - Injuries/Notes: ${request.injuries || "None"}

      AVAILABLE EXERCISES (Select ONLY from this list):
      ${exerciseList}

      INSTRUCTIONS:
      1. Create a balanced workout including Warm-up, Main Circuit/Sets, and Cool-down.
      2. Use ONLY the provided Exercise IDs. Do not invent exercises.
      3. Reps should be a range (e.g., "10-12") or time (e.g., "60s").
      4. Rest times in seconds.
      5. Ensure total time fits ${request.duration} minutes.

      OUTPUT FORMAT (JSON ONLY):
      {
        "workoutName": "String",
        "description": "String",
        "warmup": [ { "exerciseId": Number, "sets": Number, "reps": "String", "rest": Number, "notes": "String" } ],
        "main": [ { "exerciseId": Number, "sets": Number, "reps": "String", "rest": Number, "notes": "String" } ],
        "cooldown": [ { "exerciseId": Number, "sets": Number, "reps": "String", "rest": Number, "notes": "String" } ]
      }
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });
        const responseText = response.text;
        const workoutData = JSON.parse(responseText || "{}");

        // 6. Basic Validation (Optional but recommended)
        // Verify IDs exist in relevantExercises to be safe
        const validIds = new Set(relevantExercises.map((e: any) => e.id));
        // Function to validate section
        const validateSection = (section: any[]) => {
            return section.filter(item => validIds.has(item.exerciseId));
        };

        workoutData.warmup = validateSection(workoutData.warmup || []);
        workoutData.main = validateSection(workoutData.main || []);
        workoutData.cooldown = validateSection(workoutData.cooldown || []);

        return workoutData;

    } catch (error) {
        console.error("AI Generation failed:", error);
        throw new Error("Failed to generate workout plan.");
    }
  }
}

export const workoutGenerationService = new WorkoutGenerationService();

