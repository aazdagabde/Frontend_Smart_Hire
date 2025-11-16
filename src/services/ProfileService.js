// src/services/ProfileService.js
import axios from 'axios';
import AuthService from './AuthService'; // Pour récupérer le token

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Fonction pour obtenir les en-têtes d'authentification
const getAuthHeaders = () => {
  const user = AuthService.getCurrentUser(); // Utilise la logique de AuthService
  if (user && user.token) {
    return { Authorization: 'Bearer ' + user.token };
  }
  return {};
};

// Fonction pour gérer la réponse d'Axios (extraire data.data)
const handleAxiosResponse = (response) => {
    // Supposant que votre API renvoie { success: true, data: {...}, message: "..." }
    if (response.data && response.data.success) {
        return response.data.data; // Renvoie l'objet "data"
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
      headers: getAuthHeaders()
    });
    // Votre API renvoie { success: true, data: {...}, ... }
    return handleAxiosResponse(response); 
  } catch (error) {
    handleAxiosError(error);
  }
};

// Mettre à jour le profil (nom, prénom, tél)
const updateProfile = async (profileData) => {
  try {
    const response = await axios.put(API_URL + '/profile', profileData, {
      headers: getAuthHeaders()
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
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });
    // Cette API renvoie { success: true, message: "..." }
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