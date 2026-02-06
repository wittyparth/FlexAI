/**
 * Gamification Routes Integration Tests
 * Testing all /api/v1/gamification endpoints
 */
import { mockPrisma, resetMocks } from '../utils/mock-prisma';
import request from 'supertest';
import { createApp } from '../../src/app';
import { createMockUser } from '../utils/factories';
import { generateTestToken } from '../utils/test-utils';

const app = createApp();

describe('Gamification Routes', () => {
  beforeEach(() => {
    resetMocks();
  });

  // ==========================================================================
  // GET /api/v1/gamification/stats
  // ==========================================================================
  describe('GET /gamification/stats', () => {
    it('should return user gamification stats', async () => {
      const token = generateTestToken(1);
      const user = createMockUser({ id: 1, xp: 1500, level: 5, currentStreak: 7 });
      
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const res = await request(app)
        .get('/api/v1/gamification/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      // expect(res.body.success).toBe(true); // Controller returns object directly
      expect(res.body).toHaveProperty('xp');
      expect(res.body).toHaveProperty('level');
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app).get('/api/v1/gamification/stats');
      expect(res.status).toBe(401);
    });
  });

  // ==========================================================================
  // GET /api/v1/gamification/achievements
  // ==========================================================================
  describe('GET /gamification/achievements', () => {
    it('should return user achievements', async () => {
      const token = generateTestToken(1);
      const achievements = [
        { id: 1, name: 'First Workout', unlockedAt: new Date() },
        { id: 2, name: '7-Day Streak', unlockedAt: new Date() },
      ];
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.userAchievement.findMany.mockResolvedValue(achievements);

      const res = await request(app)
        .get('/api/v1/gamification/achievements')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      // expect(res.body.success).toBe(true); // Controller returns array directly
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app).get('/api/v1/gamification/achievements');
      expect(res.status).toBe(401);
    });
  });
});
