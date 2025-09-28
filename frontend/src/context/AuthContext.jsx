import React, { createContext, useContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkTokenExpiration = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      console.log('Decoded token:', decoded);
      console.log('Token expiration (exp):', decoded.exp);
      console.log('Current time:', currentTime);
      const isValid = decoded.exp > currentTime;
      console.log('Token valid:', isValid);
      return isValid;
    } catch (error) {
      console.error('Error decoding or checking token expiration:', error);
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    
    if (token && storedUserId) {
      if (checkTokenExpiration(token)) {
        setUserId(storedUserId);
        setIsAuthenticated(true);
      } else {
        // Token is expired, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setUserId(null);
        setIsAuthenticated(false);
        window.location.href = '/login';
      }
    }
  }, []);

  const login = (token, userId) => {
    if (checkTokenExpiration(token)) {
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      setUserId(userId);
      setIsAuthenticated(true);
    } else {
      throw new Error('Token is invalid or expired');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUserId(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  const handleAuthError = (response) => {
    if (response && (response.status === 401 || response.status === 403)) {
      console.log('Authentication error detected, logging out...');
      logout();
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ userId, isAuthenticated, login, logout, handleAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};