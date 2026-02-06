/**
 * Test Data Factories
 * Creates consistent mock data for testing
 */

// ID counters for unique IDs
let userIdCounter = 1;
let exerciseIdCounter = 1;
let workoutIdCounter = 1;
let routineIdCounter = 1;
let postIdCounter = 1;
let commentIdCounter = 1;
let challengeIdCounter = 1;

export const resetIdCounters = () => {
  userIdCounter = 1;
  exerciseIdCounter = 1;
  workoutIdCounter = 1;
  routineIdCounter = 1;
  postIdCounter = 1;
  commentIdCounter = 1;
  challengeIdCounter = 1;
};

// User Factory
export interface MockUser {
  id: number;
  email: string;
  passwordHash: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  emailVerifyToken: string | null;
  emailVerifyExpiry: Date | null;
  isActive: boolean;
  role: string;
  googleId: string | null;
  appleId: string | null;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  id: userIdCounter++,
  email: `user${userIdCounter}@example.com`,
  passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.A5J1V3zZZvVsLe', // "password123"
  firstName: 'Test',
  lastName: 'User',
  avatarUrl: null,
  emailVerified: true,
  emailVerifyToken: null,
  emailVerifyExpiry: null,
  isActive: true,
  role: 'user',
  googleId: null,
  appleId: null,
  xp: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastWorkoutDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Unverified user for testing email verification
export const createUnverifiedUser = (overrides: Partial<MockUser> = {}): MockUser =>
  createMockUser({
    emailVerified: false,
    emailVerifyToken: '123456',
    emailVerifyExpiry: new Date(Date.now() + 15 * 60 * 1000),
    ...overrides,
  });

// Exercise Factory
export interface MockExercise {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  instructions: string[];
  primaryMuscleGroups: string[];
  secondaryMuscleGroups: string[];
  equipment: string[];
  difficulty: string;
  exerciseType: string;
  isActive: boolean;
  isFeatured: boolean;
  isCustom: boolean;
  createdById: number | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const createMockExercise = (overrides: Partial<MockExercise> = {}): MockExercise => {
  const id = exerciseIdCounter++;
  return {
    id,
    name: `Exercise ${id}`,
    slug: `exercise-${id}`,
    description: 'A test exercise',
    instructions: ['Step 1', 'Step 2'],
    primaryMuscleGroups: ['chest'],
    secondaryMuscleGroups: ['triceps'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    exerciseType: 'strength',
    isActive: true,
    isFeatured: false,
    isCustom: false,
    createdById: null,
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

// Workout Factory
export interface MockWorkout {
  id: number;
  userId: number;
  routineId: number | null;
  name: string | null;
  startedAt: Date;
  completedAt: Date | null;
  duration: number | null;
  totalVolume: number | null;
  totalSets: number | null;
  totalReps: number | null;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const createMockWorkout = (overrides: Partial<MockWorkout> = {}): MockWorkout => {
  const id = workoutIdCounter++;
  return {
    id,
    userId: 1,
    routineId: null,
    name: `Workout ${id}`,
    startedAt: new Date(),
    completedAt: null,
    duration: null,
    totalVolume: null,
    totalSets: null,
    totalReps: null,
    status: 'in_progress',
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

// Completed workout
export const createCompletedWorkout = (overrides: Partial<MockWorkout> = {}): MockWorkout =>
  createMockWorkout({
    status: 'completed',
    completedAt: new Date(),
    duration: 60,
    totalVolume: 5000,
    totalSets: 15,
    totalReps: 100,
    ...overrides,
  });

// Routine Factory
export interface MockRoutine {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  daysPerWeek: number | null;
  estimatedDuration: number | null;
  goal: string | null;
  difficulty: string | null;
  splitType: string | null;
  isPublic: boolean;
  isTemplate: boolean;
  likes: number;
  copiedCount: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  exercises?: any[];
}

export const createMockRoutine = (overrides: Partial<MockRoutine> = {}): MockRoutine => {
  const id = routineIdCounter++;
  return {
    id,
    userId: 1,
    name: `Routine ${id}`,
    description: 'A test routine',
    daysPerWeek: 3,
    estimatedDuration: 60,
    goal: 'muscle_gain',
    difficulty: 'intermediate',
    splitType: 'ppl',
    isPublic: false,
    isTemplate: false,
    likes: 0,
    copiedCount: 0,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

// WorkoutSet Factory
export interface MockWorkoutSet {
  id: number;
  workoutExerciseId: number;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  setType: string;
  completed: boolean;
  restTaken: number | null;
  createdAt: Date;
}

export const createMockWorkoutSet = (overrides: Partial<MockWorkoutSet> = {}): MockWorkoutSet => ({
  id: 1,
  workoutExerciseId: 1,
  setNumber: 1,
  weight: 100,
  reps: 10,
  rpe: 8,
  setType: 'working',
  completed: true,
  restTaken: 90,
  createdAt: new Date(),
  ...overrides,
});

// Post Factory
export interface MockPost {
  id: number;
  userId: number;
  workoutId: number | null;
  content: string;
  imageUrl: string | null;
  visibility: string;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export const createMockPost = (overrides: Partial<MockPost> = {}): MockPost => {
  const id = postIdCounter++;
  return {
    id,
    userId: 1,
    workoutId: null,
    content: `Test post ${id}`,
    imageUrl: null,
    visibility: 'public',
    likesCount: 0,
    commentsCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

// Comment Factory
export interface MockComment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: Date;
}

export const createMockComment = (overrides: Partial<MockComment> = {}): MockComment => ({
  id: commentIdCounter++,
  postId: 1,
  userId: 1,
  content: 'Test comment',
  createdAt: new Date(),
  ...overrides,
});

// Challenge Factory
export interface MockChallenge {
  id: number;
  name: string;
  description: string;
  challengeType: string;
  targetMetric: string;
  targetValue: number | null;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
}

export const createMockChallenge = (overrides: Partial<MockChallenge> = {}): MockChallenge => ({
  id: challengeIdCounter++,
  name: 'Test Challenge',
  description: 'A test challenge',
  challengeType: 'volume',
  targetMetric: 'total_volume',
  targetValue: 10000,
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  isActive: true,
  createdAt: new Date(),
  ...overrides,
});

// Session Factory
export interface MockSession {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
}

export const createMockSession = (overrides: Partial<MockSession> = {}): MockSession => ({
  id: 1,
  userId: 1,
  token: 'mock-refresh-token',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  isActive: true,
  createdAt: new Date(),
  ...overrides,
});

// Body Measurement Factories
export interface MockBodyWeight {
  id: number;
  userId: number;
  weight: number;
  source: string;
  date: Date;
}

export const createMockBodyWeight = (overrides: Partial<MockBodyWeight> = {}): MockBodyWeight => ({
  id: 1,
  userId: 1,
  weight: 75.5,
  source: 'manual',
  date: new Date(),
  ...overrides,
});

// Notification Factory
export interface MockNotification {
  id: number;
  userId: number;
  title: string;
  body: string;
  type: string;
  data: object | null;
  isRead: boolean;
  createdAt: Date;
}

export const createMockNotification = (overrides: Partial<MockNotification> = {}): MockNotification => ({
  id: 1,
  userId: 1,
  title: 'Test Notification',
  body: 'This is a test notification',
  type: 'system',
  data: null,
  isRead: false,
  createdAt: new Date(),
  ...overrides,
});

// Coach Conversation Factory
export interface MockCoachConversation {
  id: number;
  userId: number;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const createMockCoachConversation = (overrides: Partial<MockCoachConversation> = {}): MockCoachConversation => ({
  id: 1,
  userId: 1,
  title: 'Test Conversation',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
