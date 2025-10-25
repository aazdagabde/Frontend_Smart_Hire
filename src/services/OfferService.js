// src/services/OfferService.js
import AuthService from './AuthService';

const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction
  ? "https://backend-smart-hire.onrender.com"
  : "http://localhost:8080";
const OFFERS_API_URL = `${API_BASE_URL}/api/offers`;

console.log(`OfferService API URL set to: ${OFFERS_API_URL}`);

// Helper (inchangé)
const handleApiResponse = async (response) => {
  if (response.status === 204) {
    return { success: true, message: "Opération réussie (pas de contenu)" };
  }

  let apiResponse;
  try {
    apiResponse = await response.json();
  } catch (e) {
    // Si la réponse n'est pas un JSON (ex: erreur 503, 500 HTML)
    throw new Error(`Erreur ${response.status}: Réponse inattendue (${response.statusText})`);
  }

  if (response.ok && apiResponse.success) {
    return apiResponse;
  } else {
    // Lancer une erreur avec le message du backend
    throw new Error(apiResponse.message || `Erreur ${response.status}: ${response.statusText}`);
  }
};


// --- Fonctions existantes (inchangées) ---

const getAllPublicOffers = async (searchTerm = '') => {
  const url = searchTerm
    ? `${OFFERS_API_URL}?searchTerm=${encodeURIComponent(searchTerm)}`
    : OFFERS_API_URL;
  
  const response = await fetch(url);
  return handleApiResponse(response);
};

const getMyOffers = async () => {
  const response = await fetch(`${OFFERS_API_URL}/my`, {
    headers: AuthService.authHeader()
  });
  return handleApiResponse(response);
};

const getOfferById = async (id) => {
  const response = await fetch(`${OFFERS_API_URL}/${id}`);
  return handleApiResponse(response);
};

const createOffer = async (offerData) => {
  const response = await fetch(OFFERS_API_URL, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      ...AuthService.authHeader()
    },
    body: JSON.stringify(offerData),
  });
  return handleApiResponse(response);
};

const updateOffer = async (id, offerData) => {
  const response = await fetch(`${OFFERS_API_URL}/${id}`, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json',
      ...AuthService.authHeader()
    },
    body: JSON.stringify(offerData),
  });
  return handleApiResponse(response);
};

const deleteOffer = async (id) => {
  const response = await fetch(`${OFFERS_API_URL}/${id}`, {
    method: "DELETE",
    headers: AuthService.authHeader(),
  });
  return handleApiResponse(response);
};

// --- <<< NOUVELLES FONCTIONS (Étape 4.A) >>> ---

/**
 * Récupère les champs de formulaire personnalisés pour une offre.
 * Public, car le candidat en a besoin pour postuler.
 */
const getCustomFields = async (offerId) => {
    const response = await fetch(`${OFFERS_API_URL}/${offerId}/custom-fields`);
    return handleApiResponse(response);
};

/**
 * Crée un nouveau champ de formulaire personnalisé pour une offre.
 * Nécessite une authentification RH.
 */
const createCustomField = async (offerId, fieldData) => {
    // fieldData = { label, fieldType, options, isRequired }
    const response = await fetch(`${OFFERS_API_URL}/${offerId}/custom-fields`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            ...AuthService.authHeader()
        },
        body: JSON.stringify(fieldData),
    });
    return handleApiResponse(response);
};

/**
 * Supprime un champ de formulaire personnalisé.
 * Nécessite une authentification RH.
 */
const deleteCustomField = async (offerId, fieldId) => {
    const response = await fetch(`${OFFERS_API_URL}/${offerId}/custom-fields/${fieldId}`, {
        method: "DELETE",
        headers: AuthService.authHeader(),
    });
    return handleApiResponse(response);
};
// --- <<< FIN DES NOUVELLES FONCTIONS >>> ---


const OfferService = {
  getAllPublicOffers,
  getMyOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  // --- <<< EXPORTER LES NOUVELLES FONCTIONS >>> ---
  getCustomFields,
  createCustomField,
  deleteCustomField
};

export default OfferService;