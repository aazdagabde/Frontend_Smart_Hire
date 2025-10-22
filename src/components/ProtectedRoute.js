// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Ajustez le chemin si nécessaire

/**
 * Composant de Route Protégée.
 * Vérifie si l'utilisateur est connecté via le AuthContext.
 * Redirige vers la page de connexion si non connecté, en mémorisant la page cible.
 */
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth(); // Récupère l'utilisateur et l'état de chargement du contexte
  const location = useLocation(); // Hook pour obtenir l'URL actuelle

  // Si l'état d'authentification est encore en cours de chargement, attendre
  if (loading) {
    // Afficher un état de chargement pendant la vérification
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Vérification de l'authentification...</div>;
  }

  // Si le chargement est terminé et qu'il n'y a pas d'utilisateur connecté
  if (!currentUser) {
    // Rediriger vers la page de connexion
    // 'state={{ from: location }}' permet de mémoriser l'URL demandée initialement
    // 'replace' remplace l'entrée actuelle dans l'historique de navigation
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si l'utilisateur est connecté, afficher le contenu demandé
  // Utilise `children` si fourni (pour layouts complexes) ou `Outlet` pour les routes imbriquées standard
  return children ? children : <Outlet />;
};

export default ProtectedRoute;