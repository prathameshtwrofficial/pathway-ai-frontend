// Import directly from firebase.ts instead of initializing
import { db } from '@/lib/firebase';

// User profile functions
export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, profileData, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() };
    } else {
      return { success: true, data: null };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error };
  }
};

// Quiz results functions
export const saveQuizResult = async (userId: string, quizData: any) => {
  try {
    const quizRef = doc(db, 'quizResults', `${userId}_${Date.now()}`);
    await setDoc(quizRef, {
      userId,
      ...quizData,
      timestamp: new Date()
    });
    
    // Update user's quiz history
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      quizHistory: arrayUnion({
        quizId: quizData.quizId,
        score: quizData.score,
        totalQuestions: quizData.totalQuestions,
        timestamp: new Date()
      })
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving quiz result:', error);
    return { success: false, error };
  }
};

export const getUserQuizHistory = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists() && userSnap.data().quizHistory) {
      return { success: true, data: userSnap.data().quizHistory };
    } else {
      return { success: true, data: [] };
    }
  } catch (error) {
    console.error('Error getting quiz history:', error);
    return { success: false, error };
  }
};

// Learning progress functions
export const updateLearningProgress = async (userId: string, progressData: any) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      learningProgress: progressData
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating learning progress:', error);
    return { success: false, error };
  }
};

export const getLearningProgress = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists() && userSnap.data().learningProgress) {
      return { success: true, data: userSnap.data().learningProgress };
    } else {
      return { success: true, data: {} };
    }
  } catch (error) {
    console.error('Error getting learning progress:', error);
    return { success: false, error };
  }
};

// Resource tracking functions
export const markResourceCompleted = async (userId: string, resourceId: string, resourceType: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      [`completedResources.${resourceType}`]: arrayUnion(resourceId)
    });
    return { success: true };
  } catch (error) {
    console.error('Error marking resource as completed:', error);
    return { success: false, error };
  }
};

export const getCompletedResources = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists() && userSnap.data().completedResources) {
      return { success: true, data: userSnap.data().completedResources };
    } else {
      return { success: true, data: { courses: [], tutorials: [], books: [] } };
    }
  } catch (error) {
    console.error('Error getting completed resources:', error);
    return { success: false, error };
  }
};