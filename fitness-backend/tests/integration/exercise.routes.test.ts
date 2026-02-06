/**
 * Exercise Routes Integration Tests
 * Testing all /api/v1/exercises endpoints
 */
import { mockPrisma, resetMocks } from '../utils/mock-prisma';
import request from 'supertest';
import { createApp } from '../../src/app';
import { createMockExercise, createMockUser } from '../utils/factories';
import { generateTestToken } from '../utils/test-utils';

const app = createApp();

describe('Exercise Routes', () => {
  beforeEach(() => {
    resetMocks();
  });

  // ==========================================================================
  // GET /api/v1/exercises/muscle-groups
  // ==========================================================================
  describe('GET /exercises/muscle-groups', () => {
    it('should return list of muscle groups', async () => {
      const res = await request(app)
        .get('/api/v1/exercises/muscle-groups');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ==========================================================================
  // GET /api/v1/exercises/equipment
  // ==========================================================================
  describe('GET /exercises/equipment', () => {
    it('should return list of equipment', async () => {
      const res = await request(app)
        .get('/api/v1/exercises/equipment');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ==========================================================================
  // GET /api/v1/exercises/types
  // ==========================================================================
  describe('GET /exercises/types', () => {
    it('should return list of exercise types', async () => {
      const res = await request(app)
        .get('/api/v1/exercises/types');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ==========================================================================
  // GET /api/v1/exercises/training-goals
  // ==========================================================================
  describe('GET /exercises/training-goals', () => {
    it('should return list of training goals', async () => {
      const res = await request(app)
        .get('/api/v1/exercises/training-goals');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ==========================================================================
  // GET /api/v1/exercises/featured
  // ==========================================================================
  describe('GET /exercises/featured', () => {
    it('should return featured exercises', async () => {
      const exercises = [
        createMockExercise({ isFeatured: true }),
        createMockExercise({ isFeatured: true }),
      ];
      mockPrisma.exercise.findMany.mockResolvedValue(exercises);

      const res = await request(app)
        .get('/api/v1/exercises/featured');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // GET /api/v1/exercises/search
  // ==========================================================================
  describe('GET /exercises/search', () => {
    it('should search exercises by query', async () => {
      const exercises = [
        createMockExercise({ name: 'Bench Press' }),
        createMockExercise({ name: 'Incline Bench Press' }),
      ];
      mockPrisma.exercise.findMany.mockResolvedValue(exercises);

      const res = await request(app)
        .get('/api/v1/exercises/search')
        .query({ q: 'bench' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      mockPrisma.exercise.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/exercises/search')
        .query({ q: 'nonexistent' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // GET /api/v1/exercises
  // ==========================================================================
  describe('GET /exercises', () => {
    it('should return paginated exercises', async () => {
      const exercises = [
        createMockExercise(),
        createMockExercise(),
        createMockExercise(),
      ];
      mockPrisma.exercise.findMany.mockResolvedValue(exercises);
      mockPrisma.exercise.count.mockResolvedValue(3);

      const res = await request(app)
        .get('/api/v1/exercises')
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by muscle group', async () => {
      mockPrisma.exercise.findMany.mockResolvedValue([createMockExercise()]);
      mockPrisma.exercise.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/exercises')
        .query({ muscleGroup: 'chest' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by difficulty', async () => {
      mockPrisma.exercise.findMany.mockResolvedValue([]);
      mockPrisma.exercise.count.mockResolvedValue(0);

      const res = await request(app)
        .get('/api/v1/exercises')
        .query({ difficulty: 'beginner' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by equipment', async () => {
      mockPrisma.exercise.findMany.mockResolvedValue([createMockExercise()]);
      mockPrisma.exercise.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/exercises')
        .query({ equipment: 'barbell' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // POST /api/v1/exercises (Create Custom Exercise)
  // ==========================================================================
  describe('POST /exercises', () => {
    const validExercise = {
      name: 'Custom Exercise',
      description: 'A custom exercise',
      difficulty: 'intermediate',
      exerciseType: 'strength',
      primaryMuscleGroups: ['chest'],
      equipment: ['dumbbell'],
    };

    it('should create custom exercise when authenticated', async () => {
      const token = generateTestToken(1);
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.exercise.create.mockResolvedValue({
        id: 1,
        ...validExercise,
        slug: 'custom-exercise',
        isCustom: true,
        createdById: 1,
      });

      const res = await request(app)
        .post('/api/v1/exercises')
        .set('Authorization', `Bearer ${token}`)
        .send(validExercise);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/v1/exercises')
        .send(validExercise);

      expect(res.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const token = generateTestToken(1);
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));

      const res = await request(app)
        .post('/api/v1/exercises')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Missing name' });

      expect(res.status).toBe(422);
    });
  });

  // ==========================================================================
  // GET /api/v1/exercises/slug/:slug
  // ==========================================================================
  describe('GET /exercises/slug/:slug', () => {
    it('should return exercise by slug', async () => {
      const exercise = createMockExercise({ slug: 'bench-press' });
      mockPrisma.exercise.findUnique.mockResolvedValue(exercise);

      const res = await request(app)
        .get('/api/v1/exercises/slug/bench-press');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('bench-press');
    });

    it('should return 404 for non-existent slug', async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/exercises/slug/non-existent');

      expect(res.status).toBe(404);
    });
  });

  // ==========================================================================
  // GET /api/v1/exercises/:id
  // ==========================================================================
  describe('GET /exercises/:id', () => {
    it('should return exercise by ID', async () => {
      const exercise = createMockExercise({ id: 1 });
      mockPrisma.exercise.findUnique.mockResolvedValue(exercise);

      const res = await request(app)
        .get('/api/v1/exercises/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent ID', async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/exercises/999');

      expect(res.status).toBe(404);
    });
  });

  // ==========================================================================
  // PATCH /api/v1/exercises/:id
  // ==========================================================================
  describe('PATCH /exercises/:id', () => {
    it('should update custom exercise by owner', async () => {
      const token = generateTestToken(1);
      const exercise = createMockExercise({ id: 1, isCustom: true, createdById: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.exercise.findUnique.mockResolvedValue(exercise);
      mockPrisma.exercise.update.mockResolvedValue({
        ...exercise,
        name: 'Updated Name',
      });

      const res = await request(app)
        .patch('/api/v1/exercises/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .patch('/api/v1/exercises/1')
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(401);
    });

    it('should return 403 for non-owner', async () => {
      const token = generateTestToken(2); // Different user
      const exercise = createMockExercise({ id: 1, isCustom: true, createdById: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 2 }));
      mockPrisma.exercise.findUnique.mockResolvedValue(exercise);

      const res = await request(app)
        .patch('/api/v1/exercises/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(403);
    });

    it('should return 404 for non-existent exercise', async () => {
      const token = generateTestToken(1);
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.exercise.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .patch('/api/v1/exercises/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(404);
    });
  });

  // ==========================================================================
  // DELETE /api/v1/exercises/:id
  // ==========================================================================
  describe('DELETE /exercises/:id', () => {
    it('should delete custom exercise by owner', async () => {
      const token = generateTestToken(1);
      const exercise = createMockExercise({ id: 1, isCustom: true, createdById: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.exercise.findUnique.mockResolvedValue(exercise);
      mockPrisma.exercise.delete.mockResolvedValue(exercise);

      const res = await request(app)
        .delete('/api/v1/exercises/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .delete('/api/v1/exercises/1');

      expect(res.status).toBe(401);
    });

    it('should return 403 for non-owner', async () => {
      const token = generateTestToken(2);
      const exercise = createMockExercise({ id: 1, isCustom: true, createdById: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 2 }));
      mockPrisma.exercise.findUnique.mockResolvedValue(exercise);

      const res = await request(app)
        .delete('/api/v1/exercises/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('should return 403 for non-custom exercise', async () => {
      const token = generateTestToken(1);
      const exercise = createMockExercise({ id: 1, isCustom: false });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.exercise.findUnique.mockResolvedValue(exercise);

      const res = await request(app)
        .delete('/api/v1/exercises/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });
});
