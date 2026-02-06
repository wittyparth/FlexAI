/**
 * Leaderboard Routes Integration Tests
 * Testing all /api/v1/leaderboard endpoints
 */
// Mock ioredis before importing/using it
jest.mock('ioredis', () => {
  console.log('Mocking ioredis');
  return jest.fn().mockImplementation(() => ({
    zadd: jest.fn().mockResolvedValue(1),
    zrevrange: jest.fn().mockResolvedValue(['1', '5000', '2', '4000', '3', '3000']),
    zscore: jest.fn().mockResolvedValue(100),
    on: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    exists: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
  }));
});

import { mockPrisma, resetMocks } from '../utils/mock-prisma';
import request from 'supertest';
import { createApp } from '../../src/app';
import { createMockUser, createMockChallenge } from '../utils/factories';
import { generateTestToken } from '../utils/test-utils';

const app = createApp();

describe('Leaderboard Routes', () => {
  beforeEach(() => {
    resetMocks();
  });

  // ==========================================================================
  // GET /api/v1/leaderboard
  // ==========================================================================
  describe('GET /leaderboard', () => {
    it('should return leaderboard rankings', async () => {
      const token = generateTestToken(1);
      const rankings = [
        { ...createMockUser({ id: 1 }), xp: 5000 },
        { ...createMockUser({ id: 2 }), xp: 4000 },
        { ...createMockUser({ id: 3 }), xp: 3000 },
      ];
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.user.findMany.mockResolvedValue(rankings);

      const res = await request(app)
        .get('/api/v1/leaderboards/rankings/strength')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app).get('/api/v1/leaderboards/rankings/strength');
      expect(res.status).toBe(401);
    });

    it('should support type parameter', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.user.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/leaderboards/rankings/weekly')
        .set('Authorization', `Bearer ${token}`)
        .query({ type: 'weekly' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // GET /api/v1/leaderboard/challenges
  // ==========================================================================
  describe('GET /leaderboard/challenges', () => {
    it('should return active challenges', async () => {
      const token = generateTestToken(1);
      const challenges = [createMockChallenge(), createMockChallenge()];
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.challenge.findMany.mockResolvedValue(challenges);

      const res = await request(app)
        .get('/api/v1/leaderboards/challenges')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // POST /api/v1/leaderboard/challenges
  // ==========================================================================
  describe('POST /leaderboard/challenges', () => {
    const validChallenge = {
      name: 'Weekly Volume Challenge',
      description: 'Lift the most total volume this week',
      challengeType: 'volume',
      targetMetric: 'total_volume',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    it('should create a challenge', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.challenge.create.mockResolvedValue(createMockChallenge(validChallenge));

      const res = await request(app)
        .post('/api/v1/leaderboards/challenges')
        .set('Authorization', `Bearer ${token}`)
        .send(validChallenge);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/v1/leaderboards/challenges')
        .send(validChallenge);

      expect(res.status).toBe(401);
    });

    it('should validate challenge data', async () => {
      const token = generateTestToken(1);
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));

      const res = await request(app)
        .post('/api/v1/leaderboards/challenges')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Missing name' }); // Missing required fields

      expect(res.status).toBe(422);
    });
  });

  // ==========================================================================
  // POST /api/v1/leaderboard/challenges/:id/join
  // ==========================================================================
  describe('POST /leaderboard/challenges/:id/join', () => {
    it('should join a challenge', async () => {
      const token = generateTestToken(1);
      const challenge = createMockChallenge({ id: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.challenge.findUnique.mockResolvedValue(challenge);
      mockPrisma.challengeParticipant.findUnique.mockResolvedValue(null);
      mockPrisma.challengeParticipant.create.mockResolvedValue({ id: 1, challengeId: 1, userId: 1 });

      const res = await request(app)
        .post('/api/v1/leaderboards/challenges/1/join')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent challenge', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.challenge.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/leaderboards/challenges/999/join')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should return 400 if already joined', async () => {
      const token = generateTestToken(1);
      const challenge = createMockChallenge({ id: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.challenge.findUnique.mockResolvedValue(challenge);
      mockPrisma.challengeParticipant.findUnique.mockResolvedValue({ id: 1 } as any); // Already joined

      const res = await request(app)
        .post('/api/v1/leaderboards/challenges/1/join')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
    });
  });
});
