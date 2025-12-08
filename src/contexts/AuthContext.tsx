import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

interface UserData {
  email: string;
  displayName: string | null;
  contactNo?: string;
  githubProfile?: string;
  socialMediaLinks?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  photoURL?: string | null;
  uid: string;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<User>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  async function signup(email: string, password: string, displayName: string) {
    try {
      console.log('Starting signup process...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User created successfully:', user.uid);
      
      // Update profile with display name
      await updateProfile(user, { displayName });
      console.log('Profile updated with display name');
      
      // Create user document in Firestore
      const newUserData: UserData = {
        email,
        displayName,
        uid: user.uid,
        photoURL: user.photoURL
      };
      
      await setDoc(doc(db, 'users', user.uid), newUserData);
      console.log('User document created in Firestore');
      
      // Force update the userData state
      await fetchUserData(user);
      return user;
    } catch (error: any) {
      console.error('Error signing up:', error);
      // More detailed error logging
      if (error.code) {
        console.error('Error code:', error.code);
      }
      if (error.message) {
        console.error('Error message:', error.message);
      }
      throw error;
    }
  }

  async function login(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  async function loginWithGoogle() {
    try {
      console.log('Starting Google login process...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google login successful:', result);
      const user = result.user;
      
      // Check if user document exists, if not create one
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.log('Creating new user document in Firestore');
        const newUserData: UserData = {
          email: user.email!,
          displayName: user.displayName,
          uid: user.uid,
          photoURL: user.photoURL
        };
        
        await setDoc(userDocRef, newUserData);
        console.log('User document created successfully');
      } else {
        console.log('User document already exists');
      }
      
      // Force update the userData state
      await fetchUserData(user);
      return user;
    } catch (error: any) {
      console.error('Error logging in with Google:', error);
      // More detailed error logging
      if (error.code) {
        console.error('Error code:', error.code);
      }
      if (error.message) {
        console.error('Error message:', error.message);
      }
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  async function updateUserData(data: Partial<UserData>) {
    if (!currentUser) return;
    
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, data, { merge: true });
      
      // Update local state
      setUserData(prev => prev ? { ...prev, ...data } : null);
      
      // Update profile if displayName is provided
      if (data.displayName) {
        await updateProfile(currentUser, { displayName: data.displayName });
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }

  async function fetchUserData(user: User) {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      } else {
        // If no user data exists yet, create basic profile
        const basicUserData: UserData = {
          email: user.email!,
          displayName: user.displayName,
          uid: user.uid,
          photoURL: user.photoURL
        };
        
        await setDoc(userDocRef, basicUserData);
        setUserData(basicUserData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserData(user);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}