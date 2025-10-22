// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// On peut aussi passer les rôles autorisés en props si nécessaire
// const ProtectedRoute = ({ allowedRoles }) => {
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation(); // Pour se souvenir où l'utilisateur voulait aller

  // Si on charge encore l'état d'authentification, ne rien afficher ou un spinner
  if (loading) {
    return <div>Vérification de l'authentification...</div>; // Ou un composant Spinner global
  }

  // Si l'utilisateur n'est pas connecté
  if (!currentUser) {
    // Rediriger vers login, en gardant en mémoire la page d'origine
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Optionnel : Vérification des rôles (si vous implémentez allowedRoles)
  // const userRoles = currentUser?.roles || [];
  // if (allowedRoles && !allowedRoles.some(role => userRoles.includes(role))) {
  //   // Rediriger vers une page "Non autorisé" ou l'accueil
  //   return <Navigate to="/unauthorized" replace />;
  // }

  // Rendre le composant enfant demandé (via children ou Outlet)
  return children ? children : <Outlet />;
};

export default ProtectedRoute;