// Firebase Admin SDK setup - Robust version that works without credentials
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

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

// Database and auth instances
let dbInstance = null;
let authInstance = null;
let isInitialized = false;

/**
 * Get Firestore database instance
 * Returns null if not properly initialized (no service account)
 */
const getDb = () => {
  if (!isInitialized || !dbInstance) {
    console.log('Firestore: Not initialized - returning null');
    return null;
  }
  return dbInstance;
};

/**
 * Get Firebase Auth instance
 */
const getAuth = () => {
  if (!isInitialized || !authInstance) {
    return null;
  }
  return authInstance;
};

/**
 * Initialize Firebase Admin SDK
 * This will fail gracefully if no service account is available
 */
const initializeFirebase = () => {
  // If already initialized, just return
  if (isInitialized && dbInstance) {
    return true;
  }

  try {
    // Check if already initialized by another module
    if (admin.apps.length > 0) {
      console.log('Firebase Admin SDK already initialized');
      dbInstance = admin.firestore();
      authInstance = admin.auth();
      isInitialized = true;
      return true;
    }

    // Try to load service account from environment variable (JSON string)
    let serviceAccount = null;
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccountJson) {
      try {
        serviceAccount = JSON.parse(serviceAccountJson);
        console.log('Firebase: Using service account from FIREBASE_SERVICE_ACCOUNT env variable');
      } catch (parseError) {
        console.warn('Firebase: Could not parse FIREBASE_SERVICE_ACCOUNT JSON');
      }
    }

    // Try to load from file path in environment variable
    if (!serviceAccount) {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
      if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
        try {
          serviceAccount = require(serviceAccountPath);
          console.log('Firebase: Using service account from file:', serviceAccountPath);
        } catch (loadError) {
          console.warn('Firebase: Could not load service account file');
        }
      }
    }

    // Initialize Firebase Admin with appropriate credentials
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin initialized with service account');
    } else {
      // Cannot initialize with projectId alone for Firestore operations
      // Just mark as not initialized and let routes handle the null case
      console.warn('Firebase Admin: No service account available - Firestore features disabled');
      console.warn('To enable Firestore, add FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_KEY_PATH to .env');
      isInitialized = false;
      return false;
    }
    
    dbInstance = admin.firestore();
    authInstance = admin.auth();
    isInitialized = true;
    console.log('Firebase Admin fully initialized with project:', firebaseConfig.projectId);
    return true;
  } catch (error) {
    console.error('Firebase initialization error:', error.message);
    isInitialized = false;
    dbInstance = null;
    authInstance = null;
    return false;
  }
};

// Initialize on module load
initializeFirebase();

module.exports = {
  admin,
  db: getDb,
  auth: getAuth,
  firebaseConfig,
  initializeFirebase,
  isInitialized: () => isInitialized
};
