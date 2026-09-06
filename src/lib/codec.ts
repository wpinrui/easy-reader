import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

/** Longest shareable URL we will produce. Beyond this, browsers and chat apps
    start truncating, so we refuse to build the link instead of handing out a
    broken one. */
export const MAX_URL_LENGTH = 8000;

/** A QR code stops being reliably scannable from a phone well before the byte
    mode limit (2953), so we cap the payload lower. */
export const MAX_QR_URL_LENGTH = 1200;

export function encodeText(text: string): string {
  return compressToEncodedURIComponent(text);
}

export function decodeText(payload: string): string | null {
  try {
    return decompressFromEncodedURIComponent(payload) || null;
  } catch {
    return null;
  }
}

/** The share target. We keep the payload in the hash so GitHub Pages can serve
    a single index.html for every text, and so the text never reaches a server. */
export function shareUrl(text: string): string {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#${encodeText(text)}`;
}

export function readHashText(): string | null {
  const payload = window.location.hash.replace(/^#/, "");
  return payload ? decodeText(payload) : null;
}
