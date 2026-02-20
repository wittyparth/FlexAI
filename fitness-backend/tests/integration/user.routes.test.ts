/**
 * User Routes Integration Tests
 * Testing all /api/v1/users endpoints
 */
import { mockPrisma, resetMocks } from '../utils/mock-prisma';
import request from 'supertest';
import { createApp } from '../../src/app';
import { createMockUser } from '../utils/factories';
import { generateTestToken } from '../utils/test-utils';

const app = createApp();

// Mock ioredis before importing/using it
jest.mock('ioredis', () => {
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

describe('User Routes', () => {
  beforeEach(() => {
    resetMocks();
  });

  // ==========================================================================
  // GET /api/v1/users/me
  // ==========================================================================
  describe('GET /users/me', () => {
    it('should return current user profile', async () => {
      const user = createMockUser({ id: 1 });
      const token = generateTestToken(user.id, user.email);
      
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id', user.id);
      expect(res.body.data).toHaveProperty('email', user.email);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .get('/api/v1/users/me');

      expect(res.status).toBe(401);
    });

    it('should return 401 for invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });

  // ==========================================================================
  // PATCH /api/v1/users/me
  // ==========================================================================
  describe('PATCH /users/me', () => {
    it('should update user profile', async () => {
      const user = createMockUser({ id: 1 });
      const token = generateTestToken(user.id, user.email);
      
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        age: 25,
        height: 180,
        weight: 75,
      };

      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue({ ...user, ...updateData });

      const res = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.firstName).toBe(updateData.firstName);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .patch('/api/v1/users/me')
        .send({ firstName: 'Test' });

      expect(res.status).toBe(401);
    });

    it('should validate profile update data', async () => {
      const token = generateTestToken(1);
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));

      const res = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ age: -5 }); // Invalid age

      expect(res.status).toBe(422);
    });
  });

  // ==========================================================================
  // DELETE /api/v1/users/me
  // ==========================================================================
  describe('DELETE /users/me', () => {
    it('should delete user account', async () => {
      const user = createMockUser({ id: 1 });
      const token = generateTestToken(user.id, user.email);
      
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue({ ...user, isActive: false });

      const res = await request(app)
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .delete('/api/v1/users/me');

      expect(res.status).toBe(401);
    });
  });

  // ==========================================================================
  // POST /api/v1/users/me/avatar
  // ==========================================================================
  describe('POST /users/me/avatar', () => {
    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/v1/users/me/avatar');

      expect(res.status).toBe(401);
    });

    it('should handle avatar upload request', async () => {
      const token = generateTestToken(1);
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));

      const res = await request(app)
        .post('/api/v1/users/me/avatar')
        .set('Authorization', `Bearer ${token}`)
        .send({ avatarUrl: 'https://example.com/avatar.jpg' });

      // Should attempt to process (exact status depends on implementation)
      expect([200, 400, 415]).toContain(res.status);
    });
  });

  // ==========================================================================
  // GET /api/v1/users/me/settings
  // ==========================================================================
  describe('GET /users/me/settings', () => {
    it('should return user settings', async () => {
      const user = createMockUser({ id: 1 });
      const token = generateTestToken(user.id);
      const settings = {
        id: 1,
        userId: user.id,
        units: 'metric',
        theme: 'dark',
        pushEnabled: true,
      };
      
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.userSettings.findUnique.mockResolvedValue(settings);

      const res = await request(app)
        .get('/api/v1/users/me/settings')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .get('/api/v1/users/me/settings');

      expect(res.status).toBe(401);
    });
  });

  // ==========================================================================
  // PATCH /api/v1/users/me/settings
  // ==========================================================================
  describe('PATCH /users/me/settings', () => {
    it('should update user settings', async () => {
      const user = createMockUser({ id: 1 });
      const token = generateTestToken(user.id);
      const settings = {
        id: 1,
        userId: user.id,
        units: 'metric',
        theme: 'dark',
      };
      
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.userSettings.upsert.mockResolvedValue({
        ...settings,
        units: 'imperial',
      });

      const res = await request(app)
        .patch('/api/v1/users/me/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ units: 'imperial' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .patch('/api/v1/users/me/settings')
        .send({ theme: 'light' });

      expect(res.status).toBe(401);
    });

    it('should validate settings data', async () => {
      const token = generateTestToken(1);
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));

      const res = await request(app)
        .patch('/api/v1/users/me/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ units: 'invalid-unit' });

      // Should validate (may accept or reject based on schema)
      expect(res.status).toBe(422);
    });
  });

  // ==========================================================================
  // POST /api/v1/users/me/complete-onboarding
  // ==========================================================================
  describe('POST /users/me/complete-onboarding', () => {
    it('should complete onboarding and persist workoutInterests', async () => {
      const user = createMockUser({ id: 1, emailVerified: true });
      const token = generateTestToken(user.id, user.email);

      const payload = {
        age: 26,
        gender: 'male',
        experienceLevel: 'beginner',
        primaryGoal: 'muscle_gain',
        secondaryGoals: ['strength', 'mass'],
        workoutInterests: ['gym', 'running'],
        trainingDaysPerWeek: 4,
        workoutDuration: 45,
        equipmentAvailable: ['dumbbells', 'barbell'],
        units: 'metric',
      };

      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue({
        ...user,
        onboardingCompleted: true,
        ...payload,
      });
      mockPrisma.userSettings.upsert.mockResolvedValue({
        id: 1,
        userId: user.id,
        units: 'metric',
      });

      const res = await request(app)
        .post('/api/v1/users/me/complete-onboarding')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.onboardingCompleted).toBe(true);
      expect(res.body.data.workoutInterests).toEqual(payload.workoutInterests);
    });

    it('should validate invalid onboarding payload', async () => {
      const user = createMockUser({ id: 1, emailVerified: true });
      const token = generateTestToken(user.id, user.email);
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const res = await request(app)
        .post('/api/v1/users/me/complete-onboarding')
        .set('Authorization', `Bearer ${token}`)
        .send({
          trainingDaysPerWeek: 9, // invalid (must be <= 7)
          workoutInterests: new Array(11).fill('gym'), // invalid (max 10)
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });
});
