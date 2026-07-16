import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { verifyAccessToken } from '../middleware/auth.js';
import systemMode from '../middleware/systemMode.js';

const router = Router();

router.use(verifyAccessToken, systemMode);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.changePassword);

export default router;
