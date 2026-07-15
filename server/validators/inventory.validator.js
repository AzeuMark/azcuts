import { body } from 'express-validator';

export const serviceCreateRules = [
  body('name').trim().notEmpty().withMessage('Service name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('durationMinutes').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('category').optional().isIn(['haircut', 'salon']).withMessage('Category must be haircut or salon'),
];

export const serviceUpdateRules = [
  body('name').optional().trim().notEmpty().withMessage('Service name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('durationMinutes').optional().isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('category').optional().isIn(['haircut', 'salon']).withMessage('Category must be haircut or salon'),
];

export const extraCreateRules = [
  body('name').trim().notEmpty().withMessage('Extra name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];

export const extraUpdateRules = [
  body('name').optional().trim().notEmpty().withMessage('Extra name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];
