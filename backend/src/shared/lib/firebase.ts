import admin from "firebase-admin";
import { AppError } from "./AppError";

export function getFirebaseAdmin(): admin.app.App {
  if (admin.apps.length) return admin.apps[0]!;
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) {
    // TODO: set FIREBASE_SERVICE_ACCOUNT in Railway to enable phone login
    throw new AppError(503, "Firebase phone login is not configured yet");
  }
  return admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccount)),
  });
}

export default admin;
