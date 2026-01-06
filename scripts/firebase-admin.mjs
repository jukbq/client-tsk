// scripts/firebase-admin.mjs
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- аналог __dirname для ESM ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- читаємо JSON руками ---
const serviceAccountPath = path.resolve(
  __dirname,
  '../secrets/taverna-synii-kit-13c01-firebase-adminsdk-fbsvc-c8663852d7.json'
);

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, 'utf-8')
);

// --- ініціалізація Firebase ---
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db = admin.firestore();
