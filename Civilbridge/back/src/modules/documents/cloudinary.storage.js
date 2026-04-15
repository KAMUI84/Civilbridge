import crypto from "crypto";

function getCloudinaryConfig() {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_PDF_FOLDER || "civilbridge/pdfs",
  };
}

export function isCloudinaryConfigured() {
  const config = getCloudinaryConfig();
  return Boolean(config.cloudName && config.apiKey && config.apiSecret);
}

function buildSignature(params, apiSecret) {
  const serialized = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(`${serialized}${apiSecret}`)
    .digest("hex");
}

export async function uploadPdfToCloudinary({ buffer, filename, publicId }) {
  const config = getCloudinaryConfig();

  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary PDF storage is not configured.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    folder: config.folder,
    overwrite: true,
    public_id: publicId,
    timestamp,
  };
  const signature = buildSignature(params, config.apiSecret);
  const payload = new URLSearchParams({
    ...Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)])
    ),
    api_key: config.apiKey,
    signature,
    file: `data:application/pdf;base64,${buffer.toString("base64")}`,
    filename_override: filename,
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/raw/upload`,
    {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: payload.toString(),
    }
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json?.error?.message || "Cloudinary upload failed.");
  }

  return {
    publicId: json.public_id,
    secureUrl: json.secure_url,
    version: json.version,
    bytes: json.bytes,
    format: json.format || "pdf",
  };
}

export function buildSignedCloudinaryUrl({ publicId, filename = "document.pdf" }) {
  const config = getCloudinaryConfig();

  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary PDF storage is not configured.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    attachment: filename,
    format: "pdf",
    public_id: publicId,
    timestamp,
    type: "upload",
  };
  const signature = buildSignature(params, config.apiSecret);
  const query = new URLSearchParams({
    ...Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)])
    ),
    api_key: config.apiKey,
    signature,
  });

  return `https://api.cloudinary.com/v1_1/${config.cloudName}/raw/download?${query.toString()}`;
}
