import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { registerRules, loginRules, refreshRules } from '../validators/auth.validator.js';
import validate from '../middleware/validate.js';
import { verifyAccessToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', ...registerRules, validate, authController.register);
router.post('/login', ...loginRules, validate, authController.login);
router.post('/refresh', ...refreshRules, validate, authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', verifyAccessToken, authController.me);

export default router;
