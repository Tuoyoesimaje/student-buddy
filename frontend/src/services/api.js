// Use environment variable for backend URL
const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

// Log the API URL being used
console.log('API Service Initialized with URL:', API_URL);
console.log('Environment:', import.meta.env.MODE);

console.log('Using API URL:', API_URL);

// Helper function to handle API requests
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const requestId = Math.random().toString(36).substr(2, 9);
  
  console.log(`[${requestId}] API Request:`, { 
    method: options.method || 'GET',
    url,
    headers: options.headers || {}
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
      },
      credentials: 'include',
      mode: 'cors'
    });

    console.log(`[${requestId}] Response Status:`, response.status);
    
    // Clone the response to read it multiple times if needed
    const responseClone = response.clone();
    let data;
    
    try {
      data = await response.json();
    } catch (e) {
      const text = await responseClone.text();
      console.error(`[${requestId}] Failed to parse JSON:`, text);
      data = {};
    }
    
    console.log(`[${requestId}] Response Data:`, data);
    
    if (!response.ok) {
      const error = new Error(data.message || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = data;
      error.response = response;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`[${requestId}] API Request Failed:`, {
      message: error.message,
      status: error.status,
      url,
      options
    }, error);
    throw error;
  }
};

export const login = async (email, password) => {
  console.log('Login attempt with:', { email });
  
  try {
    const data = await apiRequest('/login', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    console.log('Login successful, storing token...');
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (username, email, password) => {
  try {
    const data = await apiRequest('/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};