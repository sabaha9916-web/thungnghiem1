import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoDummyKeyForBacchaiEbook9916",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tieng-trung-bac-hai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tieng-trung-bac-hai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tieng-trung-bac-hai.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "761504341731",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:761504341731:web:9916bacchai"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Validation test for Firestore connection
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('client is offline')) {
      console.warn("Firestore running in offline / fallback mode.");
    }
    return false;
  }
}

export default app;
