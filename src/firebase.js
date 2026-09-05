console.log("firebase.ts loading...");

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

console.log("Firebase config loaded:", firebaseConfig.projectId);

let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase app initialized");
} catch (error) {
  console.error("Firebase initialization failed:", error);
  throw error;
}

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Connection test removed for performance.
