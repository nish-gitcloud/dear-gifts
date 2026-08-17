"use client";

/**
 * Downscales an oversized image client-side (long edge capped at 1920px,
 * re-encoded as JPEG) before it's ever POSTed anywhere.
 *
 * Two independent size limits make this necessary, not just one: our own
 * `MEDIA_LIMITS_BYTES.image` (10MB, see lib/media.ts) is a UI-facing cap on
 * what the app allows at all, but Vercel's Serverless Functions enforce a
 * hard ~4.5MB request body limit completely independent of anything in this
 * codebase — a photo comfortably under our own 10MB limit can still be
 * silently rejected at the platform level before app/api/uploads/route.ts
 * ever runs. That's exactly what "upload just shows Failed, no real error"
 * looks like once deployed, even though the same upload works fine in local
 * dev (no such platform limit there). Compressing well below BOTH ceilings
 * avoids hitting either one.
 */
const COMPRESS_ABOVE_BYTES = 3.5 * 1024 * 1024;

export async function compressImageIfOversized(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.size <= COMPRESS_ABOVE_BYTES) {
    return file;
  }
  try {
    const bitmap = await createImageBitmap(file);
    const maxDim = 1920;
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    if (!blob) return file;
    const compressedName = file.name.replace(/\.\w+$/, "") + ".jpg";
    return new File([blob], compressedName, { type: "image/jpeg" });
  } catch {
    // Any failure here (unsupported format, canvas issue, ...) just falls
    // through to the original file — server-side validation still catches
    // an oversized result and reports it clearly rather than failing
    // silently.
    return file;
  }
}
