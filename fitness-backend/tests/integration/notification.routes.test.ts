/**
 * Notification Routes Integration Tests
 * Testing all /api/v1/notifications endpoints
 */
import { mockPrisma, resetMocks } from '../utils/mock-prisma';
import request from 'supertest';
import { createApp } from '../../src/app';
import { createMockUser, createMockNotification } from '../utils/factories';
import { generateTestToken } from '../utils/test-utils';

const app = createApp();

describe('Notification Routes', () => {
  beforeEach(() => {
    resetMocks();
  });

  // ==========================================================================
  // POST /api/v1/notifications/register-device
  // ==========================================================================
  describe('POST /notifications/register-device', () => {
    it('should register device token', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.deviceToken.upsert.mockResolvedValue({ id: 1, userId: 1, token: 'device-token' });

      const res = await request(app)
        .post('/api/v1/notifications/register-device')
        .set('Authorization', `Bearer ${token}`)
        .send({ deviceToken: 'fcm-device-token', platform: 'ios' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/v1/notifications/register-device')
        .send({ deviceToken: 'token', platform: 'ios' });

      expect(res.status).toBe(401);
    });

    it('should validate device token', async () => {
      const token = generateTestToken(1);
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));

      const res = await request(app)
        .post('/api/v1/notifications/register-device')
        .set('Authorization', `Bearer ${token}`)
        .send({}); // Missing token

      expect(res.status).toBe(422);
    });
  });

  // ==========================================================================
  // GET /api/v1/notifications
  // ==========================================================================
  describe('GET /notifications', () => {
    it('should return user notifications', async () => {
      const token = generateTestToken(1);
      const notifications = [
        createMockNotification({ id: 1 }),
        createMockNotification({ id: 2 }),
      ];
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.notification.findMany.mockResolvedValue(notifications);
      mockPrisma.notification.count.mockResolvedValue(2);

      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app).get('/api/v1/notifications');
      expect(res.status).toBe(401);
    });

    it('should support pagination', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.notification.findMany.mockResolvedValue([]);
      mockPrisma.notification.count.mockResolvedValue(0);

      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 1, limit: 20 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by read status', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.notification.findMany.mockResolvedValue([]);
      mockPrisma.notification.count.mockResolvedValue(0);

      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${token}`)
        .query({ unreadOnly: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // PATCH /api/v1/notifications/:id/read
  // ==========================================================================
  describe('PATCH /notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      const token = generateTestToken(1);
      const notification = createMockNotification({ id: 1, userId: 1, isRead: false });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.notification.findUnique.mockResolvedValue(notification);
      mockPrisma.notification.update.mockResolvedValue({ ...notification, isRead: true });

      const res = await request(app)
        .patch('/api/v1/notifications/1/read')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent notification', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.notification.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .patch('/api/v1/notifications/999/read')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should return 403 for other user notification', async () => {
      const token = generateTestToken(1);
      const notification = createMockNotification({ id: 1, userId: 2 }); // Different user
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.notification.findUnique.mockResolvedValue(notification);

      const res = await request(app)
        .patch('/api/v1/notifications/1/read')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });

  // ==========================================================================
  // PATCH /api/v1/notifications/read-all
  // ==========================================================================
  describe('PATCH /notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const res = await request(app)
        .patch('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app).patch('/api/v1/notifications/read-all');
      expect(res.status).toBe(401);
    });
  });
});
