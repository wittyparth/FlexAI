/**
 * Workout Routes Integration Tests
 * Testing all /api/v1/workouts endpoints
 */
import { mockPrisma, resetMocks } from '../utils/mock-prisma';
import request from 'supertest';
import { createApp } from '../../src/app';
import { createMockUser, createMockWorkout, createMockExercise, createMockWorkoutSet, createCompletedWorkout } from '../utils/factories';
import { generateTestToken } from '../utils/test-utils';

const app = createApp();

describe('Workout Routes', () => {
  beforeEach(() => {
    resetMocks();
  });

  // ==========================================================================
  // POST /api/v1/workouts (Start Workout)
  // ==========================================================================
  describe('POST /workouts', () => {
    it('should start a new workout', async () => {
      const token = generateTestToken(1);
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.create.mockResolvedValue(createMockWorkout({ id: 1, userId: 1 }));

      const res = await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Morning Workout' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
    });

    it('should start workout from routine', async () => {
      const token = generateTestToken(1);
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.routine.findUnique.mockResolvedValue({ id: 1, userId: 1 });
      mockPrisma.workout.create.mockResolvedValue(createMockWorkout({ routineId: 1 }));

      const res = await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${token}`)
        .send({ routineId: 1 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/v1/workouts')
        .send({ name: 'Test' });

      expect(res.status).toBe(401);
    });
  });

  // ==========================================================================
  // GET /api/v1/workouts
  // ==========================================================================
  describe('GET /workouts', () => {
    it('should return user workouts', async () => {
      const token = generateTestToken(1);
      const workouts = [createMockWorkout(), createCompletedWorkout()];
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findMany.mockResolvedValue(workouts);
      mockPrisma.workout.count.mockResolvedValue(2);

      const res = await request(app)
        .get('/api/v1/workouts')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by status', async () => {
      const token = generateTestToken(1);
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findMany.mockResolvedValue([createCompletedWorkout()]);
      mockPrisma.workout.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/workouts')
        .set('Authorization', `Bearer ${token}`)
        .query({ status: 'completed' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app).get('/api/v1/workouts');
      expect(res.status).toBe(401);
    });
  });

  // ==========================================================================
  // GET /api/v1/workouts/current
  // ==========================================================================
  describe('GET /workouts/current', () => {
    it('should return current in-progress workout', async () => {
      const token = generateTestToken(1);
      const workout = createMockWorkout({ status: 'in_progress' });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findFirst.mockResolvedValue(workout);

      const res = await request(app)
        .get('/api/v1/workouts/current')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return null when no workout in progress', async () => {
      const token = generateTestToken(1);
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/workouts/current')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeNull();
    });
  });

  // ==========================================================================
  // GET /api/v1/workouts/:id
  // ==========================================================================
  describe('GET /workouts/:id', () => {
    it('should return workout by ID', async () => {
      const token = generateTestToken(1);
      const workout = createMockWorkout({ id: 1, userId: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findUnique.mockResolvedValue(workout);

      const res = await request(app)
        .get('/api/v1/workouts/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent workout', async () => {
      const token = generateTestToken(1);
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/workouts/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should return 403 for other user workout', async () => {
      const token = generateTestToken(1);
      const workout = createMockWorkout({ id: 1, userId: 2 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findUnique.mockResolvedValue(workout);

      const res = await request(app)
        .get('/api/v1/workouts/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });

  // ==========================================================================
  // PATCH /api/v1/workouts/:id
  // ==========================================================================
  describe('PATCH /workouts/:id', () => {
    it('should update workout', async () => {
      const token = generateTestToken(1);
      const workout = createMockWorkout({ id: 1, userId: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findUnique.mockResolvedValue(workout);
      mockPrisma.workout.update.mockResolvedValue({ ...workout, notes: 'Updated notes' });

      const res = await request(app)
        .patch('/api/v1/workouts/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ notes: 'Updated notes' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 403 for other user workout', async () => {
      const token = generateTestToken(1);
      const workout = createMockWorkout({ id: 1, userId: 2 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findUnique.mockResolvedValue(workout);

      const res = await request(app)
        .patch('/api/v1/workouts/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ notes: 'Updated notes' });

      expect(res.status).toBe(403);
    });
  });

  // ==========================================================================
  // DELETE /api/v1/workouts/:id
  // ==========================================================================
  describe('DELETE /workouts/:id', () => {
    it('should delete workout', async () => {
      const token = generateTestToken(1);
      const workout = createMockWorkout({ id: 1, userId: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findUnique.mockResolvedValue(workout);
      mockPrisma.workout.delete.mockResolvedValue(workout);

      const res = await request(app)
        .delete('/api/v1/workouts/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 403 for other user workout', async () => {
      const token = generateTestToken(1);
      const workout = createMockWorkout({ id: 1, userId: 2 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findUnique.mockResolvedValue(workout);

      const res = await request(app)
        .delete('/api/v1/workouts/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });

  // ==========================================================================
  // POST /api/v1/workouts/:id/complete
  // ==========================================================================
  describe('POST /workouts/:id/complete', () => {
    it('should complete workout', async () => {
      const token = generateTestToken(1);
      const workout = createMockWorkout({ id: 1, userId: 1, status: 'in_progress' });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findUnique.mockResolvedValue(workout);
      mockPrisma.workout.update.mockResolvedValue({ ...workout, status: 'completed' });
      mockPrisma.user.update.mockResolvedValue(createMockUser());

      const res = await request(app)
        .post('/api/v1/workouts/1/complete')
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 4, notes: 'Great workout!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for already completed workout', async () => {
      const token = generateTestToken(1);
      const workout = createMockWorkout({ id: 1, userId: 1, status: 'completed' });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findUnique.mockResolvedValue(workout);

      const res = await request(app)
        .post('/api/v1/workouts/1/complete')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  // ==========================================================================
  // POST /api/v1/workouts/:id/cancel
  // ==========================================================================
  describe('POST /workouts/:id/cancel', () => {
    it('should cancel workout', async () => {
      const token = generateTestToken(1);
      const workout = createMockWorkout({ id: 1, userId: 1, status: 'in_progress' });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findUnique.mockResolvedValue(workout);
      mockPrisma.workout.update.mockResolvedValue({ ...workout, status: 'cancelled' });

      const res = await request(app)
        .post('/api/v1/workouts/1/cancel')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // POST /api/v1/workouts/:id/exercises
  // ==========================================================================
  describe('POST /workouts/:id/exercises', () => {
    it('should add exercise to workout', async () => {
      const token = generateTestToken(1);
      const workout = createMockWorkout({ id: 1, userId: 1 });
      const exercise = createMockExercise({ id: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findUnique.mockResolvedValue(workout);
      mockPrisma.exercise.findUnique.mockResolvedValue(exercise);
      mockPrisma.workoutExercise.create.mockResolvedValue({ id: 1, workoutId: 1, exerciseId: 1 });

      const res = await request(app)
        .post('/api/v1/workouts/1/exercises')
        .set('Authorization', `Bearer ${token}`)
        .send({ exerciseId: 1 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent exercise', async () => {
      const token = generateTestToken(1);
      const workout = createMockWorkout({ id: 1, userId: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findUnique.mockResolvedValue(workout);
      mockPrisma.exercise.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/workouts/1/exercises')
        .set('Authorization', `Bearer ${token}`)
        .send({ exerciseId: 999 });

      expect(res.status).toBe(404);
    });
  });

  // ==========================================================================
  // DELETE /api/v1/workouts/:id/exercises/:exerciseId
  // ==========================================================================
  describe('DELETE /workouts/:id/exercises/:exerciseId', () => {
    it('should remove exercise from workout', async () => {
      const token = generateTestToken(1);
      const workout = createMockWorkout({ id: 1, userId: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findUnique.mockResolvedValue(workout);
      mockPrisma.workoutExercise.findFirst.mockResolvedValue({ id: 1 });
      mockPrisma.workoutExercise.delete.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .delete('/api/v1/workouts/1/exercises/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // POST /api/v1/workouts/:id/exercises/:exerciseId/sets
  // ==========================================================================
  describe('POST /workouts/:id/exercises/:exerciseId/sets', () => {
    it('should log a set', async () => {
      const token = generateTestToken(1);
      const workout = createMockWorkout({ id: 1, userId: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findUnique.mockResolvedValue(workout);
      mockPrisma.workoutExercise.findUnique.mockResolvedValue({ id: 1, workoutId: 1 });
      mockPrisma.workoutSet.create.mockResolvedValue(createMockWorkoutSet());

      const res = await request(app)
        .post('/api/v1/workouts/1/exercises/1/sets')
        .set('Authorization', `Bearer ${token}`)
        .send({ weight: 100, reps: 10, rpe: 8 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should validate set data', async () => {
      const token = generateTestToken(1);
      const workout = createMockWorkout({ id: 1, userId: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findUnique.mockResolvedValue(workout);
      mockPrisma.workoutExercise.findUnique.mockResolvedValue({ id: 1, workoutId: 1 });

      const res = await request(app)
        .post('/api/v1/workouts/1/exercises/1/sets')
        .set('Authorization', `Bearer ${token}`)
        .send({ weight: -10 }); // Invalid weight

      expect(res.status).toBe(422);
    });
  });

  // ==========================================================================
  // PATCH /api/v1/workouts/:id/sets/:setId
  // ==========================================================================
  describe('PATCH /workouts/:id/sets/:setId', () => {
    it('should update a set', async () => {
      const token = generateTestToken(1);
      const workout = createMockWorkout({ id: 1, userId: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findUnique.mockResolvedValue(workout);
      mockPrisma.workoutSet.findUnique.mockResolvedValue({ ...createMockWorkoutSet({ id: 1 }), workoutExercise: { workoutId: 1 } });
      mockPrisma.workoutSet.update.mockResolvedValue({ ...createMockWorkoutSet(), weight: 110 });

      const res = await request(app)
        .patch('/api/v1/workouts/1/sets/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ weight: 110 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // DELETE /api/v1/workouts/:id/sets/:setId
  // ==========================================================================
  describe('DELETE /workouts/:id/sets/:setId', () => {
    it('should delete a set', async () => {
      const token = generateTestToken(1);
      const workout = createMockWorkout({ id: 1, userId: 1 });
      
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.workout.findUnique.mockResolvedValue(workout);
      mockPrisma.workoutSet.findUnique.mockResolvedValue({ ...createMockWorkoutSet({ id: 1 }), workoutExercise: { workoutId: 1 } });
      mockPrisma.workoutSet.delete.mockResolvedValue(createMockWorkoutSet());

      const res = await request(app)
        .delete('/api/v1/workouts/1/sets/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
