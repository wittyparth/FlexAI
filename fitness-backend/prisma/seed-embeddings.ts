import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables explicitly for the script
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateEmbeddings() {
  console.log('Fetching exercises missing embeddings...');
  const exercises = await prisma.$queryRawUnsafe<any[]>(`
    SELECT id, name, description, "primaryMuscleGroups", equipment, difficulty 
    FROM "exercises" 
    WHERE embedding IS NULL
  `);

  console.log(`Found ${exercises.length} exercises needing embeddings. Embedding them in chunks...`);

  const chunkSize = 15; // API strict rate limits
  for (let i = 0; i < exercises.length; i += chunkSize) {
    const chunk = exercises.slice(i, i + chunkSize);
    console.log(`Processing chunk ${i / chunkSize + 1} of ${Math.ceil(exercises.length / chunkSize)}...`);

    const textsToEmbed = chunk.map(ex => {
      return `Exercise: ${ex.name}. Description: ${ex.description}. Primary Muscles: ${ex.primaryMuscleGroups.join(', ')}. Equipment: ${ex.equipment.join(', ')}. Difficulty: ${ex.difficulty}.`;
    });

    let response;
    let retries = 0;
    const maxRetries = 5;
    
    while (retries < maxRetries) {
      try {
        response = await ai.models.embedContent({
          model: 'gemini-embedding-001',
          contents: textsToEmbed,
        });
        break; // Success, exit retry loop
      } catch (error: any) {
        if (error?.status === 429) {
          retries++;
          const waitTime = Math.min(10000 * Math.pow(2, retries), 60000); // Max 60s
          console.warn(`[429 Rate Limit] Retrying chunk ${i / chunkSize + 1} in ${waitTime/1000}s... (Attempt ${retries}/${maxRetries})`);
          await new Promise(res => setTimeout(res, waitTime));
        } else {
          console.error(`Failed chunk ${i / chunkSize + 1} with unrecoverable error:`, error.message);
          throw error;
        }
      }
    }

    if (!response) {
       console.error(`Failed chunk ${i / chunkSize + 1} after ${maxRetries} retries. Skipping.`);
       continue;
    }

    try {

      const embeddings = response.embeddings;
      
      if (!embeddings || embeddings.length !== chunk.length) {
          console.error(`Mismatch in expected embedding lengths. Expected ${chunk.length}, got ${embeddings?.length}. Skipping chunk.`);
          continue;
      }

      for (let j = 0; j < chunk.length; j++) {
        const exerciseId = chunk[j].id;
        let vector = embeddings[j]?.values;
        if (!vector) continue;

        // Truncate to 768 dimensions since schema.prisma defines vector(768)
        // gemini-embedding-001 supports Matryoshka Representation Learning so truncation is valid.
        if (vector.length > 768) {
            vector = vector.slice(0, 768);
        }

        const vectorString = `[${vector.join(',')}]`;
        
        await prisma.$executeRawUnsafe(`
          UPDATE "exercises" 
          SET embedding = '${vectorString}'::vector 
          WHERE id = ${exerciseId}
        `);
      }
      
      console.log(`Successfully updated embeddings for ${chunk.length} exercises.`);
      
      // Delay to respect rate limits (Gemini standard 15 RPM limit)
      await new Promise(resolve => setTimeout(resolve, 4500));
      
    } catch (error: any) {
       console.error(`Failed Database Transaction for chunk ${i}:`, error.message);
    }
  }

  console.log('Embedding generation complete!');
}

generateEmbeddings()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
