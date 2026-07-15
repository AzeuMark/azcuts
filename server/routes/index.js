import { Router } from 'express';
import { success } from '../utils/response.js';

const router = Router();

router.get('/health', (req, res) => {
  success(res, { status: 'ok', uptime: process.uptime() }, 'AzCuts API is running');
});

export default router;
