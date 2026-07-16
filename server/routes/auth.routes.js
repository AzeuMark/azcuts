import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { registerRules, loginRules, refreshRules } from '../validators/auth.validator.js';
import validate from '../middleware/validate.js';
import { verifyAccessToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/register', authLimiter, ...registerRules, validate, authController.register);
router.post('/login', authLimiter, ...loginRules, validate, authController.login);
router.post('/refresh', authLimiter, ...refreshRules, validate, authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', verifyAccessToken, authController.me);

export default router;
