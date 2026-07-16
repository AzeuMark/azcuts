import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { verifyAccessToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(verifyAccessToken, requireRole('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// User CRUD
router.get('/users', adminController.listUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Discount
router.patch('/appointments/:id/discount', adminController.setDiscount);

// Histories
router.get('/history/staff', adminController.getStaffHistory);
router.get('/history/users', adminController.getUserHistory);

export default router;
