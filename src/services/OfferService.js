// src/services/OfferService.js
import AuthService from './AuthService'; // Pour utiliser authHeader

const API_URL = "http://localhost:8080/api/offers/"; // URL de base pour les offres

// Fonction générique pour gérer les réponses fetch
const handleResponse = async (response) => {
    if (response.ok) {
        // Gérer le cas No Content (204) pour DELETE
        if (response.status === 204) {
            return null; // Ou true si vous préférez
        }
        // Essayer de parser en JSON, sinon retourner le texte brut
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
             return response.json();
        } else {
             return response.text();
        }
    } else {
        // Essayer de lire le message d'erreur
        let errorMsg = `Erreur ${response.status}: ${response.statusText}`;
        try {
            const errorData = await response.text();
            if(errorData) errorMsg = errorData;
        } catch(e) { /* Ignorer */ }
        throw new Error(errorMsg);
    }
};

// Récupérer toutes les offres (ou rechercher) - Public
const getAllOffers = async (searchTerm = '') => {
    const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
    const response = await fetch(API_URL + query);
    return handleResponse(response);
};

// Récupérer une offre par ID - Public
const getOfferById = async (id) => {
    const response = await fetch(API_URL + id);
    return handleResponse(response);
};

// Récupérer les offres créées par le RH connecté - Protégé
const getMyOffers = async () => {
    const response = await fetch(API_URL + "my", {
        headers: AuthService.authHeader() // Ajoute le token JWT
    });
    return handleResponse(response);
};

// Créer une nouvelle offre - Protégé
const createOffer = async (offerData) => {
    // offerData doit correspondre à OfferRequest DTO (title, description, etc.)
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...AuthService.authHeader() // Ajoute le token JWT
        },
        body: JSON.stringify(offerData),
    });
    return handleResponse(response);
};

// Mettre à jour une offre - Protégé
const updateOffer = async (id, offerData) => {
    // offerData doit correspondre à OfferRequest DTO
    const response = await fetch(API_URL + id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...AuthService.authHeader() // Ajoute le token JWT
        },
        body: JSON.stringify(offerData),
    });
    return handleResponse(response);
};

// Supprimer une offre - Protégé
const deleteOffer = async (id) => {
    const response = await fetch(API_URL + id, {
        method: "DELETE",
        headers: AuthService.authHeader() // Ajoute le token JWT
    });
    // handleResponse gère le cas 204 No Content
    return handleResponse(response);
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