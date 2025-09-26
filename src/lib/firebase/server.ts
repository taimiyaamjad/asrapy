
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getApp as getAdminApp, getApps as getAdminApps, initializeApp as initializeAdminApp, type App } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { credential } from "firebase-admin";

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

let adminApp: App;
if (!getAdminApps().length) {
  if (serviceAccount) {
    adminApp = initializeAdminApp({
      credential: credential.cert(serviceAccount),
    });
  } else {
    // This is for local development without service account credentials
    adminApp = initializeAdminApp();
  }
} else {
  adminApp = getAdminApp();
}

const adminAuth = getAdminAuth(adminApp);
const adminDb = getAdminFirestore(adminApp);

export { adminApp, adminAuth, adminDb };
