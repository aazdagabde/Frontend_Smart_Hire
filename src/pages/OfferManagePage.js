// src/pages/OfferManagePage.js
import React, { useState, useEffect } from 'react';
import OfferService from '../services/OfferService';
import { Link } from 'react-router-dom';

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
      const apiResponse = await OfferService.getMyOffers();

      if (apiResponse && apiResponse.data && Array.isArray(apiResponse.data)) {
        setMyOffers(apiResponse.data);
      } else {
        console.warn("Received non-array data for myOffers:", apiResponse.data);
        setMyOffers([]);
      }

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
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      try {
        await OfferService.deleteOffer(id);
        fetchMyOffers(); // Rafraîchir
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
              <div key={offer.id} className="form-card" style={{ padding: '1.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' /* Pour responsivité */ }}>
                
                {/* Infos Offre */}
                <div style={{ flexGrow: 1, marginRight: '1rem' /* Espace avant boutons */ }}>
                  <h3 style={{ marginBottom: '0.25rem' }}>{offer.title}</h3>
                  <p style={{ color: 'var(--slate)', fontSize: '0.9rem' }}>
                    {offer.location || 'N/A'} - {offer.contractType} - Créée le {new Date(offer.createdAt).toLocaleDateString()}
                    {/* Statut ajouté pour info */}
                    <span style={{ marginLeft: '10px', padding: '2px 6px', borderRadius: '4px', background: offer.status === 'PUBLISHED' ? '#e8f5e9' : '#f0f0f0', color: offer.status === 'PUBLISHED' ? '#28a745' : '#555', fontSize: '0.8rem' }}>
                      {offer.status}
                    </span>
                  </p>
                </div>

                {/* Boutons d'Action */}
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 /* Empêche les boutons de rétrécir */, marginTop: '0.5rem' /* Espace sur petits écrans */ }}>
                   {/* AJOUT: Lien vers la page des candidats */}
                   <Link 
                     to={`/offers/${offer.id}/applicants`} 
                     className="btn" 
                     style={{ background: 'var(--light-slate)', color: 'var(--dark-navy)', padding: '0.4rem 0.8rem', fontSize:'0.8rem' }}
                   >
                     Voir Candidats
                   </Link>
                   
                  <Link 
                    to={`/offers/edit/${offer.id}`} 
                    className="btn" 
                    style={{ background: 'var(--warning)', color: 'white', padding: '0.4rem 0.8rem', fontSize:'0.8rem' }}
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="btn" 
                    style={{ background: 'var(--danger)', color: 'white', padding: '0.4rem 0.8rem', fontSize:'0.8rem' }}
                  >
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