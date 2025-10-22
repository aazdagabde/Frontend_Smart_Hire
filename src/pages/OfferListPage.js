// src/pages/OfferListPage.js
import React, { useState, useEffect } from 'react';
import OfferService from '../services/OfferService';
import { Link } from 'react-router-dom';
// Optionnel: Créez un composant OfferCard réutilisable dans src/components/
// import OfferCard from '../components/OfferCard';

function OfferListPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOffers();
  }, []); // Charger au montage initial

  const fetchOffers = async (term = '') => {
    setLoading(true);
    setError('');
    try {
      const data = await OfferService.getAllOffers(term);
      setOffers(data || []); // Assurer que c'est un tableau même si data est null/undefined
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des offres.');
      setOffers([]); // Vider les offres en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchOffers(searchTerm);
  };

  return (
    <div style={{ width: '100%' }}> {/* Assurer que le conteneur prend la largeur */}
      <h2 className="form-title">Offres Disponibles</h2>

      {/* Barre de recherche */}
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '2rem', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Rechercher par mot-clé (titre, description)..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ flexGrow: 1 }}
        />
        <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
          Rechercher
        </button>
      </form>

      {loading && <div style={{ textAlign: 'center' }}><span className="loading"></span> Chargement des offres...</div>}
      {error && <div className="message message-error">{error}</div>}

      {!loading && !error && (
        <div className="offer-list" style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {offers.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>Aucune offre trouvée.</p>
          ) : (
            offers.map(offer => (
              // Utiliser OfferCard si créé, sinon affichage simple
              <div key={offer.id} className="form-card" style={{ padding: '1.5rem', maxWidth: 'none' }}>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>{offer.title}</h3>
                <p style={{ color: 'var(--gray-color)', marginBottom: '0.5rem' }}>{offer.location || 'Non spécifié'} - {offer.contractType}</p>
                {/* Limiter la description */}
                <p style={{ marginBottom: '1rem', maxHeight: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {offer.description.length > 150 ? offer.description.substring(0, 150) + '...' : offer.description}
                </p>
                <Link to={`/offers/${offer.id}`} className="btn btn-primary" style={{ width: 'auto', fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
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