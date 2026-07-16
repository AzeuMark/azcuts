import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { verifyAccessToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(verifyAccessToken, requireRole('admin'));

router.get('/summary', analyticsController.getSummary);
router.get('/sales', analyticsController.getSales);
router.get('/report', analyticsController.getReport);

export default router;
