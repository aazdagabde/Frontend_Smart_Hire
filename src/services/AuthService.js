// src/services/AuthService.js
import { jwtDecode } from 'jwt-decode';

const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction
  ? "https://backend-smart-hire.onrender.com"
  : "http://localhost:8080";
const AUTH_API_URL = `${API_BASE_URL}/api/auth/`;

console.log(`AuthService API URL set to: ${AUTH_API_URL}`);

/**
 * Enregistre un nouvel utilisateur.
 * @returns {Promise<object>} L'objet de réponse complet du backend ({success, message, status}).
 * @throws {Error} Lance une erreur si l'inscription échoue.
 */
const register = async (firstName, lastName, email, password, phoneNumber) => {
  const response = await fetch(AUTH_API_URL + "register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ firstName, lastName, email, password, phoneNumber }),
  });

  const apiResponse = await response.json();

  if (response.ok && apiResponse.success) {
    return apiResponse;
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

      const decodedToken = jwtDecode(user.jwt);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
          console.warn("Token JWT expiré, déconnexion automatique.");
          logout();
          return null;
      }

      return user;
  } catch (e) {
      console.error("Erreur lecture/décodage utilisateur depuis localStorage:", e);
      logout();
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