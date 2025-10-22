// src/services/AuthService.js

const API_URL = "http://localhost:8080/api/auth/"; // Adaptez si votre backend est ailleurs

const register = (firstName, lastName, email, password) => {
  return fetch(API_URL + "register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ firstName, lastName, email, password }),
  });
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
    // Stocker le token JWT (par exemple dans localStorage)
    if (data.token) { // Utilisez 'token' basé sur votre LoginResponse Java
      localStorage.setItem("user", JSON.stringify(data));
    }
    return data;
  } else {
    // Gérer les erreurs de connexion
    const errorData = await response.text(); // Lire le message d'erreur du backend
    throw new Error(errorData || "Échec de la connexion");
  }
};

const logout = () => {
  localStorage.removeItem("user");
  // Optionnel : appeler un endpoint /logout sur le backend si vous en avez un
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default AuthService;