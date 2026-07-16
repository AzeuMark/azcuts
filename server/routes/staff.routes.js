import { Router } from 'express';
import * as staffController from '../controllers/staff.controller.js';
import { verifyAccessToken, requireRole } from '../middleware/auth.js';
import systemMode from '../middleware/systemMode.js';

const router = Router();

router.use(verifyAccessToken, systemMode, requireRole('staff'));

router.get('/appointments', staffController.getAppointments);
router.patch('/appointments/:id/accept', staffController.accept);
router.patch('/appointments/:id/reject', staffController.reject);
router.get('/history', staffController.getHistory);
router.patch('/shift', staffController.setShift);

export default router;
