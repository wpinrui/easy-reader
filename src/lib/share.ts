import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";

/** Firestore caps a document at 1 MiB; the rules cap the text well below that
    so one paste cannot fill a document. */
export const MAX_TEXT_LENGTH = 200_000;

const ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ID_LENGTH = 8;

/** A short, unambiguous id. 8 characters of this alphabet is ~1.7e14 values,
    which keeps the URL and therefore the QR code small. */
function newId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(ID_LENGTH));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/** Stores the text and returns its id. */
export async function publishText(text: string): Promise<string> {
  const id = newId();
  await setDoc(doc(db, "texts", id), { text, createdAt: serverTimestamp() });
  return id;
}

export async function fetchText(id: string): Promise<string | null> {
  const snapshot = await getDoc(doc(db, "texts", id));
  const text = snapshot.data()?.text;
  return typeof text === "string" ? text : null;
}

export function idFromUrl(): string | null {
  const segment = window.location.pathname.split("/").filter(Boolean).pop();
  return segment && /^[a-zA-Z0-9]{4,32}$/.test(segment) ? segment : null;
}

export function urlForId(id: string): string {
  return `${window.location.origin}/${id}`;
}
