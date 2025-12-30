// src/pages/Application/MyApplicationsPage.js

import React, { useState, useEffect } from 'react';
import ApplicationService from '../../services/ApplicationService';
import { Link } from 'react-router-dom';
import UpdateCvModal from '../../components/UpdateCvModal';

// --- Icônes SVG ---
const DocumentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;

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
        setError(apiResponse?.message || "Impossible de charger les candidatures.");
        setApplications([]);
      }
    } catch (err) {
      console.error("Erreur fetchApplications:", err);
      setError(err.message || 'Une erreur est survenue.');
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
    fetchApplications();
    handleCloseModal();
  };

  // Helper pour les classes de badges
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'badge badge-status-pending';
      case 'REVIEWED': return 'badge badge-status-reviewed';
      case 'ACCEPTED': return 'badge badge-status-accepted';
      case 'REJECTED': return 'badge badge-status-rejected';
      default: return 'badge';
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'REVIEWED': return 'Examinée';
      case 'ACCEPTED': return 'Acceptée';
      case 'REJECTED': return 'Non retenue';
      default: return status;
    }
  };

  // Helper pour la couleur du message
  const getMessageClass = (status) => {
      if (status === 'ACCEPTED') return 'app-card-message success';
      if (status === 'REJECTED') return 'app-card-message danger';
      return 'app-card-message';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Mes Candidatures</h1>
        <p className="page-subtitle">Suivez l'état de vos demandes en temps réel.</p>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Chargement de vos candidatures...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <div className="alert-content"><strong>Erreur :</strong> {error}</div>
        </div>
      )}

      {!loading && !error && (
        <>
          {applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><DocumentIcon /></div>
              <h3>Aucune candidature</h3>
              <p>Vous n'avez postulé à aucune offre pour le moment.</p>
              <Link to="/offers" className="btn-modern btn-primary-modern" style={{ marginTop: '1.5rem', textDecoration:'none' }}>
                Parcourir les offres
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {applications.map(app => (
                <div key={app.id} className="application-card-modern">
                  
                  {/* En-tête : Titre et Statut */}
                  <div className="app-card-header">
                    <div>
                        <h3 style={{margin: 0}}>
                            <Link to={`/offers/${app.jobOfferId}`} className="app-card-title">
                                {app.jobOfferTitle || `Offre #${app.jobOfferId}`}
                            </Link>
                        </h3>
                    </div>
                    <span className={getStatusBadgeClass(app.status)}>
                      {translateStatus(app.status)}
                    </span>
                  </div>

                  {/* Metadonnées : Date et CV */}
                  <div className="app-card-meta">
                    <div className="meta-item">
                      <CalendarIcon />
                      <span>Posté le {new Date(app.appliedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}</span>
                    </div>
                    <div className="meta-item">
                      <DocumentIcon />
                      <span title={app.cvFileName} style={{maxWidth: '200px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                        {app.cvFileName || 'CV sans nom'}
                      </span>
                    </div>
                  </div>

                  {/* Message du Recruteur (si présent) */}
                  {app.candidateMessage && (
                    <div className={getMessageClass(app.status)}>
                       <div style={{display: 'flex', alignItems: 'flex-start', gap: '0.75rem'}}>
                           <div style={{marginTop: '2px'}}><InfoIcon /></div>
                           <div>
                               <strong>Message du recruteur :</strong><br/>
                               {app.candidateMessage}
                           </div>
                       </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="app-card-actions">
                    <button
                      className="btn-secondary-modern"
                      onClick={() => handleOpenUpdateModal(app.id)}
                      style={{fontSize: '0.9rem', padding: '0.5rem 1rem'}}
                    >
                      <EditIcon /> Modifier le CV
                    </button>
                    <Link
                      to={`/offers/${app.jobOfferId}`}
                      className="btn-modern btn-primary-modern"
                      style={{fontSize: '0.9rem', padding: '0.5rem 1rem', textDecoration:'none'}}
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

      {/* Modal de mise à jour CV */}
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

export default MyApplicationsPage;