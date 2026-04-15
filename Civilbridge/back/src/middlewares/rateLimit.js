// Already have rateLimit.js middleware - apply to auth routes
import { rateLimit } from './middlewares/rateLimit.js';
router.post('/login', rateLimit, login);
router.post('/register', rateLimit, register);