// firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyA3HF5LXj6-JExj21seeP2veztnbmv-Rv0",
  authDomain: "afcon-bracket-pred.firebaseapp.com",
  projectId: "afcon-bracket-pred",
  storageBucket: "afcon-bracket-pred.firebasestorage.app",
  messagingSenderId: "224630147336",
  appId: "1:224630147336:web:640e2849b3431fdf6884bd",
  measurementId: "G-XSCF8T9F68"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
