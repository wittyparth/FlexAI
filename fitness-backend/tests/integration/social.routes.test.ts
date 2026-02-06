/**
 * Social Routes Integration Tests
 * Testing all /api/v1/social endpoints
 */
import { mockPrisma, resetMocks } from '../utils/mock-prisma';
import request from 'supertest';
import { createApp } from '../../src/app';
import { createMockUser } from '../utils/factories';
import { generateTestToken } from '../utils/test-utils';

const app = createApp();

describe('Social Routes', () => {
  beforeEach(() => {
    resetMocks();
  });

  // ==========================================================================
  // POST /api/v1/social/follow/:userId
  // ==========================================================================
  describe('POST /social/follow/:userId', () => {
    it('should follow a user', async () => {
      const token = generateTestToken(1);
      const targetUser = createMockUser({ id: 2 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.user.findUnique.mockResolvedValueOnce(targetUser);
      mockPrisma.follower.findUnique.mockResolvedValue(null);
      mockPrisma.follower.create.mockResolvedValue({ id: 1, followerId: 1, followingId: 2 });

      const res = await request(app)
        .post('/api/v1/social/follow/2')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent user', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.user.findUnique.mockResolvedValueOnce(null); // Target doesn't exist

      const res = await request(app)
        .post('/api/v1/social/follow/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should return 400 for self-follow', async () => {
      const token = generateTestToken(1);
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));

      const res = await request(app)
        .post('/api/v1/social/follow/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/v1/social/follow/2');

      expect(res.status).toBe(401);
    });
  });

  // ==========================================================================
  // DELETE /api/v1/social/unfollow/:userId
  // ==========================================================================
  describe('DELETE /social/unfollow/:userId', () => {
    it('should unfollow a user', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.follower.findUnique.mockResolvedValue({ id: 1, followerId: 1, followingId: 2 });
      mockPrisma.follower.delete.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .delete('/api/v1/social/unfollow/2')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 if not following', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.follower.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/v1/social/unfollow/2')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
    });
  });

  // ==========================================================================
  // GET /api/v1/social/follow-status/:userId
  // ==========================================================================
  describe('GET /social/follow-status/:userId', () => {
    it('should return follow status', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.follower.findUnique.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .get('/api/v1/social/follow-status/2')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('isFollowing');
    });
  });

  // ==========================================================================
  // GET /api/v1/social/followers
  // ==========================================================================
  describe('GET /social/followers', () => {
    it('should return followers list', async () => {
      const token = generateTestToken(1);
      const followers = [
        { id: 1, follower: createMockUser({ id: 2 }) },
      ];
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.follower.findMany.mockResolvedValue(followers);
      mockPrisma.follower.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/social/followers')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should support pagination', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.follower.findMany.mockResolvedValue([]);
      mockPrisma.follower.count.mockResolvedValue(0);

      const res = await request(app)
        .get('/api/v1/social/followers')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // GET /api/v1/social/following
  // ==========================================================================
  describe('GET /social/following', () => {
    it('should return following list', async () => {
      const token = generateTestToken(1);
      const following = [
        { id: 1, following: createMockUser({ id: 2 }) },
      ];
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.follower.findMany.mockResolvedValue(following);
      mockPrisma.follower.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/social/following')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
