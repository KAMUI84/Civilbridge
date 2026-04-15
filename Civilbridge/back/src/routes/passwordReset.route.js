import { Router } from 'express';
import { 
  requestPasswordReset, 
  resetPassword, 
  validateResetToken 
} from '../controllers/passwordReset.controller.js';

const router = Router();

// Request password reset
router.post('/request', requestPasswordReset);

// Reset password with token
router.post('/reset', resetPassword);

// Validate reset token
router.get('/validate/:token', validateResetToken);

export default router;
