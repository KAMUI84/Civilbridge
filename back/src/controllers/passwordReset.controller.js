import crypto from 'crypto';
import { pool } from '../config/db.js';
import { emailService } from '../services/email.service.js';
import { hashPassword } from '../utils/password.js';

function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const [users] = await pool.query('SELECT id, full_name FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      // Don't reveal if email exists or not for security
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    const user = users[0];
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete any existing reset tokens for this user
    await pool.query('DELETE FROM password_resets WHERE user_id = ?', [user.id]);

    // Store new reset token
    await pool.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, resetToken, expiresAt]
    );

    try {
      // Send reset email
      await emailService.sendPasswordResetEmail(email, resetToken, user.full_name);
      
      res.json({
        message: 'Password reset link sent to your email',
        expires_in_sec: 900 // 15 minutes
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ 
          error: 'Email service unavailable. Please try again later.' 
        });
      }
      
      // Development mode
      res.json({
        message: 'Password reset link sent (development mode)',
        token: resetToken, // Remove in production
        expires_in_sec: 900
      });
    }

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Find valid reset token
    const [resetRecords] = await pool.query(
      'SELECT user_id, expires_at FROM password_resets WHERE token = ? AND used = FALSE',
      [token]
    );

    if (resetRecords.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const resetRecord = resetRecords[0];

    // Check if token has expired
    if (new Date(resetRecord.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password
    await pool.query(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [passwordHash, resetRecord.user_id]
    );

    // Mark reset token as used
    await pool.query(
      'UPDATE password_resets SET used = TRUE, used_at = NOW() WHERE id = ?',
      [resetRecord.id]
    );

    res.json({
      message: 'Password reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
}

export async function validateResetToken(req, res) {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const [resetRecords] = await pool.query(
      'SELECT expires_at FROM password_resets WHERE token = ? AND used = FALSE',
      [token]
    );

    if (resetRecords.length === 0) {
      return res.status(400).json({ error: 'Invalid or used reset token' });
    }

    const resetRecord = resetRecords[0];

    // Check if token has expired
    if (new Date(resetRecord.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    res.json({
      valid: true,
      expires_at: resetRecord.expires_at
    });

  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ error: 'Failed to validate reset token' });
  }
}
