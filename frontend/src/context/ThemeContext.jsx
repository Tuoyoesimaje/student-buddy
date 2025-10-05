import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/axios';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('system');
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // Get system preference
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Apply theme to document
  const applyTheme = (themeValue, isDarkMode) => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add new theme class
    if (themeValue === 'system') {
      const systemTheme = getSystemTheme();
      root.classList.add(systemTheme);
      setIsDark(systemTheme === 'dark');
    } else {
      root.classList.add(themeValue);
      setIsDark(themeValue === 'dark');
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDarkMode ? '#1f2937' : '#ffffff');
    }
  };

  // Load theme from localStorage or user preferences
  const loadTheme = async () => {
    try {
      setIsLoading(true);
      
      // First check localStorage for immediate theme application
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setTheme(savedTheme);
        applyTheme(savedTheme);
      } else {
        // Default to system theme
        setTheme('system');
        applyTheme('system');
      }

      // Theme preferences are now stored in localStorage only
      // No backend sync needed for theme preferences
    } catch (error) {
      console.error('Error loading theme:', error);
      // Fallback to system theme
      setTheme('system');
      applyTheme('system');
    } finally {
      setIsLoading(false);
    }
  };

  // Change theme
  const changeTheme = async (newTheme) => {
    try {
      setTheme(newTheme);
      applyTheme(newTheme);
      localStorage.setItem('theme', newTheme);

      // Theme preferences are now stored in localStorage only
      // No backend sync needed for theme preferences
    } catch (error) {
      console.error('Error changing theme:', error);
    }
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  // Load theme on mount and when authentication changes
  useEffect(() => {
    loadTheme();
  }, [isAuthenticated, user]);

  // Toggle between light and dark (for quick toggle button)
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    changeTheme(newTheme);
  };

  const value = {
    theme,
    isDark,
    isLoading,
    changeTheme,
    toggleTheme,
    getSystemTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
