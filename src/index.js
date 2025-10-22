// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import './styles/index.css'; // Chemin CSS mis à jour
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './contexts/AuthContext'; // Chemin Contexte mis à jour

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* BrowserRouter doit englober AuthProvider et App pour que les hooks de navigation fonctionnent partout */}
    <BrowserRouter>
      {/* AuthProvider rend le contexte d'authentification disponible à toute l'application */}
      <AuthProvider>
        <App /> {/* Le composant principal de l'application */}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Fonction pour mesurer les performances (optionnel)
reportWebVitals();