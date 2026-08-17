import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary, validateUpload } from "@/services/cloudinary";
import { kindFromMime } from "@/lib/media";

/**
 * Real media upload endpoint (spec sections 20 & 54) — the creator wizard's
 * MediaUploadField posts each file here as it's added, rather than only
 * holding a local object URL. Falls back to a deterministic mock CDN URL
 * when Cloudinary isn't configured (see services/cloudinary.ts's adapter),
 * but always goes through this same real request/response path — nothing
 * about "was this file uploaded" is faked client-side.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 422 });
  }

  const kind = kindFromMime(file.type);
  if (!kind) {
    return NextResponse.json({ error: `Unsupported file type "${file.type}".` }, { status: 422 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const check = validateUpload(kind, file.type, buffer.byteLength);
  if (!check.valid) {
    return NextResponse.json({ error: check.errors.join(" ") }, { status: 422 });
  }

  const resourceType = kind === "audio" ? "video" : kind; // Cloudinary treats audio as a "video" resource type.
  try {
    const result = await uploadToCloudinary(buffer, {
      fileName: file.name,
      folder: "dear-gifts/gift-media",
      resourceType,
    });
    return NextResponse.json({ ...result, kind });
  } catch (err) {
    // Swallowing this without logging meant every failed upload — wrong
    // Cloudinary credentials, a request-size rejection, anything — looked
    // identical from the outside: a generic "Upload failed" with nothing in
    // Vercel's Logs to diagnose it from. Logging the real error server-side
    // costs nothing and is the difference between guessing and knowing next
    // time something like this happens.
    console.error("Cloudinary upload failed:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
