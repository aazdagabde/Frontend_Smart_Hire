// src/services/AuthService.js
import { jwtDecode } from 'jwt-decode'; // <-- IMPORTER

// Determine the API URL based on the environment
const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction
  ? "https://backend-smart-hire.onrender.com" // Your Render backend URL
  : "http://localhost:8080";                  // Your local backend URL

const AUTH_API_URL = `${API_BASE_URL}/api/auth/`; // Append the auth path

console.log(`AuthService API URL set to: ${AUTH_API_URL}`); // For debugging

/**
 * Enregistre un nouvel utilisateur.
 * @returns {Promise<object>} L'objet de réponse complet du backend ({success, message, status}).
 * @throws {Error} Lance une erreur si l'inscription échoue.
 */
const register = async (firstName, lastName, email, password) => {
  // Use AUTH_API_URL instead of the old hardcoded string
  const response = await fetch(AUTH_API_URL + "register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ firstName, lastName, email, password }),
  });

  const apiResponse = await response.json();

  if (response.ok && apiResponse.success) {
    return apiResponse; // Return the full response object on success
  } else {
    throw new Error(apiResponse.message || "Erreur lors de l'inscription.");
  }
};

/**
 * Connecte un utilisateur.
 * @returns {Promise<object>} L'objet de réponse complet du backend ({success, data, message, status}).
 * @throws {Error} Lance une erreur si la connexion échoue.
 */
const login = async (email, password) => {
  // Use AUTH_API_URL instead of the old hardcoded string
  const response = await fetch(AUTH_API_URL + "login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const apiResponse = await response.json();

  if (response.ok && apiResponse.success && apiResponse.data?.jwt) {
      // On sauvegarde l'objet 'data' (qui contient jwt, id, email...)
      localStorage.setItem("user", JSON.stringify(apiResponse.data));
      // On retourne cet objet utilisateur
      return apiResponse.data; // Keep returning just the user data for login function compatibility
  } else {
      throw new Error(apiResponse.message || "Email ou mot de passe incorrect.");
  }
};

/**
 * Déconnecte l'utilisateur.
 */
const logout = () => {
  localStorage.removeItem("user");
};

/**
 * Récupère l'utilisateur courant (l'objet 'data' qui a été sauvegardé).
 */
const getCurrentUser = () => {
   try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null; // Pas de user

      const user = JSON.parse(userStr); // { jwt, id, ... }

      // --- DÉBUT DE L'AMÉLIORATION ---
      // 1. Décoder le token pour lire sa date d'expiration (exp)
      const decodedToken = jwtDecode(user.jwt);

      // 2. Obtenir l'heure actuelle en secondes (comme le champ 'exp')
      const currentTime = Date.now() / 1000;

      // 3. Comparer
      if (decodedToken.exp < currentTime) {
          // Le token est expiré
          console.warn("Token JWT expiré, déconnexion automatique.");
          logout(); // Nettoyer le localStorage
          return null; // Pas d'utilisateur valide
      }
      // --- FIN DE L'AMÉLIORATION ---
      
      return user; // Le token est toujours valide
  } catch (e) {
      // Gère les erreurs de JSON.parse ou de jwtDecode (token invalide)
      console.error("Erreur lecture/décodage utilisateur depuis localStorage:", e);
      logout(); // Nettoyer si les données sont corrompues
  }
  return null;
};

/**
 * Prépare l'en-tête d'autorisation.
 */
const authHeader = () => {
  const user = getCurrentUser(); // Récupère { jwt, id, ... }
  if (user && user.jwt) {
    return { Authorization: 'Bearer ' + user.jwt };
  } else {
    return {};
  }
};

// Exporter les fonctions
const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
  authHeader
};

export default AuthService;