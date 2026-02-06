import { Router } from 'express';
import { leaderboardController } from '../controllers/leaderboard.controller';
import { authenticate } from '../middleware';

const router = Router();

// Auth required
router.use(authenticate);

// Leaderboards
router.get('/rankings/:type', leaderboardController.getLeaderboard as any);

// Challenges
router.get('/challenges', leaderboardController.getChallenges as any);
router.post('/challenges', leaderboardController.createChallenge as any); // TODO: Admin guard in future
router.post('/challenges/:id/join', leaderboardController.joinChallenge as any);

export const leaderboardRoutes = router;
