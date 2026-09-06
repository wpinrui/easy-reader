import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { currentUid, db } from "./firebase";

/** What one paste may hold, matching the ceiling in firestore.rules. Firestore
    caps a document at 1 MiB, which this stays under for any ordinary prose. */
export const MAX_PASTE_LENGTH = 200_000;

const ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ID_LENGTH = 8;

/** Paths the app owns, so they are never mistaken for a text id. */
const RESERVED = new Set(["library"]);

export interface SharedText {
  id: string;
  title: string;
  wordCount: number;
  createdAt: Date | null;
  lastAccessedAt: Date | null;
}

/** A short, unambiguous id. 8 characters of this alphabet is ~1.7e14 values,
    which keeps the URL and therefore the QR code small. */
function newId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(ID_LENGTH));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/** The first non-empty line, which is what the reader will recognise it by. */
function titleOf(text: string): string {
  const line = text
    .split("\n")
    .map((l) => l.replace(/^#{1,6}\s*/, "").trim())
    .find((l) => l.length > 0);
  return (line ?? "Untitled").slice(0, 90);
}

function toDate(value: unknown): Date | null {
  return value ? (value as Timestamp).toDate() : null;
}

/** Raised when an action needs an account and there is not one. */
export class NeedsAccount extends Error {}

function requireUid(): string {
  const uid = currentUid();
  if (!uid) throw new NeedsAccount("Sign in to do that.");
  return uid;
}

/** Stores the text and returns its id. */
export async function publishText(text: string): Promise<string> {
  const owner = requireUid();
  const id = newId();
  await setDoc(doc(db, "texts", id), {
    text,
    owner,
    title: titleOf(text),
    wordCount: countWords(text),
    createdAt: serverTimestamp(),
    lastAccessedAt: serverTimestamp(),
  });
  return id;
}

export async function fetchText(id: string): Promise<string | null> {
  const snapshot = await getDoc(doc(db, "texts", id));
  const text = snapshot.data()?.text;
  if (typeof text !== "string") return null;
  touch(id);
  return text;
}

/** Records the read. Anyone holding the link may do this, signed in or not, and
    may change nothing else, so a failure here never stops the text opening. */
function touch(id: string): void {
  updateDoc(doc(db, "texts", id), {
    lastAccessedAt: serverTimestamp(),
  }).catch(() => {});
}

/** The owner's texts, least recently opened first: the ones to clear out. */
export async function listMine(): Promise<SharedText[]> {
  const owner = requireUid();
  const snapshot = await getDocs(
    query(
      collection(db, "texts"),
      where("owner", "==", owner),
      orderBy("lastAccessedAt", "asc"),
    ),
  );
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: typeof data.title === "string" ? data.title : "Untitled",
      wordCount: typeof data.wordCount === "number" ? data.wordCount : 0,
      createdAt: toDate(data.createdAt),
      lastAccessedAt: toDate(data.lastAccessedAt),
    };
  });
}

export async function deleteText(id: string): Promise<void> {
  requireUid();
  await deleteDoc(doc(db, "texts", id));
}

export function idFromUrl(): string | null {
  const segment = window.location.pathname.split("/").filter(Boolean).pop();
  if (!segment || RESERVED.has(segment)) return null;
  return /^[a-zA-Z0-9]{4,32}$/.test(segment) ? segment : null;
}

export function isLibraryUrl(): boolean {
  return window.location.pathname.replace(/\/+$/, "").endsWith("/library");
}

export function urlForId(id: string): string {
  return `${window.location.origin}/${id}`;
}
