import crypto from 'crypto';

// Generate CSRF token
export function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Verify CSRF token
export function verifyCSRFToken(req, res, next) {
  const headerToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies?.csrf;

  // Stateless double-submit cookie pattern:
  // - Server sets a non-httpOnly `csrf` cookie
  // - Client sends the same token via `X-CSRF-Token` header on mutations
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  return next();
}

// Set httpOnly access-token cookie (short-lived, matches JWT_EXPIRES_IN)
export function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes — matches default ACCESS_EXPIRES_IN
    path: '/',
  });
}

// Clear access-token cookie
export function clearAuthCookie(res) {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/',
  });
}

// ── Refresh token cookie ──────────────────────────────────────────────────────

/** Set the httpOnly refresh token cookie (30-day, restricted to /api/auth). */
export function setRefreshCookie(res, refreshToken) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/api/auth',  // Browser only sends this cookie to /api/auth/* routes
  });
}

/** Clear the refresh token cookie. */
export function clearRefreshCookie(res) {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/api/auth',
  });
}
