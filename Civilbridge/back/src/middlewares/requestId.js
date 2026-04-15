/**
 * X-Request-ID middleware
 * - Reads the incoming X-Request-ID header (set by load-balancer / proxy) if present.
 * - Otherwise generates a UUID.
 * - Attaches req.requestId and echoes it back in the X-Request-ID response header
 *   so clients and log aggregators can correlate requests end-to-end.
 */
import { v4 as uuidv4 } from "uuid";

export function requestId(req, res, next) {
  const id = (req.headers["x-request-id"] ?? "").toString().slice(0, 64) || uuidv4();
  req.requestId = id;
  res.setHeader("X-Request-ID", id);
  next();
}
