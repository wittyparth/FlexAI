/**
 * Stats Routes Integration Tests
 * Testing all /api/v1/stats endpoints
 */
import { mockPrisma, resetMocks } from '../utils/mock-prisma';
import request from 'supertest';
import { createApp } from '../../src/app';
import { createMockUser, createCompletedWorkout } from '../utils/factories';
import { generateTestToken } from '../utils/test-utils';

const app = createApp();

describe('Stats Routes', () => {
  beforeEach(() => {
    resetMocks();
  });

  // ==========================================================================
  // GET /api/v1/stats/prs
  // ==========================================================================
  describe('GET /stats/prs', () => {
    it('should return personal records', async () => {
      const token = generateTestToken(1);
      const prs = [
        { id: 1, userId: 1, exerciseId: 1, weight: 100, reps: 1, date: new Date() },
      ];
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.personalRecord.findMany.mockResolvedValue(prs);

      const res = await request(app)
        .get('/api/v1/stats/prs')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app).get('/api/v1/stats/prs');
      expect(res.status).toBe(401);
    });
  });

  // ==========================================================================
  // GET /api/v1/stats/strength
  // ==========================================================================
  describe('GET /stats/strength', () => {
    it('should return strength metrics', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.personalRecord.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/stats/strength')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // GET /api/v1/stats/volume
  // ==========================================================================
  describe('GET /stats/volume', () => {
    it('should return volume statistics', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findMany.mockResolvedValue([createCompletedWorkout()]);

      const res = await request(app)
        .get('/api/v1/stats/volume')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should accept date range parameters', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/stats/volume')
        .set('Authorization', `Bearer ${token}`)
        .query({ startDate: '2024-01-01', endDate: '2024-12-31' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // GET /api/v1/stats/consistency
  // ==========================================================================
  describe('GET /stats/consistency', () => {
    it('should return consistency metrics', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findMany.mockResolvedValue([createCompletedWorkout()]);

      const res = await request(app)
        .get('/api/v1/stats/consistency')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // GET /api/v1/stats/muscle-distribution
  // ==========================================================================
  describe('GET /stats/muscle-distribution', () => {
    it('should return muscle distribution', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/stats/muscle-distribution')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // GET /api/v1/stats/recovery
  // ==========================================================================
  describe('GET /stats/recovery', () => {
    it('should return recovery stats', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/stats/recovery')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // GET /api/v1/stats/body
  // ==========================================================================
  describe('GET /stats/body', () => {
    it('should return body composition stats', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.bodyWeight.findMany.mockResolvedValue([]);
      mockPrisma.bodyMeasurement.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/stats/body')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // GET /api/v1/stats/dashboard
  // ==========================================================================
  describe('GET /stats/dashboard', () => {
    it('should return dashboard summary', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.count.mockResolvedValue(10);
      mockPrisma.workout.findMany.mockResolvedValue([]);
      mockPrisma.personalRecord.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/stats/dashboard')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // GET /api/v1/stats/strength-progression/:exerciseId
  // ==========================================================================
  describe('GET /stats/strength-progression/:exerciseId', () => {
    it('should return strength progression for exercise', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workoutSet.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/stats/strength-progression/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // GET /api/v1/stats/workout-frequency
  // ==========================================================================
  describe('GET /stats/workout-frequency', () => {
    it('should return workout frequency', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findMany.mockResolvedValue([createCompletedWorkout()]);

      const res = await request(app)
        .get('/api/v1/stats/workout-frequency')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
