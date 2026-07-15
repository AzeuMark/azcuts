import { Router } from 'express';
import { success } from '../utils/response.js';
import authRoutes from './auth.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  success(res, { status: 'ok', uptime: process.uptime() }, 'AzCuts API is running');
});

router.use('/auth', authRoutes);

export default router;
