// src/pages/OfferManagePage.js
import React, { useState, useEffect } from 'react';
import OfferService from '../services/OfferService';
import { Link } from 'react-router-dom';

// Icônes SVG
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

function OfferManagePage() {
  const [myOffers, setMyOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

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
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.")) {
      setDeletingId(id);
      try {
        await OfferService.deleteOffer(id);
        fetchMyOffers();
      } catch (err) {
        setError(`Erreur lors de la suppression: ${err.message}`);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getStatusStyle = (status) => {
    const baseStyle = {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    };
    
    switch (status) {
      case 'PUBLISHED':
        return { 
          ...baseStyle, 
          backgroundColor: 'rgba(34, 197, 94, 0.1)', 
          color: 'var(--success-color)',
          border: '1px solid rgba(34, 197, 94, 0.2)'
        };
      case 'DRAFT':
        return { 
          ...baseStyle, 
          backgroundColor: 'rgba(251, 191, 36, 0.1)', 
          color: 'var(--warning-color)',
          border: '1px solid rgba(251, 191, 36, 0.2)'
        };
      case 'ARCHIVED':
        return { 
          ...baseStyle, 
          backgroundColor: 'rgba(148, 163, 184, 0.1)', 
          color: 'var(--text-muted)',
          border: '1px solid rgba(148, 163, 184, 0.2)'
        };
      default:
        return baseStyle;
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'PUBLISHED': return 'Publiée';
      case 'DRAFT': return 'Brouillon';
      case 'ARCHIVED': return 'Archivée';
      default: return status;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="page-title">Mes Offres</h1>
            <p className="page-subtitle">
              Gérez vos offres d'emploi et consultez les candidatures
            </p>
          </div>
          <Link to="/offers/create" className="btn btn-primary">
            <PlusIcon />
            Créer une offre
          </Link>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Chargement de vos offres...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <div className="alert-content">
            {error}
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {myOffers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <PlusIcon />
              </div>
              <h3>Aucune offre publiée</h3>
              <p>Vous n'avez publié aucune offre pour le moment.</p>
              <Link to="/offers/create" className="btn btn-primary">
                Créer votre première offre
              </Link>
            </div>
          ) : (
            <div className="offers-grid">
              {myOffers.map(offer => (
                <div key={offer.id} className="offer-management-card">
                  <div className="offer-header">
                    <div className="offer-title-section">
                      <h3 className="offer-title">{offer.title}</h3>
                      <div className="offer-meta">
                        <span className="offer-location">{offer.location}</span>
                        <span className="offer-separator">•</span>
                        <span className="offer-contract">{offer.contractType}</span>
                      </div>
                    </div>
                    <div className="offer-status">
                      <span style={getStatusStyle(offer.status)}>
                        {translateStatus(offer.status)}
                      </span>
                    </div>
                  </div>

                  <div className="offer-details">
                    <div className="offer-date">
                      <CalendarIcon />
                      Créée le {new Date(offer.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  <div className="offer-actions">
                    <Link 
                      to={`/offers/${offer.id}/applicants`} 
                      className="btn btn-outline btn-sm"
                    >
                      <UsersIcon />
                      Candidats
                    </Link>
                    
                    <Link 
                      to={`/offers/edit/${offer.id}`} 
                      className="btn btn-outline btn-sm"
                    >
                      <EditIcon />
                      Modifier
                    </Link>
                    
                    <button
                      onClick={() => handleDelete(offer.id)}
                      className="btn btn-danger btn-sm"
                      disabled={deletingId === offer.id}
                    >
                      {deletingId === offer.id ? (
                        <div className="spinner-small"></div>
                      ) : (
                        <DeleteIcon />
                      )}
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Statistiques rapides */}
          {myOffers.length > 0 && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{myOffers.length}</div>
                <div className="stat-label">Offres total</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {myOffers.filter(offer => offer.status === 'PUBLISHED').length}
                </div>
                <div className="stat-label">Publiées</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {myOffers.filter(offer => offer.status === 'DRAFT').length}
                </div>
                <div className="stat-label">Brouillons</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default OfferManagePage;