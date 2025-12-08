// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBH0RahqiKqILIF9Cc6Z87qTJloAX43spc",
  authDomain: "career-guiding-app-59113.firebaseapp.com",
  projectId: "career-guiding-app-59113",
  storageBucket: "career-guiding-app-59113.firebasestorage.app",
  messagingSenderId: "816044177073",
  appId: "1:816044177073:web:dc598824c40188fccdd490",
  measurementId: "G-GNDV2M7W26"
};

// Initialize Firebase
console.log('Initializing Firebase with config:', firebaseConfig);
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Set persistence to LOCAL (default) to persist auth state across sessions
// This ensures users stay logged in when refreshing the page
console.log('Setting auth persistence...');

const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

console.log('Firebase initialized successfully');
console.log('Auth state:', auth);
console.log('Firestore instance:', db);

export { app, analytics, auth, db, storage, googleProvider };