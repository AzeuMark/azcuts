import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller.js';
import { serviceCreateRules, serviceUpdateRules, extraCreateRules, extraUpdateRules } from '../validators/inventory.validator.js';
import validate from '../middleware/validate.js';
import { verifyAccessToken, requireRole } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

// Public GET for landing/booking
router.get('/services', inventoryController.getServices);
router.get('/services/:id', inventoryController.getService);
router.get('/services/:id/image', inventoryController.getServiceImage);
router.get('/extras', inventoryController.getExtras);
router.get('/extras/:id', inventoryController.getExtra);

// Admin CRUD — Services
router.post('/services', verifyAccessToken, requireRole('admin'), upload.single('image'), ...serviceCreateRules, validate, inventoryController.createService);
router.put('/services/:id', verifyAccessToken, requireRole('admin'), upload.single('image'), ...serviceUpdateRules, validate, inventoryController.updateService);
router.delete('/services/:id', verifyAccessToken, requireRole('admin'), inventoryController.deleteService);

// Admin CRUD — Extras
router.post('/extras', verifyAccessToken, requireRole('admin'), ...extraCreateRules, validate, inventoryController.createExtra);
router.put('/extras/:id', verifyAccessToken, requireRole('admin'), ...extraUpdateRules, validate, inventoryController.updateExtra);
router.delete('/extras/:id', verifyAccessToken, requireRole('admin'), inventoryController.deleteExtra);

export default router;
