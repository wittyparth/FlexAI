import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import exerciseRoutes from './exercise.routes';
import workoutRoutes from './workout.routes';
import routineRouter from './routine.routes';
import { statsRouter } from './stats.routes';
import { bodyRouter } from './body.routes';
import coachRoutes from './coach.routes';
import { socialRoutes } from './social.routes';
import { feedRoutes } from './feed.routes';
import { leaderboardRoutes } from './leaderboard.routes';
import gamificationRoutes from './gamification.routes';
import notificationRoutes from './notification.routes';

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
      routines: '/api/v1/routines',
      stats: '/api/v1/stats',
      social: '/api/v1/social',
      feed: '/api/v1/feed',
      leaderboards: '/api/v1/leaderboards',
      gamification: '/api/v1/gamification',
      notifications: '/api/v1/notifications',
    },
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/workouts', workoutRoutes);
router.use('/routines', routineRouter);
router.use('/stats', statsRouter);
router.use('/body', bodyRouter);
router.use('/coach', coachRoutes);
router.use('/social', socialRoutes);
router.use('/feed', feedRoutes);
router.use('/leaderboards', leaderboardRoutes);
router.use('/gamification', gamificationRoutes);
router.use('/notifications', notificationRoutes);

export default router;

