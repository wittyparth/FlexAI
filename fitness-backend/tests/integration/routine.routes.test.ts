/**
 * Routine Routes Integration Tests
 * Testing all /api/v1/routines endpoints
 */
import { mockPrisma, resetMocks } from '../utils/mock-prisma';
import request from 'supertest';
import { createApp } from '../../src/app';
import { createMockUser, createMockRoutine, createMockExercise } from '../utils/factories';
import { generateTestToken } from '../utils/test-utils';

const app = createApp();

describe('Routine Routes', () => {
  beforeEach(() => {
    resetMocks();
  });

  // ==========================================================================
  // POST /api/v1/routines
  // ==========================================================================
  describe('POST /routines', () => {
    const validRoutine = {
      name: 'Push Day',
      description: 'Chest, shoulders, triceps',
      goal: 'muscle_gain',
      difficulty: 'intermediate',
    };

    it('should create a new routine', async () => {
      const token = generateTestToken(1);
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.routine.create.mockResolvedValue(createMockRoutine({ ...validRoutine }));

      const res = await request(app)
        .post('/api/v1/routines')
        .set('Authorization', `Bearer ${token}`)
        .send(validRoutine);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(validRoutine.name);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/v1/routines')
        .send(validRoutine);

      expect(res.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const token = generateTestToken(1);
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));

      const res = await request(app)
        .post('/api/v1/routines')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Missing name' });

      expect(res.status).toBe(422);
    });
  });

  // ==========================================================================
  // POST /api/v1/routines/generate (AI Generation)
  // ==========================================================================
  describe('POST /routines/generate', () => {
    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/v1/routines/generate')
        .send({ goal: 'muscle_gain', daysPerWeek: 3 });

      expect(res.status).toBe(401);
    });

    it('should validate generation parameters', async () => {
      const token = generateTestToken(1);
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));

      const res = await request(app)
        .post('/api/v1/routines/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({}); // Missing required fields

      expect(res.status).toBe(422);
    });
  });

  // ==========================================================================
  // GET /api/v1/routines
  // ==========================================================================
  describe('GET /routines', () => {
    it('should return user routines', async () => {
      const token = generateTestToken(1);
      const routines = [createMockRoutine(), createMockRoutine()];
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.routine.findMany.mockResolvedValue(routines);
      mockPrisma.routine.count.mockResolvedValue(2);

      const res = await request(app)
        .get('/api/v1/routines')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app).get('/api/v1/routines');
      expect(res.status).toBe(401);
    });
  });

  // ==========================================================================
  // GET /api/v1/routines/library
  // ==========================================================================
  describe('GET /routines/library', () => {
    it('should return public routines', async () => {
      const token = generateTestToken(1);
      const routines = [createMockRoutine({ isPublic: true })];
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.routine.findMany.mockResolvedValue(routines);
      mockPrisma.routine.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/routines/library')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // GET /api/v1/routines/:id
  // ==========================================================================
  describe('GET /routines/:id', () => {
    it('should return routine by ID', async () => {
      const token = generateTestToken(1);
      const routine = createMockRoutine({ id: 1, userId: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.routine.findUnique.mockResolvedValue(routine);

      const res = await request(app)
        .get('/api/v1/routines/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent routine', async () => {
      const token = generateTestToken(1);
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.routine.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/routines/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  // ==========================================================================
  // PATCH /api/v1/routines/:id
  // ==========================================================================
  describe('PATCH /routines/:id', () => {
    it('should update routine', async () => {
      const token = generateTestToken(1);
      const routine = createMockRoutine({ id: 1, userId: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.routine.findUnique.mockResolvedValue(routine);
      mockPrisma.routine.update.mockResolvedValue({ ...routine, name: 'Updated Name' });

      const res = await request(app)
        .patch('/api/v1/routines/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 403 for other user routine', async () => {
      const token = generateTestToken(1);
      const routine = createMockRoutine({ id: 1, userId: 2 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.routine.findUnique.mockResolvedValue(routine);

      const res = await request(app)
        .patch('/api/v1/routines/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated' });

      expect(res.status).toBe(403);
    });
  });

  // ==========================================================================
  // DELETE /api/v1/routines/:id
  // ==========================================================================
  describe('DELETE /routines/:id', () => {
    it('should delete routine', async () => {
      const token = generateTestToken(1);
      const routine = createMockRoutine({ id: 1, userId: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.routine.findUnique.mockResolvedValue(routine);
      mockPrisma.routine.delete.mockResolvedValue(routine);

      const res = await request(app)
        .delete('/api/v1/routines/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 403 for other user routine', async () => {
      const token = generateTestToken(1);
      const routine = createMockRoutine({ id: 1, userId: 2 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.routine.findUnique.mockResolvedValue(routine);

      const res = await request(app)
        .delete('/api/v1/routines/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });

  // ==========================================================================
  // POST /api/v1/routines/:id/duplicate
  // ==========================================================================
  describe('POST /routines/:id/duplicate', () => {
    it('should duplicate routine', async () => {
      const token = generateTestToken(1);
      const routine = createMockRoutine({ id: 1, isPublic: true });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.routine.findUnique.mockResolvedValue({ ...routine, exercises: [] });
      mockPrisma.routine.create.mockResolvedValue(createMockRoutine({ id: 2, userId: 1 }));

      const res = await request(app)
        .post('/api/v1/routines/1/duplicate')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // POST /api/v1/routines/:id/like
  // ==========================================================================
  describe('POST /routines/:id/like', () => {
    it('should toggle like on routine', async () => {
      const token = generateTestToken(1);
      const routine = createMockRoutine({ id: 1, isPublic: true });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.routine.findUnique.mockResolvedValue(routine);
      mockPrisma.routine.update.mockResolvedValue({ ...routine, likes: 1 });

      const res = await request(app)
        .post('/api/v1/routines/1/like')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // POST /api/v1/routines/:id/exercises
  // ==========================================================================
  describe('POST /routines/:id/exercises', () => {
    it('should add exercise to routine', async () => {
      const token = generateTestToken(1);
      const routine = createMockRoutine({ id: 1, userId: 1 });
      const exercise = createMockExercise({ id: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.routine.findUnique.mockResolvedValue(routine);
      mockPrisma.exercise.findUnique.mockResolvedValue(exercise);
      mockPrisma.routineExercise.create.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .post('/api/v1/routines/1/exercises')
        .set('Authorization', `Bearer ${token}`)
        .send({ exerciseId: 1, targetSets: 3, targetRepsMin: 8, targetRepsMax: 12 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // PATCH /api/v1/routines/:id/exercises/:exerciseId
  // ==========================================================================
  describe('PATCH /routines/:id/exercises/:exerciseId', () => {
    it('should update routine exercise', async () => {
      const token = generateTestToken(1);
      const routine = createMockRoutine({ id: 1, userId: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.routine.findUnique.mockResolvedValue(routine);
      mockPrisma.routineExercise.findUnique.mockResolvedValue({ id: 1, routineId: 1 });
      mockPrisma.routineExercise.update.mockResolvedValue({ id: 1, targetSets: 4 });

      const res = await request(app)
        .patch('/api/v1/routines/1/exercises/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ targetSets: 4 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // DELETE /api/v1/routines/:id/exercises/:exerciseId
  // ==========================================================================
  describe('DELETE /routines/:id/exercises/:exerciseId', () => {
    it('should remove exercise from routine', async () => {
      const token = generateTestToken(1);
      const routine = createMockRoutine({ id: 1, userId: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.routine.findUnique.mockResolvedValue(routine);
      mockPrisma.routineExercise.findUnique.mockResolvedValue({ id: 1, routineId: 1 });
      mockPrisma.routineExercise.delete.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .delete('/api/v1/routines/1/exercises/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // PUT /api/v1/routines/:id/exercises/reorder
  // ==========================================================================
  describe('PUT /routines/:id/exercises/reorder', () => {
    it('should reorder exercises', async () => {
      const token = generateTestToken(1);
      const routine = createMockRoutine({ id: 1, userId: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.routine.findUnique.mockResolvedValue(routine);
      mockPrisma.$transaction.mockImplementation((promises: any[]) => Promise.all(promises));
      mockPrisma.routineExercise.update.mockResolvedValue({ id: 1 });
      mockPrisma.routineExercise.updateMany.mockResolvedValue({ count: 3 });

      const res = await request(app)
        .put('/api/v1/routines/1/exercises/reorder')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          exercises: [
            { routineExerciseId: 3, orderIndex: 0 },
            { routineExerciseId: 1, orderIndex: 1 },
            { routineExerciseId: 2, orderIndex: 2 }
          ] 
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
