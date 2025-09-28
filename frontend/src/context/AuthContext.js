import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axios'; // Assuming you have an axios instance

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null); // Add user state
  const [authLoading, setAuthLoading] = useState(true); // Add loading state
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      console.log('Attempting to load user from localStorage...');
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');

    if (token && storedUserId) {
        console.log('Token and userId found. Fetching user profile...');
      setIsAuthenticated(true);
      setUserId(storedUserId);
        setToken(token);
        try {
          const response = await api.get('/api/auth/me');
          console.log('User profile fetched successfully:', response.data);
          setUser(response.data); // Load user data
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Optionally clear auth data if fetching user fails
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          setIsAuthenticated(false);
          setUserId(null);
          setUser(null);
          setToken(null);
        } finally {
            setAuthLoading(false); // Set loading to false after attempt
        }
      } else {
        console.log('No token or userId found. User is not authenticated.');
        setIsAuthenticated(false);
        setUserId(null);
        setUser(null);
        setToken(null);
        setAuthLoading(false); // Set loading to false if no token/userId
      }
    };

    loadUser();
  }, []);

  // Function to fetch user data
  const fetchUser = async () => {
    setAuthLoading(true);
    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If fetching user fails, clear authentication state
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      setIsAuthenticated(false);
      setUserId(null);
      setUser(null);
      setToken(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (id, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', id);
    setIsAuthenticated(true);
    setUserId(id);
    setToken(token);
    setAuthLoading(true); // Set loading to true while fetching user after login
    // Fetch user data after login
    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data after login:', error);
      setUser(null);
    } finally {
        setAuthLoading(false); // Set loading to false after fetching
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      setIsAuthenticated(true);
      setUserId(data.userId);
      setToken(data.token);
      setAuthLoading(true); // Set loading to true while fetching user after registration
      
      // Fetch user data after registration
      try {
        const userResponse = await api.get('/api/auth/me');
        setUser(userResponse.data);
      } catch (error) {
        console.error('Error fetching user data after registration:', error);
        setUser(null);
      } finally {
          setAuthLoading(false); // Set loading to false after fetching
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUserId(null);
    setUser(null); // Clear user data on logout
    setAuthLoading(false); // Set loading to false on logout
    setToken(null);
  };

  // Function to update user data in context
  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, user, login, register, logout, updateUser, authLoading, token, fetchUser }}>
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