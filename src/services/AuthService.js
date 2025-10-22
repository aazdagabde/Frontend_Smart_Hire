// src/services/AuthService.js
const API_URL = "http://localhost:8080/api/auth/"; // URL de base pour l'authentification

const register = (firstName, lastName, email, password) => {
  return fetch(API_URL + "register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ firstName, lastName, email, password }),
  });
  // La gestion du .ok et .text() sera faite dans le composant RegisterPage
};

const login = async (email, password) => {
  const response = await fetch(API_URL + "login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    const data = await response.json();
    if (data.jwt) {
      localStorage.setItem("user", JSON.stringify(data));
      return data; // Retourne les données utilisateur {jwt, id, email, firstName, lastName, roles}
    } else {
      // Cas où le backend répond 200 mais sans token JWT (inattendu)
      throw new Error("Réponse de connexion invalide du serveur.");
    }
  } else {
    // Essayer de lire le message d'erreur spécifique du backend
    let errorMsg = "Échec de la connexion. Vérifiez vos identifiants."; // Message par défaut
    try {
      // Le backend renvoie une simple chaîne pour les erreurs 401 ou autres
      const errorDataText = await response.text();
      if (errorDataText) {
        errorMsg = errorDataText;
      }
    } catch (e) {
      // Ignorer si le corps de l'erreur ne peut pas être lu
      console.error("Impossible de lire le corps de l'erreur:", e);
    }
     // Renvoyer l'erreur pour qu'elle soit traitée par le composant appelant
    throw new Error(errorMsg);
  }
};

const logout = () => {
  localStorage.removeItem("user");
  // Pas d'appel backend nécessaire pour invalider un token JWT côté client
};

const getCurrentUser = () => {
   try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        // !! Important pour l'avenir : Vérifier l'expiration du token ici !!
        // Exemple (nécessite npm install jwt-decode):
        // import { jwtDecode } from 'jwt-decode';
        // try {
        //    const decodedToken = jwtDecode(user.jwt);
        //    if (decodedToken.exp * 1000 < Date.now()) {
        //        console.log("Token expiré, déconnexion...");
        //        logout(); // Expiré
        //        return null;
        //    }
        // } catch (e) {
        //    console.error("Token invalide", e);
        //    logout(); // Token invalide
        //    return null;
        // }
        return user;
      }
  } catch (e) {
      console.error("Erreur lecture utilisateur depuis localStorage", e);
      logout(); // Nettoyer si les données sont corrompues
  }
  return null;
};

// Fonction pour obtenir les headers d'authentification pour les appels API protégés
const authHeader = () => {
  const user = getCurrentUser();
  if (user && user.jwt) {
    // Format standard pour Spring Security JWT
    return { Authorization: 'Bearer ' + user.jwt };
  } else {
    return {}; // Pas d'en-tête si non connecté ou pas de token
  }
};

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
  authHeader
};

export default AuthService;