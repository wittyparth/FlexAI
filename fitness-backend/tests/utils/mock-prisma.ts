/**
 * Mock Prisma Client for Testing
 * Provides mocked database operations using Jest mock functions
 */

// Type-safe mock function creator that accepts any value
const createMockMethod = () => {
  const fn = jest.fn();
  fn.mockResolvedValue(null);
  return fn;
};

// Mock model with common Prisma operations
const createMockModel = () => ({
  findUnique: createMockMethod(),
  findFirst: createMockMethod(),
  findMany: jest.fn().mockResolvedValue([]),
  create: createMockMethod(),
  update: createMockMethod(),
  updateMany: createMockMethod(),
  delete: createMockMethod(),
  deleteMany: createMockMethod(),
  count: createMockMethod(),
  aggregate: createMockMethod(),
  groupBy: createMockMethod(),
  upsert: createMockMethod(),
});

// Create mock Prisma client
export const mockPrisma: any = {
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $transaction: jest.fn((callback: any) => callback(mockPrisma)),
  
  // Models
  user: createMockModel(),
  userSettings: createMockModel(),
  session: createMockModel(),
  exercise: createMockModel(),
  workout: createMockModel(),
  workoutExercise: createMockModel(),
  workoutSet: createMockModel(),
  routine: createMockModel(),
  routineExercise: createMockModel(),
  formCheckSession: createMockModel(),
  formCheckResult: createMockModel(),
  coachConversation: createMockModel(),
  coachMessage: createMockModel(),
  bodyWeight: createMockModel(),
  bodyMeasurement: createMockModel(),
  progressPhoto: createMockModel(),
  personalRecord: createMockModel(),
  achievement: createMockModel(),
  userAchievement: createMockModel(),
  follower: createMockModel(),
  post: createMockModel(),
  comment: createMockModel(),
  like: createMockModel(),
  challenge: createMockModel(),
  challengeParticipant: createMockModel(),
  deviceToken: createMockModel(),
  notification: createMockModel(),
};

// Mock the Prisma import
jest.mock('../../src/config/database', () => ({
  prisma: mockPrisma,
}));

// Helper to reset all mocks between tests
export const resetMocks = () => {
  Object.values(mockPrisma).forEach((value) => {
    if (typeof value === 'object' && value !== null) {
      // It's a model (like prisma.user)
      Object.entries(value).forEach(([key, method]) => {
        if (typeof method === 'function' && 'mockReset' in method) {
          (method as jest.Mock).mockReset();
          
          if (key === 'findMany') {
            (method as jest.Mock).mockResolvedValue([]);
          } else {
            (method as jest.Mock).mockResolvedValue(null);
          }
        }
      });
    } else if (typeof value === 'function' && 'mockReset' in value) {
      // It's a client method (like $connect, $transaction)
      (value as jest.Mock).mockReset();
      if ((value as any)._isTransaction) {
         // handle transaction mock if needed, currently $transaction mock implementation is complex
         // But the initial definition was: $transaction: jest.fn((callback) => callback(mockPrisma))
         // resetting it removes that implementation!
      }
    }
  });
  
  // Restore $transaction implementation
  mockPrisma.$transaction.mockImplementation((callback: any) => callback(mockPrisma));
  mockPrisma.$connect.mockResolvedValue(undefined);
  mockPrisma.$disconnect.mockResolvedValue(undefined);
};

export default mockPrisma;
