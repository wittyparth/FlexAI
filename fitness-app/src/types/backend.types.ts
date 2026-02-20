/**
 * BACKEND TYPE CONTRACT
 * 
 * This file strictly mirrors the Zod schemas from the backend.
 * Source: fitness-backend/src/schemas/*.schema.ts
 */

// ============================================================================
// WORKOUT TYPES
// ============================================================================

export interface LogSetInput {
  weight?: number;
  reps?: number;
  rpe?: number;
  rir?: number;
  setType?: 'warmup' | 'working' | 'drop' | 'failure' | 'amrap'; // default: 'working'
  tempoEccentric?: number;
  tempoPause?: number;
  tempoConcentric?: number;
  restTaken?: number;
}

export type UpdateSetInput = Partial<LogSetInput>;

export interface StartWorkoutInput {
  name?: string;
  routineId?: number;
  notes?: string;
}

export interface UpdateWorkoutInput {
  name?: string;
  notes?: string;
  energyLevel?: number; // 1-10
  sleepQuality?: number; // 1-10
  stressLevel?: number; // 1-10
}

export interface CompleteWorkoutInput {
  notes?: string;
  energyLevel?: number;
  sleepQuality?: number;
  stressLevel?: number;
}

export interface AddExerciseToWorkoutInput {
  exerciseId: number;
  notes?: string;
}

export interface GetWorkoutsQuery {
  page?: number;
  limit?: number;
  status?: 'in_progress' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// EXERCISE TYPES
// ============================================================================

export interface ExerciseQueryParams {
  page?: number;
  limit?: number;
  muscleGroup?: string;
  equipment?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  exerciseType?: 'strength' | 'cardio' | 'flexibility' | 'stretching';
  exerciseClass?: 'compound' | 'isolation';
  trainingGoal?: string;
  hasFormCheck?: boolean;
  isFeatured?: boolean;
  search?: string;
  sortBy?: 'name' | 'difficulty' | 'popularity' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// ROUTINE TYPES
// ============================================================================

export interface CreateRoutineInput {
  name: string;
  description?: string;
  daysPerWeek?: number;
  schedule?: {
    monday?: boolean;
    tuesday?: boolean;
    wednesday?: boolean;
    thursday?: boolean;
    friday?: boolean;
    saturday?: boolean;
    sunday?: boolean;
  };
  estimatedDuration?: number; // minutes
  goal?: 'muscle_gain' | 'strength' | 'fat_loss' | 'endurance' | 'athletic' | 'general';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  splitType?: 'ppl' | 'upper_lower' | 'full_body' | 'bro' | 'custom';
  isPublic?: boolean;
}

export interface UpdateRoutineInput extends Partial<CreateRoutineInput> {
  isArchived?: boolean;
}

export interface AddExerciseToRoutineInput {
  exerciseId: number;
  orderIndex?: number;
  dayOfWeek?: number; // 0-6
  targetSets?: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
  targetWeight?: number;
  targetRPE?: number;
  restSeconds?: number;
  supersetGroup?: number;
  notes?: string;
}

// ============================================================================
// DOMAIN MODELS (Response Types)
// ============================================================================

export interface WorkoutExercise {
  id: number;
  workoutId: number;
  exerciseId: number;
  orderIndex: number;
  notes?: string;
  exercise: Exercise; // Nested full exercise object
  sets: WorkoutSet[];
  // Targets copied from RoutineExercise
  targetSets?: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
  targetWeight?: number;
  targetRPE?: number;
  restSeconds?: number;
}

export interface WorkoutSet {
  id: string; // Using string to support temp IDs ('temp_123')
  workoutExerciseId: number;
  weight?: number;
  reps?: number;
  rpe?: number;
  rir?: number;
  setType: 'warmup' | 'working' | 'drop' | 'failure' | 'amrap';
  // ... other fields matching LogSetInput + timestamps
  completedAt?: string;
}

export interface Exercise {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  muscleGroup: string;
  secondaryMuscleGroups?: string[];
  equipment?: string;
  equipmentList?: string[];
  difficulty: string;
  exerciseType?: 'strength' | 'cardio' | 'flexibility' | 'stretching';
  exerciseClass?: 'compound' | 'isolation';
  instructions?: string[];
  pros?: string[];
  cons?: string[];
  videoUrl?: string;
  thumbnailUrl?: string;
  isFeatured?: boolean;
}

export interface RoutineExercise {
    id: number;
    routineId: number;
    exerciseId: number;
    orderIndex: number;
    dayOfWeek?: number;
    targetSets: number;
    targetRepsMin: number;
    targetRepsMax?: number;
    targetWeight?: number;
    targetRPE?: number;
    restSeconds?: number;
    notes?: string;
    exercise?: Exercise;
}

export interface Routine {
    id: number;
    name: string;
    description?: string;
    isPublic?: boolean;
    difficulty?: string;
    exercises?: RoutineExercise[];
    authorId?: number;
    isArchived?: boolean;
    daysPerWeek?: number;
    estimatedDuration?: number;
    goal?: string;
}

export interface TemplateDay {
    dayId: number; // 1-7 (1=Monday, 7=Sunday)
    isRestDay: boolean;
    routineId?: number; // If an existing routine is linked
    routineData?: any; // Stores a full routine if custom built
}

export interface Template {
    id: string;
    name: string;
    description?: string;
    days: TemplateDay[];
    color?: string;
    createdAt?: string;
    exercises?: number; // Mock compatibility
    lastUsed?: string; // Mock compatibility
}

export interface Workout {
  id: number;
  userId: number;
  name: string;
  notes?: string;
  startTime: string; // ISO date
  endTime?: string; // ISO date
  status: 'in_progress' | 'completed' | 'cancelled';
  exercises: WorkoutExercise[];
}

