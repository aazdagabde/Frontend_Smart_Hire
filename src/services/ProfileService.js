// CORRECTION : Remplacer 'axios' par l'instance 'authApi' de votre projet
import { authApi } from './api';

// L'URL de base est déjà configurée dans 'authApi', on met juste le segment
const API_URL = '/profile';

/**
 * Uploade l'image de profil pour l'utilisateur authentifié.
 * @param {File} pictureFile - Le fichier image sélectionné.
 * @returns {Promise<Object>} La réponse du serveur.
 */
export const uploadProfilePicture = async (pictureFile) => {
    
    const formData = new FormData();
    formData.append('picture', pictureFile); 

    try {
        // CORRECTION : Utiliser authApi.put
        // Le token est géré automatiquement par l'intercepteur de authApi
        const response = await authApi.put(
            `${API_URL}/picture`, 
            formData, 
            {
                headers: {
                    // Il est crucial de redéfinir le Content-Type pour le FormData
                    'Content-Type': 'multipart/form-data' 
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Erreur lors de l'upload de l'image de profil:", error.response || error);
        throw error.response ? error.response.data : new Error("Erreur réseau ou serveur");
    }
};