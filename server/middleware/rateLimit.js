import rateLimit from 'express-rate-limit';
import env from '../config/env.js';

const isProduction = env.nodeEnv === 'production';

export const authLimiter = isProduction
  ? rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,
      message: { success: false, message: 'Too many attempts. Please try again later.' },
      standardHeaders: true,
      legacyHeaders: false,
    })
  : (req, res, next) => next();

export const generalLimiter = isProduction
  ? rateLimit({
      windowMs: 1 * 60 * 1000,
      max: 100,
      message: { success: false, message: 'Too many requests. Please slow down.' },
      standardHeaders: true,
      legacyHeaders: false,
    })
  : (req, res, next) => next();
