// Mock routines with full exercise data — used for offline/dev mode
// Each routine can be started directly from RoutineDetailScreen

export const MOCK_ROUTINES = [
    {
        id: 1,
        name: 'Push Day – Chest & Shoulders',
        description: 'Heavy compound pressing for chest, shoulders and triceps. Great for hypertrophy.',
        daysPerWeek: 3,
        difficulty: 'Intermediate',
        estimatedDuration: 65,
        splitType: 'PPL',
        color: '#6366F1',
        exercises: [
            { id: 101, orderIndex: 0, targetSets: 4, targetRepsMin: 6, targetRepsMax: 8, targetWeight: 80, restSeconds: 120, exercise: { id: 101, name: 'Barbell Bench Press', muscleGroup: 'Chest', exerciseType: 'Strength' } },
            { id: 102, orderIndex: 1, targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetWeight: 30, restSeconds: 90, exercise: { id: 102, name: 'Incline Dumbbell Press', muscleGroup: 'Chest', exerciseType: 'Strength' } },
            { id: 103, orderIndex: 2, targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, targetWeight: 15, restSeconds: 60, exercise: { id: 103, name: 'Cable Fly', muscleGroup: 'Chest', exerciseType: 'Isolation' } },
            { id: 104, orderIndex: 3, targetSets: 4, targetRepsMin: 8, targetRepsMax: 10, targetWeight: 50, restSeconds: 120, exercise: { id: 104, name: 'Overhead Press', muscleGroup: 'Shoulders', exerciseType: 'Strength' } },
            { id: 105, orderIndex: 4, targetSets: 4, targetRepsMin: 15, targetRepsMax: 20, targetWeight: 10, restSeconds: 60, exercise: { id: 105, name: 'Lateral Raises', muscleGroup: 'Shoulders', exerciseType: 'Isolation' } },
            { id: 106, orderIndex: 5, targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, targetWeight: 25, restSeconds: 60, exercise: { id: 106, name: 'Tricep Pushdown', muscleGroup: 'Triceps', exerciseType: 'Isolation' } },
        ]
    },
    {
        id: 2,
        name: 'Pull Day – Back & Biceps',
        description: 'Build a wide back with heavy rows and pull-ups, finished with bicep isolation.',
        daysPerWeek: 3,
        difficulty: 'Intermediate',
        estimatedDuration: 60,
        splitType: 'PPL',
        color: '#3B82F6',
        exercises: [
            { id: 201, orderIndex: 0, targetSets: 4, targetRepsMin: 6, targetRepsMax: 8, targetWeight: 90, restSeconds: 120, exercise: { id: 201, name: 'Barbell Row', muscleGroup: 'Back', exerciseType: 'Strength' } },
            { id: 202, orderIndex: 1, targetSets: 4, targetRepsMin: 8, targetRepsMax: 10, targetWeight: 0, restSeconds: 90, exercise: { id: 202, name: 'Pull-Ups', muscleGroup: 'Back', exerciseType: 'Strength' } },
            { id: 203, orderIndex: 2, targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetWeight: 70, restSeconds: 90, exercise: { id: 203, name: 'Lat Pulldown', muscleGroup: 'Back', exerciseType: 'Strength' } },
            { id: 204, orderIndex: 3, targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, targetWeight: 20, restSeconds: 60, exercise: { id: 204, name: 'Seated Cable Row', muscleGroup: 'Back', exerciseType: 'Strength' } },
            { id: 205, orderIndex: 4, targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetWeight: 18, restSeconds: 60, exercise: { id: 205, name: 'Dumbbell Curl', muscleGroup: 'Biceps', exerciseType: 'Isolation' } },
            { id: 206, orderIndex: 5, targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, targetWeight: 15, restSeconds: 60, exercise: { id: 206, name: 'Hammer Curl', muscleGroup: 'Biceps', exerciseType: 'Isolation' } },
        ]
    },
    {
        id: 3,
        name: 'Leg Day – Quads & Glutes',
        description: 'Squat-focused lower body session targeting quads, hamstrings and glutes.',
        daysPerWeek: 2,
        difficulty: 'Intermediate',
        estimatedDuration: 70,
        splitType: 'PPL',
        color: '#10B981',
        exercises: [
            { id: 301, orderIndex: 0, targetSets: 4, targetRepsMin: 5, targetRepsMax: 7, targetWeight: 100, restSeconds: 180, exercise: { id: 301, name: 'Barbell Squat', muscleGroup: 'Legs', exerciseType: 'Strength' } },
            { id: 302, orderIndex: 1, targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetWeight: 60, restSeconds: 120, exercise: { id: 302, name: 'Leg Press', muscleGroup: 'Legs', exerciseType: 'Strength' } },
            { id: 303, orderIndex: 2, targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, targetWeight: 40, restSeconds: 90, exercise: { id: 303, name: 'Romanian Deadlift', muscleGroup: 'Legs', exerciseType: 'Strength' } },
            { id: 304, orderIndex: 3, targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, targetWeight: 50, restSeconds: 60, exercise: { id: 304, name: 'Leg Extension', muscleGroup: 'Legs', exerciseType: 'Isolation' } },
            { id: 305, orderIndex: 4, targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, targetWeight: 45, restSeconds: 60, exercise: { id: 305, name: 'Seated Leg Curl', muscleGroup: 'Legs', exerciseType: 'Isolation' } },
            { id: 306, orderIndex: 5, targetSets: 4, targetRepsMin: 15, targetRepsMax: 20, targetWeight: 0, restSeconds: 60, exercise: { id: 306, name: 'Standing Calf Raises', muscleGroup: 'Legs', exerciseType: 'Isolation' } },
        ]
    },
    {
        id: 4,
        name: 'Full Body Strength',
        description: 'A complete full-body workout hitting every major muscle group. Perfect for beginners.',
        daysPerWeek: 3,
        difficulty: 'Beginner',
        estimatedDuration: 55,
        splitType: 'Full Body',
        color: '#F59E0B',
        exercises: [
            { id: 401, orderIndex: 0, targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetWeight: 60, restSeconds: 120, exercise: { id: 401, name: 'Bench Press', muscleGroup: 'Chest', exerciseType: 'Strength' } },
            { id: 402, orderIndex: 1, targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetWeight: 70, restSeconds: 120, exercise: { id: 402, name: 'Barbell Squat', muscleGroup: 'Legs', exerciseType: 'Strength' } },
            { id: 403, orderIndex: 2, targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetWeight: 40, restSeconds: 120, exercise: { id: 403, name: 'Overhead Press', muscleGroup: 'Shoulders', exerciseType: 'Strength' } },
            { id: 404, orderIndex: 3, targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, targetWeight: 60, restSeconds: 120, exercise: { id: 404, name: 'Barbell Row', muscleGroup: 'Back', exerciseType: 'Strength' } },
            { id: 405, orderIndex: 4, targetSets: 3, targetRepsMin: 6, targetRepsMax: 8, targetWeight: 80, restSeconds: 120, exercise: { id: 405, name: 'Deadlift', muscleGroup: 'Back', exerciseType: 'Strength' } },
        ]
    },
];
