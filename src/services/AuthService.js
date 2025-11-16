// src/services/AuthService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/auth';
const USER_DATA_KEY = 'smartHireUser';

/**
 * Gère la sauvegarde de l'objet utilisateur (qui contient le JWT)
 * dans le stockage approprié.
 * @param {object} userData - L'objet utilisateur (ex: { jwt, id, email, roles, ... })
 * @param {boolean} rememberMe - Faut-il utiliser localStorage (true) ou sessionStorage (false)
 */
const handleLoginResponse = (userData, rememberMe) => {
  // Votre API renvoie "jwt"
  if (userData.jwt) {
    const storage = rememberMe ? localStorage : sessionStorage;
    // On stocke l'objet utilisateur complet
    storage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  }
  return userData;
};

/**
 * Fonction de Connexion
 * @param {string} email
 * @param {string} password
 * @param {boolean} rememberMe
 */
const login = async (email, password, rememberMe = true) => {
  try {
    const response = await axios.post(API_URL + '/login', {
      email,
      password,
    });
    
    // response.data est la réponse complète de votre API: 
    // { data: { jwt, ... }, success: true, ... }
    
    // On vérifie que la connexion a réussi ET que le champ "data" existe
    if (response.data && response.data.success && response.data.data) {
      
      // On passe SEULEMENT response.data.data (l'objet utilisateur)
      // à handleLoginResponse.
      return handleLoginResponse(response.data.data, rememberMe);

    } else {
      // Gérer le cas où success=false ou data est manquant
      throw new Error(response.data.message || 'Réponse de connexion invalide');
    }

  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) 
                    || error.message || error.toString();
    console.error("Erreur AuthService.login:", message);
    throw new Error(message); // Propager l'erreur
  }
};

/**
 * Fonction de Déconnexion
 * Supprime l'utilisateur des deux stockages.
 */
const logout = () => {
  localStorage.removeItem(USER_DATA_KEY);
  sessionStorage.removeItem(USER_DATA_KEY);
};

/**
 * Fonction pour obtenir l'utilisateur actuel
 * Vérifie d'abord localStorage, puis sessionStorage.
 */
const getCurrentUser = () => {
  let user = localStorage.getItem(USER_DATA_KEY);
  if (user) {
    return JSON.parse(user);
  }
  
  user = sessionStorage.getItem(USER_DATA_KEY);
  if (user) {
    return JSON.parse(user);
  }

  return null;
};

/**
 * Fonction d'Inscription
 */
const register = async (firstName, lastName, email, password, role) => {
    try {
        const response = await axios.post(API_URL + '/register', {
            firstName,
            lastName,
            email,
            password,
            role // Ex: "ROLE_CANDIDAT"
        });
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) 
                        || error.message || error.toString();
        console.error("Erreur AuthService.register:", message);
        throw new Error(message);
    }
};


const AuthService = {
  login,
  logout,
  getCurrentUser,
  register,
};

export default AuthService;