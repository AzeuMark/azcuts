import Settings from '../models/Settings.js';
import ApiError from '../utils/ApiError.js';

const MODE_MESSAGES = {
  maintenance: 'System is under maintenance. Only admin and staff can access.',
  offline: 'System is currently offline. Only admin can access.',
};

export default function systemMode(req, res, next) {
  // Skip for public routes and admin
  if (!req.user || req.user.role === 'admin') return next();

  Settings.findById('system')
    .then((settings) => {
      const mode = settings?.systemMode || 'online';
      if (mode === 'online') return next();

      if (mode === 'maintenance' && (req.user.role === 'staff' || req.user.role === 'admin')) {
        return next();
      }

      if (mode === 'offline' && req.user.role === 'admin') {
        return next();
      }

      return next(new ApiError(503, MODE_MESSAGES[mode] || 'System unavailable'));
    })
    .catch(next);
}
