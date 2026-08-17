import "server-only";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { env } from "@/lib/env";
import { MEDIA_LIMITS_BYTES, type MediaKind } from "@/lib/media";

const LOCAL_UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

export interface UploadResult {
  publicId: string;
  url: string;
  bytes: number;
  format: string;
  resourceType: "image" | "video" | "raw";
}

const ALLOWED_MIME: Record<MediaKind, string[]> = {
  image: ["image/jpeg", "image/png", "image/webp", "image/heic"],
  video: ["video/mp4", "video/quicktime", "video/webm"],
  audio: ["audio/mpeg", "audio/mp4", "audio/wav", "audio/webm", "audio/ogg"],
};

export function validateUpload(kind: MediaKind, mimeType: string, sizeBytes: number) {
  const errors: string[] = [];
  if (!ALLOWED_MIME[kind].includes(mimeType)) {
    errors.push(`Unsupported file type "${mimeType}" for ${kind}.`);
  }
  if (sizeBytes > MEDIA_LIMITS_BYTES[kind]) {
    errors.push(`File exceeds the ${MEDIA_LIMITS_BYTES[kind] / (1024 * 1024)}MB limit for ${kind}.`);
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Uploads a buffer to Cloudinary. Without real credentials configured, this
 * used to return a deterministic but non-fetchable `mock-cdn.dear-gifts.local`
 * URL — the upload UI/flow worked end-to-end, but the resulting "photo"
 * could never actually load anywhere it was used (creator preview,
 * memories, puzzle, scratch card), which is exactly the recurring "images
 * aren't showing" report. Writing the file to `public/uploads` instead and
 * returning a real same-origin path costs nothing to set up and actually
 * renders everywhere this app runs on a normal Node server — it only stores
 * a short URL (not the file itself) in the gift's data, so it doesn't bloat
 * localStorage or the database the way inlining base64 would. The moment
 * real Cloudinary credentials ARE configured, this whole branch is skipped
 * in favor of the real CDN below, so nothing here needs to change later.
 * (Note: on a serverless/ephemeral filesystem host, written files won't
 * persist across deploys — that's the one case real Cloudinary credentials
 * remain necessary rather than optional.)
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  opts: { fileName: string; folder: string; resourceType: "image" | "video" | "raw" }
): Promise<UploadResult> {
  if (!env.cloudinary.isConfigured) {
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${opts.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const dir = path.join(LOCAL_UPLOAD_ROOT, opts.folder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, safeName), buffer);
    return {
      publicId: `local/${opts.folder}/${safeName}`,
      url: `/uploads/${opts.folder}/${safeName}`,
      bytes: buffer.byteLength,
      format: safeName.split(".").pop() ?? "bin",
      resourceType: opts.resourceType,
    };
  }

  const { v2: cloudinary } = await import("cloudinary");
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });

  const result = await new Promise<{ public_id: string; secure_url: string; bytes: number; format: string }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: opts.folder, resource_type: opts.resourceType },
        (err, res) => (err || !res ? reject(err ?? new Error("Cloudinary returned no result.")) : resolve(res))
      );
      stream.end(buffer);
    }
  );

  return {
    publicId: result.public_id,
    url: result.secure_url,
    bytes: result.bytes,
    format: result.format,
    resourceType: opts.resourceType,
  };
}

/** Deletes an uploaded asset (spec section 6: removing a photo/video from an existing gift should also remove it from storage, not just the gift's section data). Removes the local file in the no-credentials fallback; no-ops if it's already gone. */
export async function deleteFromCloudinary(publicId: string, resourceType: "image" | "video" | "raw"): Promise<void> {
  if (!env.cloudinary.isConfigured) {
    if (publicId.startsWith("local/")) {
      await unlink(path.join(LOCAL_UPLOAD_ROOT, publicId.slice("local/".length))).catch(() => {});
    }
    return;
  }
  const { v2: cloudinary } = await import("cloudinary");
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
