// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AuthService from '../services/AuthService'; // Ajustez le chemin si nécessaire

// Création du contexte
const AuthContext = createContext(null);

// Composant fournisseur du contexte
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Gérer l'état de chargement initial

  // Au montage du composant, vérifier si un utilisateur est déjà dans le localStorage
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      // Ici, vous pourriez ajouter une logique pour vérifier si le token JWT est encore valide
      // avant de définir l'utilisateur. Pour l'instant, on fait confiance au localStorage.
      setCurrentUser(user);
    }
    setLoading(false); // Indiquer que la vérification initiale est terminée
  }, []);

  // Fonction de connexion qui met à jour l'état et utilise AuthService
  const login = async (email, password) => {
    try {
      const userData = await AuthService.login(email, password); // Appelle l'API via le service
      setCurrentUser(userData); // Met à jour l'état global
      return userData; // Retourne les données pour une redirection éventuelle
    } catch (error) {
      setCurrentUser(null); // Assurer la déconnexion en cas d'erreur
      AuthService.logout(); // Nettoyer aussi localStorage
      console.error("Erreur de connexion dans AuthContext:", error);
      throw error; // Propager l'erreur pour l'afficher dans le formulaire
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    AuthService.logout(); // Supprime l'utilisateur du localStorage
    setCurrentUser(null); // Met à jour l'état global
    // La redirection sera gérée par le composant qui appelle logout (ex: Navbar)
  };

  // Pendant le chargement initial, afficher un message ou un spinner
  if (loading) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem' }}>
            Chargement...
        </div>
     ); // Améliorez ceci avec un vrai composant Spinner si vous en avez un
  }

  // Rendre le fournisseur avec les valeurs (utilisateur actuel, fonctions login/logout, état de chargement)
  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour consommer facilement le contexte dans d'autres composants
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};