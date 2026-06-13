import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase services directly
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Limit retry timeouts to 20 seconds to fail fast and show errors immediately
storage.maxUploadRetryTime = 20000;
storage.maxOperationRetryTime = 20000;

console.log("Firebase config check:", {
  apiKeyLoaded: !!firebaseConfig.apiKey,
  apiKeyPlaceholder: firebaseConfig.apiKey === 'your_api_key_here',
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket
});

export { db, storage };
