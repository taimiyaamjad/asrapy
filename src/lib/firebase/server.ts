
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getApp as getAdminApp, getApps as getAdminApps, initializeApp as initializeAdminApp, type App } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

let adminApp: App;

if (!getAdminApps().length) {
  // When deployed to a Google Cloud environment (like Vercel), the Admin SDK is
  // automatically initialized using Application Default Credentials.
  // For local development, you must set the GOOGLE_APPLICATION_CREDENTIALS
  // environment variable in your .env file.
  adminApp = initializeAdminApp();
} else {
  adminApp = getAdminApp();
}

const adminAuth = getAdminAuth(adminApp);
const adminDb = getAdminFirestore(adminApp);

export { adminApp, adminAuth, adminDb };
