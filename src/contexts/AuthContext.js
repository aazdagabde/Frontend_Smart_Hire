// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AuthService from '../services/AuthService'; // Vérifiez/corrigez ce chemin

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      // Optionnel : Vous pourriez ajouter une vérification de la validité/expiration du token ici
      // avant de définir l'utilisateur.
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const userData = await AuthService.login(email, password);
      setCurrentUser(userData);
      return userData;
    } catch (error) {
      setCurrentUser(null);
      // Supprimer l'utilisateur du localStorage en cas d'échec de la connexion (token invalide par exemple)
      AuthService.logout();
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setCurrentUser(null);
    // Pas besoin de naviguer ici, le composant appelant (Layout) le fera.
  };

  // Afficher un état de chargement pendant la vérification initiale
  if (loading) {
    // Vous pouvez remplacer ceci par un composant Spinner plus élaboré
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            Chargement de l'application...
        </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}> {/* Exposer loading */}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};