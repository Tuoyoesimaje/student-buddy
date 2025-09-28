import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App'; // Assuming your main app component is App.js
import { AuthProvider } from './context/AuthContext';
import './index.css'; // Assuming you have a global CSS file

// Main React rendering
const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);

  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  // Log error if root element is not found in the DOM
  console.error('Failed to find the root element with ID "root"');
}