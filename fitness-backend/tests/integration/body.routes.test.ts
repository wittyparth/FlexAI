/**
 * Body Routes Integration Tests
 * Testing all /api/v1/body endpoints
 */
import { mockPrisma, resetMocks } from '../utils/mock-prisma';
import request from 'supertest';
import { createApp } from '../../src/app';
import { createMockUser, createMockBodyWeight } from '../utils/factories';
import { generateTestToken } from '../utils/test-utils';

const app = createApp();

describe('Body Routes', () => {
  beforeEach(() => {
    resetMocks();
  });

  // ==========================================================================
  // POST /api/v1/body/weight
  // ==========================================================================
  describe('POST /body/weight', () => {
    it('should log weight', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.bodyWeight.create.mockResolvedValue(createMockBodyWeight());

      const res = await request(app)
        .post('/api/v1/body/weight')
        .set('Authorization', `Bearer ${token}`)
        .send({ weight: 75.5 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/v1/body/weight')
        .send({ weight: 75.5 });

      expect(res.status).toBe(401);
    });

    it('should validate weight value', async () => {
      const token = generateTestToken(1);
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));

      const res = await request(app)
        .post('/api/v1/body/weight')
        .set('Authorization', `Bearer ${token}`)
        .send({ weight: -10 }); // Invalid

      expect(res.status).toBe(422);
    });
  });

  // ==========================================================================
  // GET /api/v1/body/weight-history
  // ==========================================================================
  describe('GET /body/weight-history', () => {
    it('should return weight history', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.bodyWeight.findMany.mockResolvedValue([createMockBodyWeight()]);

      const res = await request(app)
        .get('/api/v1/body/weight-history')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should accept date range parameters', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.bodyWeight.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/body/weight-history')
        .set('Authorization', `Bearer ${token}`)
        .query({ startDate: '2024-01-01', endDate: '2024-12-31' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // POST /api/v1/body/measurements
  // ==========================================================================
  describe('POST /body/measurements', () => {
    it('should log body measurements', async () => {
      const token = generateTestToken(1);
      const measurements = {
        chest: 100,
        waist: 80,
        hips: 95,
      };
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.bodyMeasurement.create.mockResolvedValue({ id: 1, userId: 1, ...measurements });

      const res = await request(app)
        .post('/api/v1/body/measurements')
        .set('Authorization', `Bearer ${token}`)
        .send(measurements);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/v1/body/measurements')
        .send({ chest: 100 });

      expect(res.status).toBe(401);
    });
  });

  // ==========================================================================
  // GET /api/v1/body/measurements-history
  // ==========================================================================
  describe('GET /body/measurements-history', () => {
    it('should return measurements history', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.bodyMeasurement.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/body/measurements-history')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // POST /api/v1/body/photos
  // ==========================================================================
  describe('POST /body/photos', () => {
    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/v1/body/photos')
        .send({ imageUrl: 'https://example.com/photo.jpg' });

      expect(res.status).toBe(401);
    });

    it('should handle photo upload request', async () => {
      const token = generateTestToken(1);
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.progressPhoto.create.mockResolvedValue({ id: 1, userId: 1 });

      const res = await request(app)
        .post('/api/v1/body/photos')
        .set('Authorization', `Bearer ${token}`)
        .send({ imageUrl: 'https://example.com/photo.jpg', category: 'front' });

      expect(res.status).toBe(201);
    });
  });

  // ==========================================================================
  // GET /api/v1/body/photos
  // ==========================================================================
  describe('GET /body/photos', () => {
    it('should return progress photos', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.progressPhoto.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/body/photos')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by category', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.progressPhoto.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/body/photos')
        .set('Authorization', `Bearer ${token}`)
        .query({ category: 'front' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
