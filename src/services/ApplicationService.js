// Fichier : src/services/ApplicationService.js

import AuthService from './AuthService';

const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction
  ? "https://backend-smart-hire.onrender.com"
  : "http://localhost:8080";

const APPLICATIONS_API_URL = `${API_BASE_URL}/api/applications`;

/**
 * Gère la réponse JSON standard de l'API.
 */
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

/**
 * Gère une réponse de fichier (blob) de l'API.
 */
const handleFileResponse = async (response) => {
    if (!response.ok) {
        let apiResponse;
        try {
            apiResponse = await response.json();
            throw new Error(apiResponse.message || `Erreur ${response.status}: ${response.statusText}`);
        } catch (e) {
            // Si la réponse d'erreur n'est pas JSON, lancez une erreur générique
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
    }
    
    // Obtenir le nom du fichier depuis l'en-tête, s'il existe
    const disposition = response.headers.get('content-disposition');
    let filename = 'document.pdf'; // Nom par défaut
    if (disposition && disposition.indexOf('filename') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
        }
    }

    const blob = await response.blob();
    return { blob, filename };
};


// --- Fonctions existantes ---

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

// Récupérer les candidatures pour une offre (RH)
const getApplicationsForOffer = async (offerId) => {
     const response = await fetch(`${APPLICATIONS_API_URL}/offer/${offerId}`, {
        headers: AuthService.authHeader() // Token RH nécessaire
    });
    return handleApiResponse(response);
};

// Mettre à jour le CV
const updateCv = async (applicationId, formData) => {
    const response = await fetch(`${APPLICATIONS_API_URL}/${applicationId}/cv`, {
        method: "PUT",
        headers: {
            ...AuthService.authHeader()
        },
        body: formData,
    });
    return handleApiResponse(response);
};

const getApplicationCustomData = async (applicationId) => {
    const response = await fetch(`${APPLICATIONS_API_URL}/${applicationId}/custom-data`, {
        headers: AuthService.authHeader()
    });
    return handleApiResponse(response);
};

const updateApplicationStatus = async (applicationId, status, message = null) => {
    const response = await fetch(`${APPLICATIONS_API_URL}/${applicationId}/status`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            ...AuthService.authHeader()
        },
        body: JSON.stringify({ status, message }),
    });
    return handleApiResponse(response);
};

const updateCvScore = async (applicationId, score) => {
    const response = await fetch(`${APPLICATIONS_API_URL}/${applicationId}/score`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            ...AuthService.authHeader()
        },
        body: JSON.stringify({ score }),
    });
    return handleApiResponse(response);
};


// --- FONCTIONS MODIFIÉES / NOUVELLES ---

/**
 * MODIFIÉ (Amélioration 2) : Récupère le CV et l'ouvre dans un nouvel onglet.
 */
const downloadCv = async (applicationId) => {
    const response = await fetch(`${APPLICATIONS_API_URL}/${applicationId}/cv`, {
        headers: AuthService.authHeader()
    });

    // Utiliser handleFileResponse pour gérer les erreurs et le blob
    const { blob } = await handleFileResponse(response);
    
    // Créer une URL objet pour ce Blob (qui est de type application/pdf)
    const fileURL = URL.createObjectURL(blob);
    
    // Ouvrir cette URL dans un nouvel onglet
    window.open(fileURL, '_blank');
    
    // Le navigateur gérera la révocation de l'URL objet lorsque l'onglet sera fermé.
    return { success: true };
};


/**
 * NOUVEAU (Amélioration 3) : Mettre à jour les notes internes du RH.
 */
const updateInternalNotes = async (applicationId, notes) => {
    const response = await fetch(`${APPLICATIONS_API_URL}/${applicationId}/notes`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            ...AuthService.authHeader()
        },
        body: JSON.stringify({ notes }), // Envoyer les notes
    });
    return handleApiResponse(response); // Renvoie { success, data, message }
};


/**
 * Sélectionne automatiquement les N meilleurs candidats pour une offre.
 */
const selectTopCandidates = async (offerId, number = 3) => {
    // Notez bien l'URL : /api/applications/offer/{id}/select-top
    const response = await fetch(`${APPLICATIONS_API_URL}/offer/${offerId}/select-top?n=${number}`, {
        method: "POST",
        headers: {
            ...AuthService.authHeader() // Important pour le token JWT
        }
    });
    return handleApiResponse(response);
};


// --- Exports ---

const ApplicationService = {
  applyToOffer,
  getMyApplications,
  getApplicationsForOffer,
  downloadCv, // Modifié
  updateCv,
  getApplicationCustomData,
  updateApplicationStatus,
  updateCvScore,
  updateInternalNotes, // Nouveau
  selectTopCandidates
};

export default ApplicationService;