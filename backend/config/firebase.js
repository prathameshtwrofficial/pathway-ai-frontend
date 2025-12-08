// Firebase Admin SDK setup
const admin = require('firebase-admin');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBH0RahqiKqILIF9Cc6Z87qTJloAX43spc",
  authDomain: "career-guiding-app-59113.firebaseapp.com",
  projectId: "career-guiding-app-59113",
  storageBucket: "career-guiding-app-59113.firebasestorage.app",
  messagingSenderId: "816044177073",
  appId: "1:816044177073:web:dc598824c40188fccdd490",
  measurementId: "G-GNDV2M7W26"
};

// Initialize Firebase Admin (requires service account key for production)
// For development, you can use the projectId, but for full functionality,
// download service account key from Firebase Console > Project Settings > Service Accounts
if (!admin.apps.length) {
  // For local development without service account key, use projectId only
  // In production, initialize with service account credentials
  admin.initializeApp({
    projectId: firebaseConfig.projectId
  });
}

const db = admin.firestore();
const auth = admin.auth();

console.log('Firebase Admin initialized with project:', firebaseConfig.projectId);

module.exports = {
  admin,
  db,
  auth,
  firebaseConfig
};