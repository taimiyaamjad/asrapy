
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  projectId: "studio-3957723972-abda9",
  appId: "1:525631434021:web:aa31cc81b7c854a4683ecc",
  apiKey: "AIzaSyChWmyRIh77WCMhABCQZQ3hB96vAzV1ans",
  authDomain: "studio-3957723972-abda9.firebaseapp.com",
  storageBucket: "studio-3957723972-abda9.appspot.com",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleAuthProvider = new GoogleAuthProvider();
