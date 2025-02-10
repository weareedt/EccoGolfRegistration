import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBE98iV5HXuQXaCRzlLIM9AvdCyXxt1HkA",
  authDomain: "ecco-golf-vr.firebaseapp.com",
  databaseURL: "https://ecco-golf-vr-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ecco-golf-vr",
  storageBucket: "ecco-golf-vr.firebasestorage.app",
  messagingSenderId: "487216220331",
  appId: "1:487216220331:web:021ecf4f63d38c36b04fee",
  measurementId: "G-KQV275FW5M"
};

// Initialize Firebase
let firebase_app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Realtime Database with explicit URL
const db = getDatabase(firebase_app);

// Initialize Analytics (only in browser)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(firebase_app);
}

export { firebase_app, db, analytics }; 