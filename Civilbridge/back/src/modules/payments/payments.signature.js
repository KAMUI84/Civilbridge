import crypto from "crypto";

export function verifyHmacSignature({
  payload,
  signature,
  secret,
  algorithm = "sha256",
  encoding = "hex",
}) {
  if (!payload || !signature || !secret) return false;

  const expected = crypto
    .createHmac(algorithm, secret)
    .update(payload)
    .digest(encoding);

  const normalizedActual = String(signature).trim();
  const normalizedExpected = String(expected).trim();

  try {
    return crypto.timingSafeEqual(
      Buffer.from(normalizedActual),
      Buffer.from(normalizedExpected),
    );
  } catch {
    return false;
  }
}

export function verifyStripeSignature({ rawBody, signatureHeader, secret, toleranceSeconds = 300 }) {
  if (!rawBody || !signatureHeader || !secret) return false;

  const parts = Object.fromEntries(
    String(signatureHeader)
      .split(",")
      .map((segment) => segment.trim().split("="))
      .filter(([key, value]) => key && value),
  );

  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > toleranceSeconds) return false;

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}
