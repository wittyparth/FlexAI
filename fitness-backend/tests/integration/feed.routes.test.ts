/**
 * Feed Routes Integration Tests
 * Testing all /api/v1/feed endpoints
 */
import { mockPrisma, resetMocks } from '../utils/mock-prisma';
import request from 'supertest';
import { createApp } from '../../src/app';
import { createMockUser, createMockPost, createMockComment } from '../utils/factories';
import { generateTestToken } from '../utils/test-utils';

const app = createApp();

describe('Feed Routes', () => {
  beforeEach(() => {
    resetMocks();
  });

  // ==========================================================================
  // GET /api/v1/feed
  // ==========================================================================
  describe('GET /feed', () => {
    it('should return global feed', async () => {
      const token = generateTestToken(1);
      const posts = [createMockPost(), createMockPost()];
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.post.findMany.mockResolvedValue(posts);
      mockPrisma.post.count.mockResolvedValue(2);

      const res = await request(app)
        .get('/api/v1/feed')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app).get('/api/v1/feed');
      expect(res.status).toBe(401);
    });

    it('should support pagination', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);

      const res = await request(app)
        .get('/api/v1/feed')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 1, limit: 20 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // GET /api/v1/feed/following
  // ==========================================================================
  describe('GET /feed/following', () => {
    it('should return personalized feed', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.follower.findMany.mockResolvedValue([{ followingId: 2 }]);
      mockPrisma.post.findMany.mockResolvedValue([createMockPost({ userId: 2 })]);
      mockPrisma.post.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/feed/following')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // POST /api/v1/feed/posts
  // ==========================================================================
  describe('POST /feed/posts', () => {
    it('should create a post', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.post.create.mockResolvedValue(createMockPost({ userId: 1 }));

      const res = await request(app)
        .post('/api/v1/feed/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Just finished a great workout!' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should create post with workout reference', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findUnique.mockResolvedValue({ id: 1, userId: 1 });
      mockPrisma.post.create.mockResolvedValue(createMockPost({ workoutId: 1 }));

      const res = await request(app)
        .post('/api/v1/feed/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'New PR!', workoutId: 1 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should validate content', async () => {
      const token = generateTestToken(1);
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));

      const res = await request(app)
        .post('/api/v1/feed/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({}); // Missing content

      expect(res.status).toBe(422);
    });
  });

  // ==========================================================================
  // POST /api/v1/feed/posts/:postId/like
  // ==========================================================================
  describe('POST /feed/posts/:postId/like', () => {
    it('should toggle like on post', async () => {
      const token = generateTestToken(1);
      const post = createMockPost({ id: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.post.findUnique.mockResolvedValue(post);
      mockPrisma.like.findFirst.mockResolvedValue(null);
      mockPrisma.like.create.mockResolvedValue({ id: 1, postId: 1, userId: 1 });
      mockPrisma.post.update.mockResolvedValue({ ...post, likesCount: 1 });

      const res = await request(app)
        .post('/api/v1/feed/posts/1/like')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent post', async () => {
      const token = generateTestToken(1);
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.post.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/feed/posts/999/like')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  // ==========================================================================
  // POST /api/v1/feed/posts/:postId/comments
  // ==========================================================================
  describe('POST /feed/posts/:postId/comments', () => {
    it('should add comment to post', async () => {
      const token = generateTestToken(1);
      const post = createMockPost({ id: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.post.findUnique.mockResolvedValue(post);
      mockPrisma.comment.create.mockResolvedValue(createMockComment());
      mockPrisma.post.update.mockResolvedValue({ ...post, commentsCount: 1 });

      const res = await request(app)
        .post('/api/v1/feed/posts/1/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Great job!' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should validate comment content', async () => {
      const token = generateTestToken(1);
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.post.findUnique.mockResolvedValue(createMockPost({ id: 1 }));

      const res = await request(app)
        .post('/api/v1/feed/posts/1/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({}); // Missing content

      expect(res.status).toBe(422);
    });
  });

  // ==========================================================================
  // DELETE /api/v1/feed/comments/:commentId
  // ==========================================================================
  describe('DELETE /feed/comments/:commentId', () => {
    it('should delete own comment', async () => {
      const token = generateTestToken(1);
      const comment = createMockComment({ id: 1, userId: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.comment.findUnique.mockResolvedValue(comment);
      mockPrisma.comment.delete.mockResolvedValue(comment);
      mockPrisma.post.update.mockResolvedValue({});

      const res = await request(app)
        .delete('/api/v1/feed/comments/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 403 for other user comment', async () => {
      const token = generateTestToken(1);
      const comment = createMockComment({ id: 1, userId: 2 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.comment.findUnique.mockResolvedValue(comment);

      const res = await request(app)
        .delete('/api/v1/feed/comments/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });
});
