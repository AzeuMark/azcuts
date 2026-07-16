import { Router } from 'express';
import * as appointmentController from '../controllers/appointment.controller.js';
import * as staffController from '../controllers/staff.controller.js';
import { createBookingRules, cancelRules, rateRules } from '../validators/appointment.validator.js';
import validate from '../middleware/validate.js';
import { verifyAccessToken, requireRole } from '../middleware/auth.js';
import systemMode from '../middleware/systemMode.js';

const router = Router();

// All routes require auth + system mode check
router.use(verifyAccessToken, systemMode);

// Slots (user)
router.get('/slots', requireRole('user'), appointmentController.getSlots);

// Create booking (user)
router.post('/', requireRole('user'), ...createBookingRules, validate, appointmentController.createBooking);

// My appointments (user)
router.get('/mine', requireRole('user'), appointmentController.listMine);

// Status change (staff/admin)
router.patch('/:id/status', requireRole('staff', 'admin'), staffController.changeStatus);

// Single appointment (owner/staff/admin)
router.get('/:id', appointmentController.getOne);

// Cancel
router.patch('/:id/cancel', ...cancelRules, validate, appointmentController.cancel);

// Rate (user, after done)
router.post('/:id/rate', requireRole('user'), ...rateRules, validate, appointmentController.rate);

// Receipt
router.get('/:id/receipt', appointmentController.receipt);

export default router;
