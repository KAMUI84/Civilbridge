import crypto from 'crypto';

// Generate CSRF token
export function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Verify CSRF token
export function verifyCSRFToken(req, res, next) {
  const token = req.headers['x-csrf-token'];
  const sessionToken = req.session?.csrfToken;
  if (!token || token !== sessionToken) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }
  next();
}

// Set httpOnly cookie with token
export function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

// Clear auth cookie
export function clearAuthCookie(res) {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/',
  });
}
