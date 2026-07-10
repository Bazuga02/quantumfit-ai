import crypto from "crypto";

export function getCloudinaryConfig() {
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();

  if (!apiSecret || !apiKey || !cloudName) {
    return null;
  }

  return { apiSecret, apiKey, cloudName };
}

export function createCloudinaryUploadSignature(timestamp: number) {
  const config = getCloudinaryConfig();
  if (!config) {
    throw new Error("Cloudinary is not configured");
  }

  const paramsToSign = `folder=progress-photos&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + config.apiSecret)
    .digest("hex");

  return {
    signature,
    timestamp,
    api_key: config.apiKey,
    cloud_name: config.cloudName,
    folder: "progress-photos",
  };
}

export function isAllowedProgressPhotoUrl(url: string): boolean {
  const cloudName = getCloudinaryConfig()?.cloudName;
  if (!cloudName) return false;

  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "res.cloudinary.com" &&
      parsed.pathname.startsWith(`/${cloudName}/image/upload/`)
    );
  } catch {
    return false;
  }
}
