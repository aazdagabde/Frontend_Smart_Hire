// src/components/PublicOnlyRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Assurez-vous que le chemin est correct

/**
 * Ce composant protège les routes qui ne doivent être accessibles
 * qu'aux utilisateurs NON connectés (ex: /login, /register).
 * Si l'utilisateur est connecté, il est redirigé vers /dashboard.
 */
const PublicOnlyRoute = ({ children }) => {
  const { currentUser, loading } = useAuth(); // Utilise le contexte d'authentification

  // Attendre la fin de la vérification de l'authentification
  if (loading) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            Chargement...
        </div>
     ); // Ou un composant Spinner
  }

  // Si l'utilisateur EST connecté, on le redirige
  if (currentUser) {
    // Redirige vers le tableau de bord
    return <Navigate to="/dashboard" replace />;
  }

  // Si l'utilisateur N'EST PAS connecté, on affiche le contenu demandé (la page Login ou Register)
  return children ? children : <Outlet />;
};

export default PublicOnlyRoute;