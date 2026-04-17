import fetch from "node-fetch";
import logger from "../../config/logger.js";

const UPI_REQUEST_TIMEOUT_MS = 10000; // 10 seconds

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function readNested(source, paths = []) {
  for (const path of paths) {
    const value = path.split(".").reduce((current, key) => current?.[key], source);
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return null;
}

function normalizeUpiPayload(payload, upi) {
  const data = payload?.data || payload?.result || payload || {};
  const verifiedValue = readNested(data, [
    "verified",
    "isVerified",
    "verification.verified",
    "status.verified",
  ]);
  const statusValue = String(readNested(data, ["status", "verification.status"]) || "").toUpperCase();

  return {
    verified:
      typeof verifiedValue === "boolean"
        ? verifiedValue
        : ["VERIFIED", "SUCCESS", "VALID"].includes(statusValue),
    upi,
    ownerName: readNested(data, ["owner", "ownerName", "ownership.ownerName", "plot.owner"]),
    plotSizeSqm: readNested(data, ["plotSizeSqm", "plot_size_sqm", "sizeSqm", "size", "plot.sizeSqm"]),
    zoning: readNested(data, ["zoning", "zone", "planning.zoning"]),
    landUse: readNested(data, ["landUse", "land_use", "use", "planning.landUse"]),
    district: readNested(data, ["district", "location.district"]),
    province: readNested(data, ["province", "location.province"]),
    source: payload?.source || "official-registry",
    checkedAt: new Date().toISOString(),
  };
}

export async function lookupUpi(req, res) {
  try {
    const upi = normalizeText(req.query?.upi);
    if (!upi) {
      return res.status(400).json({ message: "upi is required" });
    }

    const baseUrl = normalizeText(process.env.RWANDA_LAND_API_URL || process.env.UPI_LOOKUP_URL);
    if (!baseUrl) {
      return res.status(503).json({
        message: "UPI verification is not configured yet.",
        verified: false,
      });
    }

    const authHeader = normalizeText(process.env.RWANDA_LAND_API_AUTH_HEADER) || "x-api-key";
    const apiKey = normalizeText(process.env.RWANDA_LAND_API_KEY || process.env.UPI_LOOKUP_API_KEY);
    const bearerToken = normalizeText(process.env.RWANDA_LAND_API_BEARER || process.env.UPI_LOOKUP_BEARER);
    const url = new URL(baseUrl);
    url.searchParams.set("upi", upi);

    const headers = {
      Accept: "application/json",
    };

    if (apiKey) {
      headers[authHeader] = apiKey;
    }

    if (bearerToken) {
      headers.Authorization = `Bearer ${bearerToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPI_REQUEST_TIMEOUT_MS);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json({
        message:
          payload?.message ||
          payload?.error?.message ||
          "UPI lookup failed at the registry provider.",
        verified: false,
      });
    }

    return res.json(normalizeUpiPayload(payload, upi));
  } catch (error) {
    if (error.name === "AbortError") {
      logger.error("UPI lookup timeout", { upi: req.query?.upi });
      return res.status(504).json({
        message: "UPI verification timed out. Please try again.",
        verified: false,
      });
    }
    logger.error("UPI lookup error", { error: error.message, upi: req.query?.upi });
    return res.status(500).json({
      message: "Failed to verify the UPI right now.",
      verified: false,
    });
  }
}
