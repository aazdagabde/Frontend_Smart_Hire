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
        const text = await response.text();
        apiResponse = text ? JSON.parse(text) : {};
    } catch (e) {
        throw new Error(`Erreur ${response.status}: Réponse inattendue du serveur (${response.statusText})`);
    }

    if (response.ok) {
        return apiResponse.success !== undefined ? apiResponse : { success: true, data: apiResponse };
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
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
    }
    
    const disposition = response.headers.get('content-disposition');
    let filename = 'document.pdf';
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

const getApplicationsForOffer = async (offerId) => {
     const response = await fetch(`${APPLICATIONS_API_URL}/offer/${offerId}`, {
        headers: AuthService.authHeader()
    });
    return handleApiResponse(response);
};

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


// --- AMÉLIORATIONS & PILOTAGE ---

const downloadCv = async (applicationId) => {
    const response = await fetch(`${APPLICATIONS_API_URL}/${applicationId}/cv`, {
        headers: AuthService.authHeader()
    });

    const { blob } = await handleFileResponse(response);
    const fileURL = URL.createObjectURL(blob);
    window.open(fileURL, '_blank');
    return { success: true };
};

const updateInternalNotes = async (applicationId, notes) => {
    const response = await fetch(`${APPLICATIONS_API_URL}/${applicationId}/notes`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            ...AuthService.authHeader()
        },
        body: JSON.stringify({ notes }),
    });
    return handleApiResponse(response);
};

// 1. Analyse IA
const analyzeAllCvs = async (offerId) => {
    const response = await fetch(`${APPLICATIONS_API_URL}/${offerId}/analyze-cvs`, {
        method: "POST",
        headers: AuthService.authHeader()
    });
    return handleApiResponse(response);
};

// 2. Sélection de masse (CORRIGÉ : URL sans /offer/)
const bulkSelectCandidates = async (offerId, bulkData) => {
    // L'URL backend est : @PostMapping("/{id}/bulk-select") -> /api/applications/{id}/bulk-select
    // Suppression de "/offer/" ici pour correspondre
    const response = await fetch(`${APPLICATIONS_API_URL}/${offerId}/bulk-select`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            ...AuthService.authHeader()
        },
        body: JSON.stringify(bulkData)
    });
    return handleApiResponse(response);
};

// 3. Top N (Méthode simple) - L'URL backend est bien /offer/...
const selectTopCandidates = async (offerId, number = 3) => {
    const response = await fetch(`${APPLICATIONS_API_URL}/offer/${offerId}/select-top?n=${number}`, {
        method: "POST",
        headers: {
            ...AuthService.authHeader()
        }
    });
    return handleApiResponse(response);
};

// Générer résumé IA
const generateAiSummary = async (applicationId) => {
    const response = await fetch(`${APPLICATIONS_API_URL}/${applicationId}/ai-summary`, {
        method: "POST",
        headers: AuthService.authHeader()
    });
    return handleApiResponse(response);
};

// Générer questions IA
const generateAiQuestions = async (applicationId) => {
    const response = await fetch(`${APPLICATIONS_API_URL}/${applicationId}/ai-questions`, {
        method: "POST",
        headers: AuthService.authHeader()
    });
    return handleApiResponse(response);
};


const ApplicationService = {
  applyToOffer,
  getMyApplications,
  getApplicationsForOffer,
  downloadCv,
  updateCv,
  getApplicationCustomData,
  updateApplicationStatus,
  updateCvScore,
  updateInternalNotes,
  analyzeAllCvs,
  bulkSelectCandidates,
  selectTopCandidates,
  generateAiSummary,
  generateAiQuestions
};

export default ApplicationService;