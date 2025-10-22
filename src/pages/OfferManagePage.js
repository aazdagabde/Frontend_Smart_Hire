// src/pages/OfferManagePage.js
import React, { useState, useEffect } from 'react';
import OfferService from '../services/OfferService';
import { Link } from 'react-router-dom';
// Importer un composant Modal ou utiliser une simple alerte pour la confirmation de suppression

function OfferManagePage() {
  const [myOffers, setMyOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyOffers();
  }, []);

  const fetchMyOffers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await OfferService.getMyOffers();
      setMyOffers(data || []);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement de vos offres.');
       if (err.message.includes('401') || err.message.includes('403')) {
           setError("Vous n'êtes pas autorisé à voir cette page ou votre session a expiré.");
       }
      setMyOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // !! Ajouter une confirmation avant de supprimer !!
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      try {
        await OfferService.deleteOffer(id);
        // Rafraîchir la liste après suppression
        fetchMyOffers();
      } catch (err) {
        setError(`Erreur lors de la suppression: ${err.message}`);
      }
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="form-title" style={{ marginBottom: 0 }}>Mes Offres Publiées</h2>
        <Link to="/offers/create" className="btn btn-primary" style={{ width: 'auto' }}>
          + Créer une offre
        </Link>
      </div>

      {loading && <div style={{ textAlign: 'center' }}><span className="loading"></span> Chargement...</div>}
      {error && <div className="message message-error">{error}</div>}

      {!loading && !error && (
        <div>
          {myOffers.length === 0 ? (
            <p style={{ textAlign: 'center' }}>Vous n'avez publié aucune offre pour le moment.</p>
          ) : (
            myOffers.map(offer => (
              <div key={offer.id} className="form-card" style={{ padding: '1.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ marginBottom: '0.25rem' }}>{offer.title}</h3>
                  <p style={{ color: 'var(--gray-color)', fontSize: '0.9rem' }}>
                    {offer.location || 'N/A'} - {offer.contractType} - Créée le {new Date(offer.createdAt).toLocaleDateString()}
                    {/* Ajouter le nombre de candidatures (Sprint 2) */}
                    {/* - {offer.applicationCount || 0} candidature(s) */}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   {/* Lien vers la page de visualisation des candidats (Sprint 2) */}
                   {/* <Link to={`/offers/${offer.id}/applications`} className="btn" style={{ background: 'var(--gray-color)', color: 'white', padding: '0.4rem 0.8rem', fontSize:'0.8rem' }}>Candidats</Link> */}
                  <Link to={`/offers/edit/${offer.id}`} className="btn" style={{ background: 'var(--warning-color)', color: 'white', padding: '0.4rem 0.8rem', fontSize:'0.8rem' }}>
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="btn" style={{ background: 'var(--danger-color)', color: 'white', padding: '0.4rem 0.8rem', fontSize:'0.8rem' }}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default OfferManagePage;