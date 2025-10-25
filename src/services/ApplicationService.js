// src/services/ApplicationService.js
import AuthService from './AuthService';

const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction
  ? "https://backend-smart-hire.onrender.com"
  : "http://localhost:8080";

const APPLICATIONS_API_URL = `${API_BASE_URL}/api/applications`;

console.log(`ApplicationService API URL set to: ${APPLICATIONS_API_URL}`);

// Fonction pour gérer les réponses JSON
const handleApiResponse = async (response) => {
    if (response.status === 204) {
        return { success: true, message: "Opération réussie (pas de contenu)" };
    }

    let apiResponse;
    try {
        apiResponse = await response.json();
    } catch (e) {
        throw new Error(`Erreur ${response.status}: Réponse inattendue du serveur (${response.statusText})`);
    }

    if (response.ok && apiResponse.success) {
        return apiResponse;
    } else {
        throw new Error(apiResponse.message || `Erreur ${response.status}: ${response.statusText}`);
    }
};

// Fonction pour gérer les réponses de type fichier (Blob)
const handleFileResponse = async (response, defaultFilename = 'cv.pdf') => {
    if (response.ok) {
        // Essayer d'extraire le nom de fichier de l'en-tête Content-Disposition
        const disposition = response.headers.get('content-disposition');
        let filename = defaultFilename;
        if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
              filename = matches[1].replace(/['"]/g, '');
            }
        }
        
        // Obtenir le blob (le fichier PDF)
        const blob = await response.blob();
        
        // Créer une URL temporaire pour le blob
        const downloadUrl = window.URL.createObjectURL(blob);
        
        // Créer un lien caché pour déclencher le téléchargement
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', filename); // Utiliser le nom de fichier extrait ou par défaut
        document.body.appendChild(link);
        link.click(); // Simuler le clic pour télécharger
        
        // Nettoyer
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        
        return { success: true, message: "CV téléchargé avec succès." }; // Retourner un succès
    } else {
         // Essayer de lire une erreur JSON si le serveur en renvoie une
         let errorMessage = `Erreur ${response.status}: ${response.statusText}`;
         try {
             const errorResponse = await response.json();
             errorMessage = errorResponse.message || errorMessage;
         } catch(e) { /* Ignorer l'erreur de parsing JSON */ }
        throw new Error(errorMessage);
    }
};


const applyToOffer = async (offerId, formData) => {
    const response = await fetch(`${APPLICATIONS_API_URL}/apply/${offerId}`, {
        method: "POST",
        headers: {
            ...AuthService.authHeader()
        },
        body: formData,
    });
    return handleApiResponse(response);
};

const getMyApplications = async () => {
    const response = await fetch(`${APPLICATIONS_API_URL}/my-applications`, {
        headers: AuthService.authHeader()
    });
    return handleApiResponse(response);
};

// (ÉTAPE 3) Récupérer les candidatures pour une offre (RH)
const getApplicationsForOffer = async (offerId) => {
     const response = await fetch(`${APPLICATIONS_API_URL}/offer/${offerId}`, {
        headers: AuthService.authHeader() // Token RH nécessaire
    });
    return handleApiResponse(response);
};

// (ÉTAPE 3) Télécharger un CV (RH ou Candidat)
const downloadCv = async (applicationId) => {
    const response = await fetch(`${APPLICATIONS_API_URL}/${applicationId}/cv`, {
        headers: AuthService.authHeader() // Token nécessaire
    });
    // Utiliser le gestionnaire de réponse pour les fichiers
    return handleFileResponse(response);
};


const ApplicationService = {
  applyToOffer,
  getMyApplications,
  getApplicationsForOffer, // Maintenant implémentée
  downloadCv               // Maintenant implémentée
};

export default ApplicationService;