
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your app's Firebase project configuration
const firebaseConfig = {
  // IMPORTANT: You need to replace "YOUR_API_KEY_HERE" with your actual Firebase API key.
  // This is the reason your login attempts are failing with a 400 error.
  // Go to your Firebase project console -> Project Settings -> General -> Your apps -> Web app
  apiKey: "AIzaSyA-3AnA6V4qmXYPqdKWShZnXIKbacZ4DVc",
  authDomain: "forge-elite-6b629.firebaseapp.com",
  projectId: "forge-elite-6b629",
  storageBucket: "forge-elite-6b629.firebasestorage.app",
  messagingSenderId: "822089163928",
  appId: "1:822089163928:web:c155b3788f2b473b1d5ced",
  measurementId: "G-QYJLMGCGJ4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
