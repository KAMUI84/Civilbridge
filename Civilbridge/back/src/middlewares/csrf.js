import { verifyCSRFToken } from '../utils/cookie.js';

// Only apply CSRF to state-changing methods
export const csrfGuard = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  verifyCSRFToken(req, res, next);
};
