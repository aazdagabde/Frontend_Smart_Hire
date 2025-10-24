// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Composant de Route Protégée.
 * Vérifie si l'utilisateur est connecté et (optionnellement) s'il a le rôle requis.
 * Redirige vers la page de connexion si non connecté.
 * Redirige vers '/unauthorized' si connecté mais rôle incorrect.
 * Mémorise la page cible pour redirection après connexion.
 */
const ProtectedRoute = ({ children, requiredRole }) => { // Accepte un rôle requis
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Vérification de l'authentification...</div>;
  }

  // Si pas connecté, rediriger vers login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si un rôle est requis et que l'utilisateur ne l'a pas
  if (requiredRole && !currentUser.roles?.includes(requiredRole)) {
    // Rediriger vers une page "Non autorisé"
    return <Navigate to="/unauthorized" replace />;
  }

  // Si connecté et (si rôle requis) a le bon rôle
  return children ? children : <Outlet />;
};

export default ProtectedRoute;