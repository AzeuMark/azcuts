import { Router } from 'express';
import { success } from '../utils/response.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import staffRoutes from './staff.routes.js';
import adminRoutes from './admin.routes.js';
import analyticsRoutes from './analytics.routes.js';
import inventoryRoutes from './inventory.routes.js';
import settingsRoutes from './settings.routes.js';
import appointmentRoutes from './appointment.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  success(res, { status: 'ok', uptime: process.uptime() }, 'AzCuts API is running');
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/staff', staffRoutes);
router.use('/admin', adminRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/', inventoryRoutes);
router.use('/settings', settingsRoutes);
router.use('/appointments', appointmentRoutes);

export default router;
