// src/services/ProfileService.js
import axios from 'axios';
import AuthService from './AuthService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Fonction pour obtenir les en-têtes d'authentification
const getAuthHeaders = () => {
  // CORRECTION: Utiliser la méthode qui existe dans AuthService.js
  const user = AuthService.getCurrentUser(); //
  
  // Vérifier si l'utilisateur et sa propriété 'jwt' existent
  if (user && user.jwt) { //
    return { Authorization: 'Bearer ' + user.jwt }; 
  }
  return {};
};

// Fonction pour gérer les erreurs Axios
const handleAxiosError = (error) => {
    const message = (error.response && error.response.data && error.response.data.message)
                    || error.message || error.toString();
    console.error("Erreur de service:", message, error.response);
    throw new Error(message);
};

// Récupérer le profil de l'utilisateur authentifié
const getProfile = async () => {
  try {
    // Cet endpoint (/me) est correct
    const response = await axios.get(API_URL + '/profile/me', {
      headers: getAuthHeaders() // Cette fonction est maintenant corrigée
    });
    return response.data; 
  } catch (error) {
    handleAxiosError(error);
  }
};

// Mettre à jour le profil (nom, prénom, tél)
const updateProfile = async (profileData) => {
  try {
    // Cet endpoint (/update) est correct
    const response = await axios.put(API_URL + '/profile/update', profileData, {
      headers: getAuthHeaders() // Cette fonction est maintenant corrigée
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Mettre à jour la photo de profil
const updateProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('picture', file); //

  try {
    // Cet endpoint (/picture) est correct
    const response = await axios.put(API_URL + '/profile/picture', formData, {
      headers: {
        ...getAuthHeaders(), // Cette fonction est maintenant corrigée
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

const ProfileService = {
  getProfile,
  updateProfile,
  updateProfilePicture
};

export default ProfileService;