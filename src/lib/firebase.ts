import { initializeApp } from "firebase/app";
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

export const db = getFirestore(initializeApp(config));
