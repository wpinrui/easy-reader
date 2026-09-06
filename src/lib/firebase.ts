import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/* A Firebase web config identifies the project; it is not a secret and is meant
   to ship in the client. Access is controlled by firestore.rules. */
const config = {
  apiKey: "AIzaSyCC5seAxeeYmUXAbhcaoLThkcOXVKBwgEI",
  authDomain: "easy-reader-ivan.firebaseapp.com",
  projectId: "easy-reader-ivan",
  storageBucket: "easy-reader-ivan.firebasestorage.app",
  messagingSenderId: "614525991784",
  appId: "1:614525991784:web:4393c365db50e9f84f34dd",
};

const app = initializeApp(config);

export const db = getFirestore(app);
export const auth = getAuth(app);

/* A text belongs to a Google account rather than a browser, so the same person
   can manage what they shared from any device. Reading a shared link needs no
   account at all. */
const provider = new GoogleAuthProvider();

export function watchUser(fn: (user: User | null) => void): () => void {
  // Resolves the pending redirect first, so a phone that took the redirect path
  // comes back signed in rather than silently signed out.
  getRedirectResult(auth).catch(() => {});
  return onAuthStateChanged(auth, fn);
}

/** Popup where it works, redirect where the browser refuses one. */
export async function signIn(): Promise<void> {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    const code = (error as { code?: string }).code ?? "";
    if (
      code === "auth/popup-blocked" ||
      code === "auth/operation-not-supported-in-this-environment"
    ) {
      await signInWithRedirect(auth, provider);
      return;
    }
    if (
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request"
    ) {
      return;
    }
    throw error;
  }
}

export function signOutUser(): Promise<void> {
  return signOut(auth);
}

/** The signed-in uid, or null. Writes that need an owner check this first. */
export function currentUid(): string | null {
  return auth.currentUser?.uid ?? null;
}
