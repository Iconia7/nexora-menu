import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPJs5TR3wtkbr1mkx-XbyAwQzAz6lNTZM",
  authDomain: "nexora-creative.firebaseapp.com",
  projectId: "nexora-creative",
  storageBucket: "nexora-creative.firebasestorage.app",
  messagingSenderId: "264622332898",
  appId: "1:264622332898:web:fc028517f0a986fcbd77bb",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);