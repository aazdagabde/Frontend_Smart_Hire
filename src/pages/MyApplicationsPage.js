// src/pages/MyApplicationsPage.js
import React, { useState, useEffect } from 'react';
import ApplicationService from '../services/ApplicationService';
import { Link } from 'react-router-dom';
import UpdateCvModal from '../components/UpdateCvModal'; // <<< IMPORTER LE MODAL (sera créé ensuite)
import '../styles/App.css'; // S'assurer que les styles globaux sont importés

function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplicationId, setSelectedApplicationId] = useState(null); // <<< Pour savoir quelle cand. modifier
  const [isModalOpen, setIsModalOpen] = useState(false); // <<< Pour ouvrir/fermer le modal

  useEffect(() => {
    fetchApplications();
  }, []); // Se déclenche une seule fois au montage

  const fetchApplications = async () => {
    setLoading(true);
    setError(''); // Réinitialiser l'erreur
    try {
      const apiResponse = await ApplicationService.getMyApplications();
      if (apiResponse.success && Array.isArray(apiResponse.data)) {
        // --- TRI PAR DATE ---
        const sortedApps = apiResponse.data.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
        setApplications(sortedApps);
        // --- FIN TRI ---
      } else {
        setError(apiResponse.message || "Impossible de charger les candidatures.");
        setApplications([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Une erreur est survenue lors de la récupération de vos candidatures.');
      setApplications([]); // Assurer tableau vide en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  // <<< NOUVELLES FONCTIONS pour gérer le modal >>>
  const handleOpenUpdateModal = (applicationId) => {
    setSelectedApplicationId(applicationId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplicationId(null);
  };

  // Callback pour rafraîchir la liste après une mise à jour réussie du CV
  const handleCvUpdateSuccess = () => {
    fetchApplications(); // Recharge les données
    handleCloseModal(); // Ferme le modal
  };
  // <<< FIN NOUVELLES FONCTIONS >>>

  // Helper pour obtenir le style du statut
  const getStatusStyle = (status) => {
    const baseStyle = {
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '0.9rem',
      fontWeight: '500',
      textTransform: 'capitalize',
      display: 'inline-block'
    };
    switch (status) {
      case 'PENDING':
        return { ...baseStyle, backgroundColor: '#f0f0f0', color: '#555' };
      case 'REVIEWED':
        return { ...baseStyle, backgroundColor: '#e0f7fa', color: '#007bff' };
      case 'ACCEPTED':
        return { ...baseStyle, backgroundColor: '#e8f5e9', color: '#28a745' };
      case 'REJECTED':
        return { ...baseStyle, backgroundColor: '#ffebee', color: '#dc3545' };
      default:
        return baseStyle;
    }
  };

  // Helper pour traduire le statut
  const translateStatus = (status) => {
     switch (status) {
      case 'PENDING': return 'En attente';
      case 'REVIEWED': return 'Examinée';
      case 'ACCEPTED': return 'Acceptée';
      case 'REJECTED': return 'Rejetée';
      default: return status;
    }
  };

  return (
    // Utiliser une classe pour cibler plus facilement avec CSS si besoin
    <div className="my-applications-page" style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      <h2 className="form-title">Mes Candidatures</h2>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary-color)' }}>
          <span className="loading"></span> Chargement de vos candidatures...
        </div>
      )}
      {error && <div className="message message-error">{error}</div>}

      {!loading && !error && (
        <>
          {applications.length === 0 ? (
            <div className="message message-info" style={{ textAlign: 'center' }}>
              Vous n'avez postulé à aucune offre pour le moment.
              <br/>
              <Link to="/offers" className="btn btn-primary btn-auto" style={{marginTop: '1rem'}}>Voir les offres</Link>
            </div>
          ) : (
            // Utiliser une classe pour la liste pour un style potentiel via CSS
            <div className="applications-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* En-tête (optionnel, pour clarté) */}
              <div className="form-card" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', backgroundColor: '#f9f9f9', fontWeight: '600', color: 'var(--dark-navy)' }}>
                 <div style={{flex: 3}}>Offre & CV</div>
                 <div style={{flex: 2}}>Date</div>
                 <div style={{flex: 1, textAlign: 'center'}}>Statut</div>
                 {/* <<< NOUVELLE COLONNE EN-TÊTE >>> */}
                 <div style={{flex: 1, textAlign: 'right'}}>Actions</div>
              </div>

              {/* Liste des candidatures (cartes) */}
              {applications.map(app => (
                // Utiliser la classe form-card standard
                <div key={app.id} className="form-card application-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  
                  {/* Colonne Offre */}
                  <div style={{flex: 3, display: 'flex', flexDirection: 'column'}}>
                    <h3 className="application-offer-title" style={{ marginBottom: '0.25rem', fontSize: '1.2rem' }}>
                      <Link to={`/offers/${app.jobOfferId}`} style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '600' }}>
                        {app.jobOfferTitle}
                      </Link>
                    </h3>
                    <p className="application-cv-info" style={{ color: 'var(--slate)', fontSize: '0.9rem' }}>
                      CV soumis: {app.cvFileName}
                    </p>
                  </div>

                  {/* Colonne Date */}
                  <div style={{flex: 2, color: 'var(--slate)' }}>
                    <p>
                      {new Date(app.appliedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Colonne Statut */}
                  <div style={{flex: 1, textAlign: 'center'}}>
                    <span style={getStatusStyle(app.status)}>
                      {translateStatus(app.status)}
                    </span>
                  </div>

                  {/* <<< NOUVELLE COLONNE ACTIONS >>> */}
                  <div style={{flex: 1, textAlign: 'right'}}>
                     <button
                        className="btn"
                        onClick={() => handleOpenUpdateModal(app.id)}
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', width: 'auto', background: 'var(--light-slate)', color: 'var(--navy-blue)'}}
                     >
                        Modifier CV
                     </button>
                  </div>
                  {/* <<< FIN NOUVELLE COLONNE >>> */}

                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* <<< AJOUT DU MODAL (conditionnellement rendu) >>> */}
      {isModalOpen && selectedApplicationId && (
        <UpdateCvModal
          applicationId={selectedApplicationId}
          onClose={handleCloseModal}
          onSuccess={handleCvUpdateSuccess} // Passer la fonction de rafraîchissement
        />
      )}
      {/* <<< FIN AJOUT MODAL >>> */}

    </div>
  );
}

export default MyApplicationsPage;