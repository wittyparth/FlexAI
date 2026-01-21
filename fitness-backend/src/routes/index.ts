import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import exerciseRoutes from './exercise.routes';
import workoutRoutes from './workout.routes';

const router = Router();

// API info
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Fitness API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      exercises: '/api/v1/exercises',
      workouts: '/api/v1/workouts',
      // Coming soon:
      // routines: '/api/v1/routines',
      // stats: '/api/v1/stats',
    },
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/workouts', workoutRoutes);

export default router;
