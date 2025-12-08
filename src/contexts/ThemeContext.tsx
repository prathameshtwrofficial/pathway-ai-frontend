import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

type Theme = 'light' | 'dark' | 'blue-dark';

interface ThemeContextType {
  theme: Theme;
  userTheme: Theme;
  setUserTheme: (theme: Theme) => void;
  effectiveTheme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [userTheme, setUserThemeState] = useState<Theme>('light');

  // Public routes that should always use light theme
  const publicRoutes = ['/', '/login', '/signup', '/backend-test'];

  // Check if current route is public
  const isPublicRoute = publicRoutes.includes(location.pathname) ||
    location.pathname.startsWith('/career-quiz');

  // Determine effective theme: public routes always light, dashboard uses user theme
  const effectiveTheme: Theme = isPublicRoute ? 'light' : userTheme;

  // Load user theme from localStorage on mount (only for authenticated users)
  useEffect(() => {
    if (currentUser) {
      const savedTheme = localStorage.getItem('userTheme') as Theme;
      if (savedTheme && ['light', 'dark', 'blue-dark'].includes(savedTheme)) {
        setUserThemeState(savedTheme);
      }
    }
  }, [currentUser]);

  const setUserTheme = (newTheme: Theme) => {
    setUserThemeState(newTheme);
    if (currentUser) {
      localStorage.setItem('userTheme', newTheme);
    }
  };

  // Apply effective theme to document when it changes
  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes and data attributes
    root.classList.remove('light', 'dark', 'blue-dark');
    root.removeAttribute('data-theme');

    // Add the effective theme class and data attribute
    if (effectiveTheme !== 'light') {
      root.classList.add(effectiveTheme);
      root.setAttribute('data-theme', effectiveTheme);
    }

    // Force style recalculation by triggering a reflow
    root.offsetHeight; // Trigger reflow

    // Also try setting a CSS custom property directly to force update
    root.style.setProperty('--current-theme', effectiveTheme);
  }, [effectiveTheme]);

  const value = {
    theme: effectiveTheme, // For backward compatibility
    userTheme,
    setUserTheme,
    effectiveTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}