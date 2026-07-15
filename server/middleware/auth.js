import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

export function verifyAccessToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Access token required'));
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return next(new ApiError(401, 'Invalid or expired access token'));
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }
    next();
  };
}
