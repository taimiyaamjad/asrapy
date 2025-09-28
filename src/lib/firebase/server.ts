
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getApp as getAdminApp, getApps as getAdminApps, initializeApp as initializeAdminApp, type App } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { credential } from "firebase-admin";

let adminApp: App;

if (!getAdminApps().length) {
  // When deployed to a Google Cloud environment, the Admin SDK is automatically
  // initialized with the default credentials of the service account.
  adminApp = initializeAdminApp();
} else {
  adminApp = getAdminApp();
}

const adminAuth = getAdminAuth(adminApp);
const adminDb = getAdminFirestore(adminApp);

export { adminApp, adminAuth, adminDb };
