import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { bodyController } from '../controllers/body.controller';

const router = Router();

router.use(authenticate);

// 3.3 Body Composition Endpoints
router.post('/weight', bodyController.logWeight);
router.get('/weight-history', bodyController.getWeightHistory);

router.post('/measurements', bodyController.logMeasurements);
router.get('/measurements-history', bodyController.getMeasurementHistory);

router.post('/photos', bodyController.logProgressPhoto);
router.get('/photos', bodyController.getPhotos);

export const bodyRouter = router;
