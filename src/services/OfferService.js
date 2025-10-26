// src/services/OfferService.js
import AuthService from './AuthService';

const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction
  ? "https://backend-smart-hire.onrender.com" // Assure-toi que c'est la bonne URL de ton backend déployé
  : "http://localhost:8080"; // Ou ton port local si différent
const OFFERS_API_URL = `${API_BASE_URL}/api/offers`;

console.log(`OfferService API URL set to: ${OFFERS_API_URL}`);

// Helper pour gérer les réponses API (robuste)
const handleApiResponse = async (response) => {
  // Gère le cas No Content (ex: DELETE réussi)
  if (response.status === 204) {
    return { success: true, message: "Opération réussie (pas de contenu)" };
  }

  let apiResponse;
  try {
    // Essayer de parser la réponse JSON
    apiResponse = await response.json();
  } catch (e) {
    // Si pas JSON (erreur serveur HTML, etc.)
    console.error("Failed to parse API response as JSON:", response.status, response.statusText);
    throw new Error(`Erreur ${response.status}: Réponse inattendue du serveur (${response.statusText})`);
  }

  // Si la réponse est OK (2xx) ET contient success: true
  if (response.ok && apiResponse.success) {
    return apiResponse; // Contient { success, data?, message? }
  } else {
    // Si réponse pas OK ou success: false, lancer une erreur avec le message backend
    console.error("API Error Response:", apiResponse);
    throw new Error(apiResponse.message || `Erreur ${response.status} (${response.statusText})`);
  }
};


// --- Fonctions API ---

// Récupère les offres PUBLIÉES (pour la liste publique)
const getAllPublicOffers = async (searchTerm = '') => {
  const url = searchTerm
    ? `${OFFERS_API_URL}?searchTerm=${encodeURIComponent(searchTerm)}`
    : OFFERS_API_URL;
  const response = await fetch(url); // Pas besoin d'auth ici
  return handleApiResponse(response);
};

// Récupère les offres du RH connecté (pour le tableau de bord RH)
const getMyOffers = async () => {
  const response = await fetch(`${OFFERS_API_URL}/my`, {
    headers: AuthService.authHeader() // Sécurisé
  });
  return handleApiResponse(response);
};

// Récupère UNE offre PUBLIÉE (pour la vue détail publique)
const getOfferById = async (id) => {
  console.log(`Calling public getOfferById for ID: ${id}`);
  const response = await fetch(`${OFFERS_API_URL}/${id}`); // Pas besoin d'auth
  return handleApiResponse(response);
};

// **NOUVELLE FONCTION** Récupère les détails d'une offre pour l'édition RH (quel que soit le statut)
const getOfferDetailsForEdit = async (id) => {
    console.log(`Calling SECURE getOfferDetailsForEdit for ID: ${id}`);
    const response = await fetch(`${OFFERS_API_URL}/details/${id}`, { // Appelle le nouvel endpoint sécurisé
        headers: AuthService.authHeader() // Requête sécurisée
    });
    console.log(`Response status for getOfferDetailsForEdit(${id}): ${response.status}`);
    return handleApiResponse(response); // La réponse inclura { success, data, message }
};

// Crée une nouvelle offre
const createOffer = async (offerData) => {
  const response = await fetch(OFFERS_API_URL, {
    method: "POST",
    headers: { 'Content-Type': 'application/json', ...AuthService.authHeader() },
    body: JSON.stringify(offerData),
  });
  return handleApiResponse(response); // Retourne { success, data (avec ID), message }
};

// Met à jour une offre existante
const updateOffer = async (id, offerData) => {
  const response = await fetch(`${OFFERS_API_URL}/${id}`, {
    method: "PUT",
    headers: { 'Content-Type': 'application/json', ...AuthService.authHeader() },
    body: JSON.stringify(offerData),
  });
  return handleApiResponse(response);
};

// Supprime une offre
const deleteOffer = async (id) => {
  const response = await fetch(`${OFFERS_API_URL}/${id}`, {
    method: "DELETE",
    headers: AuthService.authHeader(),
  });
  // Gère 204 No Content ou réponse JSON standard
  if (response.status === 204) return { success: true, message: "Offre supprimée" };
  return handleApiResponse(response);
};

// Récupère les champs personnalisés d'une offre
const getCustomFields = async (offerId) => {
    // Pas besoin d'auth ici, le candidat doit les voir aussi
    const response = await fetch(`${OFFERS_API_URL}/${offerId}/custom-fields`);
    return handleApiResponse(response); // Retourne { success, data (liste), message }
};

// Crée un champ personnalisé pour une offre
const createCustomField = async (offerId, fieldData) => {
    console.log(`Calling createCustomField for offerId: ${offerId}`, fieldData);
    const response = await fetch(`${OFFERS_API_URL}/${offerId}/custom-fields`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json', ...AuthService.authHeader() },
        body: JSON.stringify(fieldData),
    });
    console.log(`Response status for createCustomField(${offerId}): ${response.status}`);
    return handleApiResponse(response);
};

// Supprime un champ personnalisé
const deleteCustomField = async (offerId, fieldId) => {
    console.log(`Calling deleteCustomField for offerId: ${offerId}, fieldId: ${fieldId}`);
    const response = await fetch(`${OFFERS_API_URL}/${offerId}/custom-fields/${fieldId}`, {
        method: "DELETE",
        headers: AuthService.authHeader(),
    });
     console.log(`Response status for deleteCustomField(${offerId}, ${fieldId}): ${response.status}`);
     // Gère 204 No Content ou réponse JSON standard
    if (response.status === 204) return { success: true, message: "Champ supprimé" };
    return handleApiResponse(response);
};


// Exporter toutes les fonctions
const OfferService = {
  getAllPublicOffers,
  getMyOffers,
  getOfferById,
  getOfferDetailsForEdit, // Exporter la nouvelle fonction
  createOffer,
  updateOffer,
  deleteOffer,
  getCustomFields,
  createCustomField,
  deleteCustomField
};

export default OfferService;