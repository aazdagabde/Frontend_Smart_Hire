// src/services/OfferService.js
import AuthService from './AuthService';

// Determine the API URL based on the environment
const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction
  ? "https://backend-smart-hire.onrender.com" // Your Render backend URL
  : "http://localhost:8080";                  // Your local backend URL

const OFFERS_API_URL = `${API_BASE_URL}/api/offers`; // Define the base URL for offers

console.log(`OfferService API URL set to: ${OFFERS_API_URL}`); // For debugging

// Fonction générique pour gérer les réponses fetch (style AuthService)
const handleApiResponse = async (response) => {
    // Essayer de parser le JSON dans tous les cas pour obtenir les messages d'erreur
    // Gérer le cas No Content (204) pour DELETE avant de parser en JSON
    if (response.status === 204) {
        // Simuler une réponse succès pour DELETE car il n'y a pas de body
        return { success: true, message: "Suppression réussie (pas de contenu)" };
    }

    // Tenter de parser la réponse en JSON
    let apiResponse;
    try {
        apiResponse = await response.json();
    } catch (e) {
        // Si le parsing échoue (ex: réponse non JSON inattendue)
        throw new Error(`Erreur ${response.status}: Réponse inattendue du serveur (${response.statusText})`);
    }


    if (response.ok && apiResponse.success) {
        // Retourne la partie 'data' de la réponse en cas de succès
        return apiResponse; // Retourne l'objet complet { success, data, message, status }
                            // Le composant appelant utilisera apiResponse.data
    } else {
        // Lance une erreur avec le message fourni par le backend ou un message par défaut
        throw new Error(apiResponse.message || `Erreur ${response.status}: ${response.statusText}`);
    }
};

// Récupérer toutes les offres PUBLIÉES - Public
// Modifier pour accepter searchTerm
const getAllOffers = async (searchTerm = '') => {
    let query = '';
    // Vérifier si searchTerm n'est pas null, undefined et n'est pas une chaîne vide après trim
    if (searchTerm && searchTerm.trim() !== '') {
        // Ajouter le paramètre 'searchTerm' à l'URL si fourni
        query = `?searchTerm=${encodeURIComponent(searchTerm.trim())}`;
    }
    const response = await fetch(`${OFFERS_API_URL}${query}`); // Ajouter la query string si elle existe
    return handleApiResponse(response);
};

// Récupérer une offre par ID (doit être PUBLISHED) - Public
const getOfferById = async (id) => {
    const response = await fetch(`${OFFERS_API_URL}/${id}`);
    return handleApiResponse(response);
};

// Récupérer les offres créées par le RH connecté - Protégé
const getMyOffers = async () => {
    const response = await fetch(`${OFFERS_API_URL}/my`, {
        headers: AuthService.authHeader() // Utilise le token JWT
    });
    return handleApiResponse(response);
};

// Créer une nouvelle offre - Protégé
const createOffer = async (offerData) => {
    const response = await fetch(OFFERS_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...AuthService.authHeader() // Ajoute le header d'autorisation
        },
        body: JSON.stringify(offerData),
    });
    return handleApiResponse(response);
};

// Mettre à jour une offre - Protégé
const updateOffer = async (id, offerData) => {
    const response = await fetch(`${OFFERS_API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...AuthService.authHeader() // Ajoute le header d'autorisation
        },
        body: JSON.stringify(offerData),
    });
    return handleApiResponse(response);
};

// Supprimer une offre - Protégé
const deleteOffer = async (id) => {
    const response = await fetch(`${OFFERS_API_URL}/${id}`, {
        method: "DELETE",
        headers: AuthService.authHeader() // Ajoute le header d'autorisation
    });
     // handleApiResponse gère le cas 204 No Content aussi
    return handleApiResponse(response);
};


const OfferService = {
  getAllOffers,
  getOfferById,
  getMyOffers,
  createOffer,
  updateOffer,
  deleteOffer
};

export default OfferService;