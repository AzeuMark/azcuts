import { body } from 'express-validator';

export const createBookingRules = [
  body('serviceId').notEmpty().withMessage('Service is required'),
  body('scheduledStart').isISO8601().withMessage('Valid scheduled start time is required'),
  body('paymentMethod').optional().isIn(['cash', 'gcash']).withMessage('Invalid payment method'),
];

export const cancelRules = [
  body('cancelReason').trim().notEmpty().withMessage('Cancel reason is required'),
];

export const rateRules = [
  body('stars').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5 stars'),
  body('comment').optional().trim(),
];
