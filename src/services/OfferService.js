// src/services/OfferService.js
import AuthService from './AuthService'; // Pour utiliser authHeader

const API_URL = "http://localhost:8080/api/offers"; // URL de base (sans / final)

// Fonction générique pour gérer les réponses fetch (style AuthService)
const handleApiResponse = async (response) => {
    // Essayer de parser le JSON dans tous les cas pour obtenir les messages d'erreur
    const apiResponse = await response.json();

    if (response.ok && apiResponse.success) {
        // Retourne la partie 'data' de la réponse en cas de succès
        return apiResponse; // Retourne l'objet complet { success, data, message, status }
                            // Le composant appelant utilisera apiResponse.data
    } else {
        // Lance une erreur avec le message fourni par le backend
        throw new Error(apiResponse.message || `Erreur ${response.status}: ${response.statusText}`);
    }
};

// Récupérer toutes les offres PUBLIÉES - Public
const getAllOffers = async (/* searchTerm = '' */) => { // Search non implémenté au backend encore
    // const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''; // Pour plus tard
    const response = await fetch(API_URL /* + query */); // Pas besoin de header Auth ici
    return handleApiResponse(response); // Attend { success: true, data: [...] }
};

// Récupérer une offre par ID (doit être PUBLISHED) - Public
const getOfferById = async (id) => {
    const response = await fetch(`${API_URL}/${id}`); // Pas besoin de header Auth ici
    return handleApiResponse(response); // Attend { success: true, data: {...} }
};

// Récupérer les offres créées par le RH connecté - Protégé
const getMyOffers = async () => {
    // !! IMPORTANT !!: Ceci nécessite un endpoint backend /api/offers/my
    const response = await fetch(`${API_URL}/my`, { // <-- Notez le /my
        headers: AuthService.authHeader() // Ajoute le token JWT
    });
    return handleApiResponse(response); // Attend { success: true, data: [...] }
};

// Créer une nouvelle offre - Protégé
const createOffer = async (offerData) => {
    // offerData doit correspondre à JobOfferRequest DTO (title, description, etc.)
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...AuthService.authHeader()
        },
        body: JSON.stringify(offerData),
    });
    return handleApiResponse(response); // Attend { success: true, data: {...}, message: "..." }
};

// Mettre à jour une offre - Protégé
const updateOffer = async (id, offerData) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...AuthService.authHeader()
        },
        body: JSON.stringify(offerData),
    });
    return handleApiResponse(response); // Attend { success: true, data: {...}, message: "..." }
};

// Supprimer une offre - Protégé
const deleteOffer = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: AuthService.authHeader()
    });
    // Pour DELETE, le backend renvoie juste un message succès, pas de 'data'
     const apiResponse = await response.json();
     if (response.ok && apiResponse.success) {
         return apiResponse; // Retourne { success: true, message: "..." }
     } else {
         throw new Error(apiResponse.message || `Erreur ${response.status}: ${response.statusText}`);
     }
};


const OfferService = {
  getAllOffers,
  getOfferById,
  getMyOffers, // Requires backend implementation
  createOffer,
  updateOffer,
  deleteOffer
};

export default OfferService;