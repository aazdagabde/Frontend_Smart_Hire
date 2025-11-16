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
    // Utilise la nouvelle logique de AuthService.getCurrentUser()
    const user = AuthService.getCurrentUser(); 
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false); // Indiquer que la vérification initiale est terminée
  }, []);

  // Fonction de connexion qui met à jour l'état et utilise AuthService
  // AJOUT du paramètre 'rememberMe'
  const login = async (email, password, rememberMe) => {
    try {
      // Passe 'rememberMe' au service
      const userData = await AuthService.login(email, password, rememberMe); 
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
    AuthService.logout(); // Supprime l'utilisateur du localStorage ET sessionStorage
    setCurrentUser(null); // Met à jour l'état global   
  };

  // ... (le reste du fichier, y compris 'if (loading)' et 'return', est inchangé) ...
  if (loading) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem' }}>
            Chargement...
        </div>
     ); 
  }

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