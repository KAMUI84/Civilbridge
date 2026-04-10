import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

const SECRET = process.env.JWT_SECRET;

// Access tokens are short-lived. Set JWT_EXPIRES_IN=15m in production.
// Refresh tokens (opaque, 30-day) are used to silently rotate the pair.
const ACCESS_EXPIRES_IN  = process.env.JWT_EXPIRES_IN         || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, jti: uuidv4() },
    SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};

// ── Refresh token helpers ─────────────────────────────────────────────────────

/** Cryptographically random opaque token (80 hex chars). Never stored in plain text. */
export const generateRefreshToken = () =>
  crypto.randomBytes(40).toString("hex");

/** SHA-256 hash of any token for safe DB storage. */
export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

/** Expiry Date for a new refresh token (30 days from now). */
export const refreshTokenExpiresAt = () =>
  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

// ── Google OAuth nonce helpers ────────────────────────────────────────────────

/**
 * Generate a stateless signed nonce for Google OAuth CSRF protection.
 *   - `nonce`  → passed to the Google Sign-In component so Google embeds it
 *                in the ID token's `nonce` claim.
 *   - `state`  → a short-lived signed JWT returned to the server on the
 *                callback; we verify it and compare its embedded nonce against
 *                the ID token's nonce claim, closing the replay/CSRF vector.
 */
export const generateSignedNonce = () => {
  const nonce = crypto.randomBytes(16).toString("hex");
  const state = jwt.sign({ nonce }, SECRET, { expiresIn: "10m" });
  return { nonce, state };
};

/** Verify the signed state and return the embedded nonce. Throws on tamper/expiry. */
export const verifySignedNonce = (state) => {
  const payload = jwt.verify(state, SECRET);
  if (typeof payload.nonce !== "string") throw new Error("Invalid nonce payload");
  return payload.nonce;
};