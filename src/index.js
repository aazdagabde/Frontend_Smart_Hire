// src/index.js
import React from 'react';
// Correct import from 'react-dom/client'
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css';
import './styles/App.css'; // Main styles with theme variables
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Use createRoot instead of create_client
const root = ReactDOM.createRoot(document.getElementById('root')); // <<< CORRECTED HERE

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider> {/* ThemeProvider wraps AuthProvider and App */}
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();