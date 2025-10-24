// src/pages/OfferListPage.js
import React, { useState, useEffect } from 'react';
import OfferService from '../services/OfferService';
import { Link } from 'react-router-dom';

function OfferListPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // La recherche n'est pas encore implémentée côté backend pour les offres publiques
  // const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async (/* term = '' */) => {
    setLoading(true);
    setError('');
    try {
      const apiResponse = await OfferService.getAllOffers(/* term */); // Appelle GET /api/offers
      if (apiResponse && apiResponse.data && Array.isArray(apiResponse.data)) {
        setOffers(apiResponse.data);
      } else {
        console.warn("Received non-array data for offers:", apiResponse?.data);
        setOffers([]);
      }
    } catch (err) {
      console.error("Error fetching offers:", err); // Log l'erreur complète
      setError(err.message || 'Erreur lors du chargement des offres.');
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  /*
  // Garder pour plus tard quand la recherche sera prête
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchOffers(searchTerm);
  };
  */

  return (
    <div style={{ width: '100%' }}>
      <h2 className="form-title">Offres Disponibles</h2>

      {/* Barre de recherche (commentée pour l'instant) */}
      {/*
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '2rem', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Rechercher par mot-clé..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ flexGrow: 1 }}
        />
        <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
          Rechercher
        </button>
      </form>
      */}

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
              Aucune offre n'est actuellement disponible.
            </p>
          ) : (
            offers.map(offer => (
              <div key={offer.id} className="form-card" style={{ padding: '1.5rem', maxWidth: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div> {/* Conteneur pour le contenu textuel */}
                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)', fontSize: '1.2rem' }}>{offer.title}</h3>
                    <p style={{ color: 'var(--gray-color)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        {/* Utiliser les noms d'Enum directement s'ils sont lisibles, sinon mapper */}
                        📍 {offer.location || 'Non spécifié'} - 📄 {offer.contractType}
                    </p>
                    {/* Limiter la description */}
                    <p style={{ marginBottom: '1rem', fontSize: '0.95rem', lineHeight: '1.5', maxHeight: '90px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                        {offer.description ? (offer.description.length > 150 ? offer.description.substring(0, 150) + '...' : offer.description) : "Pas de description."}
                    </p>
                </div>
                 {/* Bouton Voir Détails */}
                <Link to={`/offers/${offer.id}`} className="btn btn-primary" style={{ width: 'auto', fontSize: '0.9rem', padding: '0.5rem 1rem', marginTop: 'auto' /* Pousse le bouton en bas */ }}>
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