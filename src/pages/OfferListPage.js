// src/pages/OfferListPage.js
import React, { useState, useEffect } from 'react';
import OfferService from '../services/OfferService';
import { Link } from 'react-router-dom';

function OfferListPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // État pour le terme de recherche
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les offres initialement sans terme de recherche
  useEffect(() => {
    fetchOffers(); // Appelle fetchOffers sans argument la première fois
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Le tableau vide assure que cela ne s'exécute qu'au montage

  // Fonction pour récupérer les offres, avec ou sans terme
  const fetchOffers = async (term = '') => {
    setLoading(true);
    setError('');
    try {
      // Passer le terme au service
      const apiResponse = await OfferService.getAllOffers(term);
      // Vérifie si la réponse et les données existent et si data est un tableau
      if (apiResponse && apiResponse.data && Array.isArray(apiResponse.data)) {
        setOffers(apiResponse.data);
      } else {
        // Si les données ne sont pas un tableau (même si la réponse est ok), log et met un tableau vide
        console.warn("Received non-array data for offers:", apiResponse?.data);
        setOffers([]);
      }
    } catch (err) {
      console.error("Error fetching offers:", err); // Log l'erreur complète
      setError(err.message || 'Erreur lors du chargement des offres.');
      setOffers([]); // Assure que offers est un tableau vide en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  // Gérer le changement dans l'input de recherche
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Gérer la soumission du formulaire de recherche
  const handleSearchSubmit = (event) => {
    event.preventDefault(); // Empêche le rechargement de la page
    fetchOffers(searchTerm); // Relancer la recherche avec le terme actuel
  };


  return (
    <div style={{ width: '100%' }}>
      <h2 className="form-title">Offres Disponibles</h2>

      {/* Barre de recherche (maintenant active) */}
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '2rem', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Rechercher par mot-clé (titre, description, lieu)..." // Placeholder mis à jour
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ flexGrow: 1 }}
        />
        <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
          Rechercher
        </button>
      </form>


      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary-color)' }}>
            <span className="loading" style={{ borderTopColor: 'var(--primary-color)' }}></span> Chargement des offres...
        </div>
      )}
      {error && <div className="message message-error">{error}</div>}

      {!loading && !error && (
        <div className="offer-list" style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {offers.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--gray-color)' }}>
              {/* Message adapté si une recherche a été effectuée */}
              {searchTerm ? `Aucune offre ne correspond à "${searchTerm}".` : "Aucune offre n'est actuellement disponible."}
            </p>
          ) : (
            offers.map(offer => (
              // Carte individuelle pour chaque offre
              <div key={offer.id} className="form-card" style={{ padding: '1.5rem', maxWidth: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s ease-in-out', ':hover': { transform: 'translateY(-5px)' } }}>
                <div> {/* Conteneur pour le contenu textuel */}
                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)', fontSize: '1.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {offer.title}
                    </h3>
                    <p style={{ color: 'var(--gray-color)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        📍 {offer.location || 'Non spécifié'} - 📄 {offer.contractType}
                    </p>
                    {/* Description avec limitation de hauteur et '...' */}
                    <p style={{ marginBottom: '1rem', fontSize: '0.95rem', lineHeight: '1.5', height: '6em' /* Environ 4 lignes */, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
                        {offer.description ? offer.description : "Pas de description."}
                    </p>
                     {/* Afficher la date de création */}
                     <p style={{ fontSize: '0.8rem', color: '#adb5bd', marginTop: 'auto', paddingTop: '0.5rem' }}>
                        Publié le {new Date(offer.createdAt).toLocaleDateString()}
                    </p>
                </div>
                 {/* Bouton Voir Détails */}
                <Link to={`/offers/${offer.id}`} className="btn btn-primary" style={{ width: '100%', fontSize: '0.9rem', padding: '0.6rem 1rem', marginTop: '1rem' /* Espace avant le bouton */ }}>
                  Voir Détails
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default OfferListPage;