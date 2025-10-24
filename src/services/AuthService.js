// src/services/AuthService.js
import { jwtDecode } from 'jwt-decode'; // <-- IMPORTER

// URL de base de votre API d'authentification backend
const API_URL = "http://localhost:8080/api/auth/";

/**
 * Enregistre un nouvel utilisateur.
 * @returns {Promise<string>} Le message de succès.
 * @throws {Error} Lance une erreur si l'inscription échoue.
 */
const register = async (firstName, lastName, email, password) => {
  const response = await fetch(API_URL + "register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ firstName, lastName, email, password }),
  });

  // Tenter de lire la réponse, qu'elle soit OK ou non, car elle contient des infos
  const apiResponse = await response.json();

  if (response.ok && apiResponse.success) {
    // Succès, le backend renvoie probablement un message dans 'data' ou 'message'
    // D'après votre backend, il renvoie un simple texte.
    // MAIS si votre login est enveloppé, le register l'est sûrement aussi.
    // Nous allons faire confiance au format enveloppé.
    return apiResponse.message || apiResponse.data || "Inscription réussie!";
  } else {
    // Gérer l'erreur (ex: "Email déjà utilisé!")
    // Le message d'erreur est probablement dans apiResponse.message
    throw new Error(apiResponse.message || "Erreur lors de l'inscription.");
  }
};

/**
 * Connecte un utilisateur.
 * @returns {Promise<object>} Les données utilisateur (l'objet dans "data").
 * @throws {Error} Lance une erreur si la connexion échoue.
 */
const login = async (email, password) => {
  const response = await fetch(API_URL + "login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  // Tenter de lire le JSON dans tous les cas
  const apiResponse = await response.json();

  if (response.ok) {
    // VÉRIFICATION DE LA NOUVELLE STRUCTURE (basée sur votre Postman)
    if (apiResponse && apiResponse.success && apiResponse.data && apiResponse.data.jwt) {
      
      // On sauvegarde l'objet 'data' (qui contient jwt, id, email...)
      localStorage.setItem("user", JSON.stringify(apiResponse.data));
      
      // On retourne cet objet utilisateur
      return apiResponse.data;
    } else {
      // Réponse 200 OK, mais le format n'est pas bon (ex: { data: null, success: false })
      throw new Error(apiResponse.message || "Réponse de connexion invalide reçue du serveur.");
    }
  } else {
    // Gérer les erreurs (401, 500...)
    // Le message d'erreur est dans la réponse JSON
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