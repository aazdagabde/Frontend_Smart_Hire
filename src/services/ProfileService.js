// src/services/ProfileService.js
import axios from 'axios';
import AuthService from './AuthService'; //

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Fonction pour obtenir les en-têtes d'authentification
const getAuthHeaders = () => {
  const user = AuthService.getCurrentUser(); //
  
  // --- CORRECTION ---
  // L'erreur montre que le code cherche 'token'.
  // Mais votre AuthService stocke 'jwt'.
  if (user && user.jwt) { 
    return { Authorization: 'Bearer ' + user.jwt }; // On utilise 'user.jwt'
  }
  // --- FIN CORRECTION ---

  return {};
};

// Fonction pour gérer la réponse d'Axios (extraire data.data)
const handleAxiosResponse = (response) => {
    // Supposant que votre API renvoie { success: true, data: {...}, message: "..." }
    if (response.data && response.data.success && response.data.data) {
        return response.data.data; // Renvoie l'objet "data"
    }
    // Gérer aussi les réponses qui n'ont pas de 'data' (juste un message de succès)
    if (response.data && response.data.success === true) {
        return response.data;
    }
    return response.data;
};

// Fonction pour gérer les erreurs Axios
const handleAxiosError = (error) => {
    const message = (error.response && error.response.data && error.response.data.message)
                    || error.message || error.toString();
    console.error("Erreur de service:", message);
    throw new Error(message);
};


// Récupérer le profil de l'utilisateur authentifié
const getProfile = async () => {
  try {
    const response = await axios.get(API_URL + '/profile', {
      headers: getAuthHeaders() // Cette fonction est maintenant corrigée
    });
    return handleAxiosResponse(response); 
  } catch (error) {
    handleAxiosError(error);
  }
};

// Mettre à jour le profil (nom, prénom, tél)
const updateProfile = async (profileData) => {
  try {
    const response = await axios.put(API_URL + '/profile', profileData, {
      headers: getAuthHeaders() // Cette fonction est maintenant corrigée
    });
    return handleAxiosResponse(response);
  } catch (error) {
    handleAxiosError(error);
  }
};

// Mettre à jour la photo de profil
const updateProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('picture', file);

  try {
    const response = await axios.put(API_URL + '/profile/picture', formData, {
      headers: {
        ...getAuthHeaders(), // Cette fonction est maintenant corrigée
        'Content-Type': 'multipart/form-data'
      }
    });
    return handleAxiosResponse(response);
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