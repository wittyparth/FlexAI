import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { statsController } from '../controllers/stats.controller';

const router = Router();

router.use(authenticate);

// 3.1 PRs & Strength
router.get('/prs', statsController.getPRs);
router.get('/strength', statsController.getStrengthMetrics);

// 3.2 Volume & Consistency
router.get('/volume', statsController.getVolumeStats);
router.get('/consistency', statsController.getConsistencyStats);

// 3.4 Muscle Distribution (3D Heatmap)
router.get('/muscle-distribution', statsController.getMuscleHeatmap);

// 3.5 Recovery
router.get('/recovery', statsController.getRecoveryStatus);

// 3.3 Body Composition
router.get('/body', statsController.getBodyStats);

// 3.6 Dashboard
router.get('/dashboard', statsController.getDashboardStats);

// 3.1 Strength & Frequency
router.get('/strength-progression/:exerciseId', statsController.getStrengthProgression);
router.get('/workout-frequency', statsController.getWorkoutFrequency);

export const statsRouter = router;
