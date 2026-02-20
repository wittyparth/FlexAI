import { Workout, Routine } from '../types/backend.types';

// ============================================================
// MOCK DATA - WORKOUT HISTORY & DETAILS
// ============================================================

export const MOCK_WORKOUT_HISTORY: Workout[] = [
    {
        id: 1,
        userId: 1,
        name: 'Push Day - Chest & Triceps',
        notes: 'Felt strong today! Increased bench press by 5lbs.',
        startTime: '2026-02-03T08:30:00.000Z',
        endTime: '2026-02-03T09:45:00.000Z',
        status: 'completed',
        exercises: [
            {
                id: 101,
                workoutId: 1,
                exerciseId: 1,
                orderIndex: 0,
                notes: 'Warm up properly before heavy sets',
                exercise: {
                    id: 1,
                    name: 'Barbell Bench Press',
                    muscleGroup: 'Chest',
                    equipment: 'Barbell',
                    difficulty: 'intermediate',
                },
                sets: [
                    { id: '1001', workoutExerciseId: 101, weight: 95, reps: 12, rpe: 5, setType: 'warmup', completedAt: '2026-02-03T08:35:00.000Z' },
                    { id: '1002', workoutExerciseId: 101, weight: 135, reps: 10, rpe: 6, setType: 'warmup', completedAt: '2026-02-03T08:38:00.000Z' },
                    { id: '1003', workoutExerciseId: 101, weight: 185, reps: 8, rpe: 7, setType: 'working', completedAt: '2026-02-03T08:42:00.000Z' },
                    { id: '1004', workoutExerciseId: 101, weight: 205, reps: 6, rpe: 8, setType: 'working', completedAt: '2026-02-03T08:47:00.000Z' },
                    { id: '1005', workoutExerciseId: 101, weight: 225, reps: 4, rpe: 9, setType: 'working', completedAt: '2026-02-03T08:52:00.000Z' },
                ],
            },
            {
                id: 102,
                workoutId: 1,
                exerciseId: 2,
                orderIndex: 1,
                exercise: {
                    id: 2,
                    name: 'Incline Dumbbell Press',
                    muscleGroup: 'Chest',
                    equipment: 'Dumbbell',
                    difficulty: 'intermediate',
                },
                sets: [
                    { id: '1006', workoutExerciseId: 102, weight: 60, reps: 10, rpe: 7, setType: 'working', completedAt: '2026-02-03T09:00:00.000Z' },
                    { id: '1007', workoutExerciseId: 102, weight: 65, reps: 8, rpe: 8, setType: 'working', completedAt: '2026-02-03T09:05:00.000Z' },
                    { id: '1008', workoutExerciseId: 102, weight: 65, reps: 7, rpe: 9, setType: 'working', completedAt: '2026-02-03T09:10:00.000Z' },
                ],
            },
            {
                id: 103,
                workoutId: 1,
                exerciseId: 3,
                orderIndex: 2,
                exercise: {
                    id: 3,
                    name: 'Cable Flyes',
                    muscleGroup: 'Chest',
                    equipment: 'Cable',
                    difficulty: 'beginner',
                },
                sets: [
                    { id: '1009', workoutExerciseId: 103, weight: 30, reps: 12, rpe: 7, setType: 'working', completedAt: '2026-02-03T09:18:00.000Z' },
                    { id: '1010', workoutExerciseId: 103, weight: 30, reps: 12, rpe: 8, setType: 'working', completedAt: '2026-02-03T09:22:00.000Z' },
                    { id: '1011', workoutExerciseId: 103, weight: 30, reps: 10, rpe: 9, setType: 'failure', completedAt: '2026-02-03T09:26:00.000Z' },
                ],
            },
            {
                id: 104,
                workoutId: 1,
                exerciseId: 4,
                orderIndex: 3,
                exercise: {
                    id: 4,
                    name: 'Tricep Rope Pushdown',
                    muscleGroup: 'Triceps',
                    equipment: 'Cable',
                    difficulty: 'beginner',
                },
                sets: [
                    { id: '1012', workoutExerciseId: 104, weight: 40, reps: 12, rpe: 7, setType: 'working', completedAt: '2026-02-03T09:32:00.000Z' },
                    { id: '1013', workoutExerciseId: 104, weight: 45, reps: 10, rpe: 8, setType: 'working', completedAt: '2026-02-03T09:36:00.000Z' },
                    { id: '1014', workoutExerciseId: 104, weight: 45, reps: 8, rpe: 9, setType: 'working', completedAt: '2026-02-03T09:40:00.000Z' },
                ],
            },
        ],
    },
    {
        id: 2,
        userId: 1,
        name: 'Pull Day - Back & Biceps',
        notes: 'Lower back felt tight, took extra rest between deadlift sets.',
        startTime: '2026-02-02T17:00:00.000Z',
        endTime: '2026-02-02T18:20:00.000Z',
        status: 'completed',
        exercises: [
            {
                id: 201,
                workoutId: 2,
                exerciseId: 5,
                orderIndex: 0,
                exercise: {
                    id: 5,
                    name: 'Deadlift',
                    muscleGroup: 'Back',
                    equipment: 'Barbell',
                    difficulty: 'advanced',
                },
                sets: [
                    { id: '2001', workoutExerciseId: 201, weight: 135, reps: 10, rpe: 5, setType: 'warmup', completedAt: '2026-02-02T17:05:00.000Z' },
                    { id: '2002', workoutExerciseId: 201, weight: 225, reps: 5, rpe: 6, setType: 'warmup', completedAt: '2026-02-02T17:10:00.000Z' },
                    { id: '2003', workoutExerciseId: 201, weight: 315, reps: 5, rpe: 7, setType: 'working', completedAt: '2026-02-02T17:18:00.000Z' },
                    { id: '2004', workoutExerciseId: 201, weight: 365, reps: 3, rpe: 8, setType: 'working', completedAt: '2026-02-02T17:26:00.000Z' },
                    { id: '2005', workoutExerciseId: 201, weight: 405, reps: 1, rpe: 10, setType: 'working', completedAt: '2026-02-02T17:35:00.000Z' },
                ],
            },
            {
                id: 202,
                workoutId: 2,
                exerciseId: 6,
                orderIndex: 1,
                exercise: {
                    id: 6,
                    name: 'Pull-ups',
                    muscleGroup: 'Back',
                    equipment: 'Bodyweight',
                    difficulty: 'intermediate',
                },
                sets: [
                    { id: '2006', workoutExerciseId: 202, reps: 10, rpe: 7, setType: 'working', completedAt: '2026-02-02T17:45:00.000Z' },
                    { id: '2007', workoutExerciseId: 202, reps: 8, rpe: 8, setType: 'working', completedAt: '2026-02-02T17:50:00.000Z' },
                    { id: '2008', workoutExerciseId: 202, reps: 6, rpe: 9, setType: 'failure', completedAt: '2026-02-02T17:55:00.000Z' },
                ],
            },
            {
                id: 203,
                workoutId: 2,
                exerciseId: 7,
                orderIndex: 2,
                exercise: {
                    id: 7,
                    name: 'Barbell Curl',
                    muscleGroup: 'Biceps',
                    equipment: 'Barbell',
                    difficulty: 'beginner',
                },
                sets: [
                    { id: '2009', workoutExerciseId: 203, weight: 65, reps: 10, rpe: 7, setType: 'working', completedAt: '2026-02-02T18:05:00.000Z' },
                    { id: '2010', workoutExerciseId: 203, weight: 75, reps: 8, rpe: 8, setType: 'working', completedAt: '2026-02-02T18:10:00.000Z' },
                    { id: '2011', workoutExerciseId: 203, weight: 75, reps: 6, rpe: 9, setType: 'working', completedAt: '2026-02-02T18:15:00.000Z' },
                ],
            },
        ],
    },
    {
        id: 3,
        userId: 1,
        name: 'Leg Day',
        startTime: '2026-02-01T10:00:00.000Z',
        endTime: '2026-02-01T11:30:00.000Z',
        status: 'completed',
        exercises: [
            {
                id: 301,
                workoutId: 3,
                exerciseId: 8,
                orderIndex: 0,
                exercise: {
                    id: 8,
                    name: 'Barbell Squat',
                    muscleGroup: 'Quadriceps',
                    equipment: 'Barbell',
                    difficulty: 'advanced',
                },
                sets: [
                    { id: '3001', workoutExerciseId: 301, weight: 135, reps: 10, rpe: 5, setType: 'warmup', completedAt: '2026-02-01T10:08:00.000Z' },
                    { id: '3002', workoutExerciseId: 301, weight: 185, reps: 8, rpe: 6, setType: 'warmup', completedAt: '2026-02-01T10:14:00.000Z' },
                    { id: '3003', workoutExerciseId: 301, weight: 225, reps: 6, rpe: 7, setType: 'working', completedAt: '2026-02-01T10:22:00.000Z' },
                    { id: '3004', workoutExerciseId: 301, weight: 275, reps: 5, rpe: 8, setType: 'working', completedAt: '2026-02-01T10:30:00.000Z' },
                    { id: '3005', workoutExerciseId: 301, weight: 315, reps: 3, rpe: 9, setType: 'working', completedAt: '2026-02-01T10:40:00.000Z' },
                ],
            },
            {
                id: 302,
                workoutId: 3,
                exerciseId: 9,
                orderIndex: 1,
                exercise: {
                    id: 9,
                    name: 'Romanian Deadlift',
                    muscleGroup: 'Hamstrings',
                    equipment: 'Barbell',
                    difficulty: 'intermediate',
                },
                sets: [
                    { id: '3006', workoutExerciseId: 302, weight: 185, reps: 10, rpe: 7, setType: 'working', completedAt: '2026-02-01T10:55:00.000Z' },
                    { id: '3007', workoutExerciseId: 302, weight: 205, reps: 8, rpe: 8, setType: 'working', completedAt: '2026-02-01T11:02:00.000Z' },
                    { id: '3008', workoutExerciseId: 302, weight: 205, reps: 8, rpe: 8, setType: 'working', completedAt: '2026-02-01T11:09:00.000Z' },
                ],
            },
            {
                id: 303,
                workoutId: 3,
                exerciseId: 10,
                orderIndex: 2,
                exercise: {
                    id: 10,
                    name: 'Leg Press',
                    muscleGroup: 'Quadriceps',
                    equipment: 'Machine',
                    difficulty: 'beginner',
                },
                sets: [
                    { id: '3009', workoutExerciseId: 303, weight: 360, reps: 12, rpe: 7, setType: 'working', completedAt: '2026-02-01T11:18:00.000Z' },
                    { id: '3010', workoutExerciseId: 303, weight: 400, reps: 10, rpe: 8, setType: 'working', completedAt: '2026-02-01T11:24:00.000Z' },
                    { id: '3011', workoutExerciseId: 303, weight: 400, reps: 8, rpe: 9, setType: 'failure', completedAt: '2026-02-01T11:30:00.000Z' },
                ],
            },
        ],
    },
];

// ============================================================
// MOCK DATA - ROUTINES
// ============================================================

export const MOCK_ROUTINES: any[] = [
    {
        id: 1,
        name: 'PPL Hypertrophy - Push',
        description: 'Focus on chest, shoulders, and triceps with hypertrophy rep ranges.',
        difficulty: 'intermediate',
        daysPerWeek: 6,
        estimatedDuration: 60,
        exercises: [
            { id: 1, exerciseId: 101, orderIndex: 0, targetSets: 4, targetRepsMin: 8, targetRepsMax: 12, restSeconds: 90, exercise: { id: 101, name: 'Barbell Bench Press', muscleGroup: 'Chest', difficulty: 'intermediate' } },
            { id: 2, exerciseId: 102, orderIndex: 1, targetSets: 3, targetRepsMin: 10, targetRepsMax: 15, restSeconds: 60, exercise: { id: 102, name: 'Incline Dumbbell Press', muscleGroup: 'Chest', difficulty: 'intermediate' } },
            { id: 3, exerciseId: 103, orderIndex: 2, targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60, exercise: { id: 103, name: 'Overhead Press', muscleGroup: 'Shoulders', difficulty: 'intermediate' } },
            { id: 4, exerciseId: 104, orderIndex: 3, targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, restSeconds: 60, exercise: { id: 104, name: 'Lateral Raise', muscleGroup: 'Shoulders', difficulty: 'beginner' } },
            { id: 5, exerciseId: 105, orderIndex: 4, targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60, exercise: { id: 105, name: 'Tricep Pushdown', muscleGroup: 'Triceps', difficulty: 'beginner' } }
        ]
    },
    {
        id: 2,
        name: 'PPL Hypertrophy - Pull',
        description: 'Back and biceps focus.',
        difficulty: 'intermediate',
        daysPerWeek: 6,
        estimatedDuration: 65,
        exercises: [
            { id: 6, exerciseId: 106, orderIndex: 0, targetSets: 4, targetRepsMin: 6, targetRepsMax: 10, restSeconds: 120, exercise: { id: 106, name: 'Deadlift', muscleGroup: 'Back', difficulty: 'advanced' } },
            { id: 7, exerciseId: 107, orderIndex: 1, targetSets: 3, targetRepsMin: 8, targetRepsMax: 12, restSeconds: 90, exercise: { id: 107, name: 'Pull Up', muscleGroup: 'Back', difficulty: 'intermediate' } },
            { id: 8, exerciseId: 108, orderIndex: 2, targetSets: 3, targetRepsMin: 10, targetRepsMax: 15, restSeconds: 60, exercise: { id: 108, name: 'Barbell Row', muscleGroup: 'Back', difficulty: 'intermediate' } },
            { id: 9, exerciseId: 109, orderIndex: 3, targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60, exercise: { id: 109, name: 'Face Pull', muscleGroup: 'Shoulders', difficulty: 'beginner' } },
            { id: 10, exerciseId: 110, orderIndex: 4, targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, restSeconds: 60, exercise: { id: 110, name: 'Bicep Curl', muscleGroup: 'Biceps', difficulty: 'beginner' } }
        ]
    },
    {
        id: 3,
        name: 'Full Body Beginner',
        description: 'Great starting point for new lifters.',
        difficulty: 'beginner',
        daysPerWeek: 3,
        estimatedDuration: 45,
        exercises: [
            { id: 11, exerciseId: 111, orderIndex: 0, targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, restSeconds: 90, exercise: { id: 111, name: 'Goblet Squat', muscleGroup: 'Legs', difficulty: 'beginner' } },
            { id: 12, exerciseId: 112, orderIndex: 1, targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, restSeconds: 90, exercise: { id: 112, name: 'Push Up', muscleGroup: 'Chest', difficulty: 'beginner' } },
            { id: 13, exerciseId: 113, orderIndex: 2, targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, restSeconds: 90, exercise: { id: 113, name: 'Dumbbell Row', muscleGroup: 'Back', difficulty: 'beginner' } },
            { id: 14, exerciseId: 114, orderIndex: 3, targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, restSeconds: 60, exercise: { id: 114, name: 'Plank', muscleGroup: 'Core', difficulty: 'beginner' } }
        ]
    }
];

// ============================================================
// MOCK DATA - TEMPLATES
// ============================================================

export const MOCK_TEMPLATES: any[] = [
    {
        id: 101,
        name: '5x5 Strength',
        description: 'Classic strength program.',
        difficulty: 'intermediate',
        isTemplate: true,
        daysPerWeek: 3,
        estimatedDuration: 75,
        exercises: [
            { id: 15, exerciseId: 115, orderIndex: 0, targetSets: 5, targetRepsMin: 5, targetRepsMax: 5, restSeconds: 180, exercise: { id: 115, name: 'Squat', muscleGroup: 'Legs', difficulty: 'intermediate' } },
            { id: 16, exerciseId: 116, orderIndex: 1, targetSets: 5, targetRepsMin: 5, targetRepsMax: 5, restSeconds: 180, exercise: { id: 116, name: 'Bench Press', muscleGroup: 'Chest', difficulty: 'intermediate' } },
            { id: 17, exerciseId: 117, orderIndex: 2, targetSets: 5, targetRepsMin: 5, targetRepsMax: 5, restSeconds: 180, exercise: { id: 117, name: 'Barbell Row', muscleGroup: 'Back', difficulty: 'intermediate' } }
        ]
    },
    {
        id: 102,
        name: 'HIIT Cardio Blast',
        description: 'High intensity interval training.',
        difficulty: 'advanced',
        isTemplate: true,
        daysPerWeek: 2,
        estimatedDuration: 30,
        exercises: [
            { id: 18, exerciseId: 118, orderIndex: 0, targetSets: 10, targetRepsMin: 20, targetRepsMax: 20, restSeconds: 10, exercise: { id: 118, name: 'Burpees', muscleGroup: 'Full Body', difficulty: 'advanced' } },
            { id: 19, exerciseId: 119, orderIndex: 1, targetSets: 10, targetRepsMin: 45, targetRepsMax: 45, restSeconds: 15, exercise: { id: 119, name: 'Jump Rope', muscleGroup: 'Cardio', difficulty: 'intermediate' } }
        ]
    }
];

// ============================================================
// MOCK DATA - PUBLIC ROUTINES (DISCOVER)
// ============================================================

export const MOCK_PUBLIC_ROUTINES: any[] = [
    {
        id: 201,
        name: 'Arnold Split',
        description: 'High volume bodybuilding split.',
        difficulty: 'advanced',
        isPublic: true,
        authorId: 99,
        daysPerWeek: 6,
        estimatedDuration: 90,
        exercises: [
            { id: 20, exerciseId: 120, orderIndex: 0, targetSets: 4, targetRepsMin: 10, targetRepsMax: 12, restSeconds: 60, exercise: { id: 120, name: 'Dumbbell Press', muscleGroup: 'Chest', difficulty: 'intermediate' } },
             { id: 21, exerciseId: 121, orderIndex: 1, targetSets: 4, targetRepsMin: 10, targetRepsMax: 12, restSeconds: 60, exercise: { id: 121, name: 'Dumbbell Fly', muscleGroup: 'Chest', difficulty: 'intermediate' } }
        ]
    },
    {
        id: 202,
        name: 'Yoga Flow',
        description: 'Relaxing morning yoga routine.',
        difficulty: 'beginner',
        isPublic: true,
        authorId: 88,
        daysPerWeek: 7,
        estimatedDuration: 20,
        exercises: [
            { id: 22, exerciseId: 122, orderIndex: 0, targetSets: 1, targetRepsMin: 1, targetRepsMax: 1, restSeconds: 0, exercise: { id: 122, name: 'Sun Salutation', muscleGroup: 'Full Body', difficulty: 'beginner' } }
        ]
    }
];
