import admin from 'firebase-admin';
import fs from 'fs';

let credential;

if (process.env['FIREBASE_EMULATOR_HOST'] || process.env['LOCAL_FIREBASE']) {
  // 🔧 ЛОКАЛЬНИЙ РЕЖИМ — ЧИТАЄМО JSON
  const keyPath =
    process.env['GOOGLE_APPLICATION_CREDENTIALS'] ||
    'E:/Angular Develop/client-tsk/secrets/taverna-synii-kit-13c01-firebase-adminsdk-fbsvc-c8663852d7.json';

  credential = admin.credential.cert(
    JSON.parse(fs.readFileSync(keyPath, 'utf-8'))
  );
} else {
  // ☁️ PROD (Firebase App Hosting)
  credential = admin.credential.applicationDefault();
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential,
    projectId: 'taverna-synii-kit-13c01',
  });
}

export const db = admin.firestore();
