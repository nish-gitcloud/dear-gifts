/**
 * Client-safe media validation constants (spec section 20/54). Shared by the
 * creator upload UI (pre-flight checks before hitting the network) and the
 * server upload route (source of truth — never trust client validation
 * alone).
 */
export const MEDIA_LIMITS_BYTES = {
  image: 10 * 1024 * 1024,
  video: 50 * 1024 * 1024,
  audio: 20 * 1024 * 1024,
};

export const MAX_MEDIA_FILES = 12;

export type MediaKind = keyof typeof MEDIA_LIMITS_BYTES;

export function kindFromMime(mimeType: string): MediaKind | null {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  const kind = kindFromMime(file.type);
  if (!kind) return { valid: false, error: "Unsupported file type." };
  if (file.size > MEDIA_LIMITS_BYTES[kind]) {
    return {
      valid: false,
      error: `${kind} files must be under ${formatBytes(MEDIA_LIMITS_BYTES[kind])}.`,
    };
  }
  return { valid: true };
}
