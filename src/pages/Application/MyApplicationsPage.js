// Fichier : src/pages/Application/MyApplicationsPage.js

import React, { useState, useEffect } from 'react';
import ApplicationService from '../../services/ApplicationService';
import { Link } from 'react-router-dom';
import UpdateCvModal from '../../components/UpdateCvModal';

// --- Icônes SVG ---
const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);
// --- Fin Icônes ---


function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const apiResponse = await ApplicationService.getMyApplications();
      if (apiResponse && apiResponse.success && Array.isArray(apiResponse.data)) {
        const sortedApps = apiResponse.data.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
        setApplications(sortedApps);
      } else {
        setError(apiResponse?.message || "Impossible de charger les candidatures ou format de données incorrect.");
        setApplications([]);
      }
    } catch (err) {
      console.error("Erreur fetchApplications:", err);
      setError(err.message || 'Une erreur est survenue lors de la récupération de vos candidatures.');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpdateModal = (applicationId) => {
    setSelectedApplicationId(applicationId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplicationId(null);
  };

  const handleCvUpdateSuccess = () => {
    fetchApplications(); // Recharger les données
    handleCloseModal(); // Fermer le modal
  };


  // Fonctions utilitaires
  const getStatusStyle = (status) => {
    const baseStyle = {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      border: '1px solid transparent'
    };

    switch (status) {
      case 'PENDING':
        return { ...baseStyle, backgroundColor: 'rgba(251, 191, 36, 0.1)', color: 'var(--warning-color)', border: '1px solid rgba(251, 191, 36, 0.2)' };
      case 'REVIEWED':
        return { ...baseStyle, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)', border: '1px solid rgba(59, 130, 246, 0.2)' };
      case 'ACCEPTED':
        return { ...baseStyle, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', border: '1px solid rgba(16, 185, 129, 0.2)' };
      case 'REJECTED':
        return { ...baseStyle, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', border: '1px solid rgba(239, 68, 68, 0.2)' };
      default:
        return { ...baseStyle, backgroundColor: 'var(--surface-color)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' };
    }
  };

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
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Mes Candidatures</h1>
        <p className="page-subtitle">Suivez l'état de vos candidatures en cours</p>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Chargement de vos candidatures...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <div className="alert-content">
            <strong>Erreur :</strong> {error}
          </div>
        </div>
      )}


      {!loading && !error && (
        <>
          {applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <DocumentIcon />
              </div>
              <h3>Aucune candidature</h3>
              <p>Vous n'avez postulé à aucune offre pour le moment.</p>
              <Link to="/offers" className="btn btn-primary" style={{ marginTop: '1rem', width: 'auto' }}>
                Parcourir les offres
              </Link>
            </div>
          ) : (
            <div className="applications-grid">
              {applications.map(app => (
                <div key={app.id} className="application-card">
                  
                  {/* En-tête de carte (MODIFIÉ) */}
                  <div className="application-header">
                    {/* Section Titre & Méta (gauche) */}
                    <div className="application-title-section">
                      <h3 className="application-title">
                        <Link to={`/offers/${app.jobOfferId}`} className="application-link">
                          {app.jobOfferTitle || `Offre #${app.jobOfferId}`}
                        </Link>
                      </h3>
                      <div className="application-meta">
                        <span className="application-date">
                          Postulé le {new Date(app.appliedAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="application-separator">•</span>
                        <span className="application-cv">
                          <DocumentIcon />
                          {app.cvFileName || 'CV non trouvé'}
                        </span>
                      </div>
                    </div>

                    {/* Section Statut (droite) - Bloc Score supprimé */}
                    <div className="application-status" style={{ textAlign: 'right' }}>
                      <span className="application-meta-label"> 
                        Statut
                      </span>
                      <span style={getStatusStyle(app.status)}>
                        {translateStatus(app.status)}
                      </span>
                    </div>
                  </div>

                  {/* Message du RH (inchangé) */}
                  {app.candidateMessage && (
                    <div className="message message-info" style={{ marginTop: '1rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <InfoIcon />
                       <span>{app.candidateMessage}</span>
                    </div>
                  )}

                  {/* Actions (inchangées) */}
                  <div className="application-actions" style={{ marginTop: app.candidateMessage ? '1rem' : '0' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleOpenUpdateModal(app.id)}
                      title="Remplacer le CV pour cette candidature"
                    >
                      <EditIcon />
                      Modifier le CV
                    </button>
                    <Link
                      to={`/offers/${app.jobOfferId}`}
                      className="btn btn-secondary btn-sm"
                      title="Voir les détails de l'offre"
                    >
                      Voir l'offre
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal (inchangé) */}
       {isModalOpen && selectedApplicationId && (
        <UpdateCvModal
          applicationId={selectedApplicationId}
          onClose={handleCloseModal}
          onSuccess={handleCvUpdateSuccess}
        />
      )}
    </div>
  );
}

/* Assurez-vous d'avoir cette classe dans votre CSS (App.css ou index.css)
  pour les labels "Statut"
*/
/*
.application-meta-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  display: block;
}
*/

export default MyApplicationsPage;