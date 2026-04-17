/**
 * HTTPS redirect middleware (application-level).
 * Only active in production. Handles both direct HTTPS and reverse-proxy
 * scenarios where the proxy sets X-Forwarded-Proto.
 */
export function httpsRedirect(req, res, next) {
  if (process.env.NODE_ENV !== "production") return next();

  const proto = req.headers["x-forwarded-proto"] ?? "";
  const isHttps = req.secure || proto.split(",")[0].trim() === "https";

  if (!isHttps) {
    const host = req.headers.host ?? "";
    return res.redirect(301, `https://${host}${req.url}`);
  }

  // Enforce HSTS (belt-and-suspenders; Helmet sets this too)
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  next();
}
