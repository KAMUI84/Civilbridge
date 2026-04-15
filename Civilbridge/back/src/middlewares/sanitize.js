/**
 * Input sanitization middleware.
 * Strips HTML/script tags from all string values in req.body before they
 * reach controllers.  Uses the `xss` package (Node-compatible equivalent
 * of DOMPurify) so stored free-text can never execute as HTML.
 *
 * Only sanitizes req.body strings. Path params and query strings are
 * short identifiers and are validated by their respective controllers.
 */
import xss from "xss";

/** Recursively sanitize all string leaves in an object or array. */
function sanitizeDeep(value) {
  if (typeof value === "string") return xss(value);
  if (Array.isArray(value))     return value.map(sanitizeDeep);
  if (value !== null && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = sanitizeDeep(v);
    }
    return out;
  }
  return value; // number, boolean, null, undefined — untouched
}

export function sanitizeBody(req, _res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeDeep(req.body);
  }
  next();
}
