// Mock authentication system to replace Firebase Auth
import { User } from 'firebase/auth';

// Mock user storage
const mockUsers: Record<string, MockUser> = {};

interface MockUser {
  uid: string;
  email: string;
  password: string;
  displayName: string | null;
  photoURL: string | null;
}

// Mock user data storage
const mockUserData: Record<string, any> = {};

// Mock current user
let currentMockUser: MockUser | null = null;

// Mock auth state listeners
const authStateListeners: ((user: User | null) => void)[] = [];

// Generate a unique ID
const generateUid = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Convert MockUser to User (Firebase Auth User interface)
const mockUserToUser = (mockUser: MockUser | null): User | null => {
  if (!mockUser) return null;
  
  return {
    uid: mockUser.uid,
    email: mockUser.email,
    displayName: mockUser.displayName,
    photoURL: mockUser.photoURL,
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: Date.now().toString(),
      lastSignInTime: Date.now().toString()
    },
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'mock-token',
    getIdTokenResult: async () => ({
      token: 'mock-token',
      signInProvider: 'password',
      expirationTime: new Date(Date.now() + 3600000).toISOString(),
      issuedAtTime: new Date().toISOString(),
      authTime: new Date().toISOString(),
      claims: {}
    }),
    reload: async () => {},
    toJSON: () => ({}),
    providerId: 'password',
  } as User;
};

// Mock Firebase Auth methods
export const mockAuth = {
  // Create user with email and password
  createUserWithEmailAndPassword: async (auth: any, email: string, password: string) => {
    // Check if user already exists
    const existingUser = Object.values(mockUsers).find(user => user.email === email);
    if (existingUser) {
      throw new Error('auth/email-already-in-use');
    }
    
    // Create new user
    const uid = generateUid();
    const newUser: MockUser = {
      uid,
      email,
      password,
      displayName: null,
      photoURL: null
    };
    
    mockUsers[uid] = newUser;
    currentMockUser = newUser;
    
    // Notify listeners
    authStateListeners.forEach(listener => listener(mockUserToUser(newUser)));
    
    return { user: mockUserToUser(newUser) };
  },
  
  // Sign in with email and password
  signInWithEmailAndPassword: async (auth: any, email: string, password: string) => {
    // Find user
    const user = Object.values(mockUsers).find(user => user.email === email);
    
    if (!user) {
      throw new Error('auth/user-not-found');
    }
    
    if (user.password !== password) {
      throw new Error('auth/wrong-password');
    }
    
    currentMockUser = user;
    
    // Notify listeners
    authStateListeners.forEach(listener => listener(mockUserToUser(user)));
    
    return { user: mockUserToUser(user) };
  },
  
  // Sign in with Google
  signInWithPopup: async (auth: any, provider: any) => {
    // Create a mock Google user
    const uid = generateUid();
    const email = `google-user-${uid}@example.com`;
    
    const newUser: MockUser = {
      uid,
      email,
      password: '',
      displayName: `Google User ${uid.substring(0, 5)}`,
      photoURL: 'https://via.placeholder.com/150'
    };
    
    mockUsers[uid] = newUser;
    currentMockUser = newUser;
    
    // Notify listeners
    authStateListeners.forEach(listener => listener(mockUserToUser(newUser)));
    
    return { 
      user: mockUserToUser(newUser),
      providerId: 'google.com'
    };
  },
  
  // Sign out
  signOut: async (auth: any) => {
    currentMockUser = null;
    
    // Notify listeners
    authStateListeners.forEach(listener => listener(null));
    
    return Promise.resolve();
  },
  
  // Update profile
  updateProfile: async (user: any, profileData: any) => {
    const { uid } = user;
    const mockUser = mockUsers[uid];
    
    if (!mockUser) {
      throw new Error('auth/user-not-found');
    }
    
    mockUsers[uid] = {
      ...mockUser,
      ...profileData
    };
    
    if (currentMockUser && currentMockUser.uid === uid) {
      currentMockUser = mockUsers[uid];
      
      // Notify listeners
      authStateListeners.forEach(listener => listener(mockUserToUser(currentMockUser)));
    }
    
    return Promise.resolve();
  },
  
  // Listen for auth state changes
  onAuthStateChanged: (auth: any, callback: (user: User | null) => void) => {
    authStateListeners.push(callback);
    
    // Immediately call with current user
    callback(mockUserToUser(currentMockUser));
    
    // Return unsubscribe function
    return () => {
      const index = authStateListeners.indexOf(callback);
      if (index > -1) {
        authStateListeners.splice(index, 1);
      }
    };
  },
  
  // Get current user
  currentUser: null as User | null
};

// Mock Firestore methods
export const mockFirestore = {
  // Get document
  getDoc: async (docRef: any) => {
    const { path } = docRef;
    const [collection, id] = path.split('/').filter(Boolean);
    
    const data = mockUserData[id];
    
    return {
      exists: () => !!data,
      data: () => data || null,
      id
    };
  },
  
  // Set document
  setDoc: async (docRef: any, data: any, options: any = {}) => {
    const { path } = docRef;
    const [collection, id] = path.split('/').filter(Boolean);
    
    if (options.merge && mockUserData[id]) {
      mockUserData[id] = { ...mockUserData[id], ...data };
    } else {
      mockUserData[id] = data;
    }
    
    return Promise.resolve();
  },
  
  // Create document reference
  doc: (db: any, collection: string, id: string) => {
    return {
      path: `${collection}/${id}`,
      id
    };
  }
};

// Mock Google provider
export const mockGoogleProvider = {};