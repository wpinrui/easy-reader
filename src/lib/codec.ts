import { decompressFromEncodedURIComponent } from "lz-string";

/** Older links carried the whole text compressed in the hash. Texts now live in
    Firestore behind a short id, but those links still open. */
export function readLegacyHashText(): string | null {
  const payload = window.location.hash.replace(/^#/, "");
  if (!payload) return null;
  try {
    return decompressFromEncodedURIComponent(payload) || null;
  } catch {
    return null;
  }
}
