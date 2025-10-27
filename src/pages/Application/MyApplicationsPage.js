// src/pages/MyApplicationsPage.js
import React, { useState, useEffect } from 'react';
import ApplicationService from '../../services/ApplicationService';
import { Link } from 'react-router-dom';
import UpdateCvModal from '../../components/UpdateCvModal';

// Icônes SVG
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
      if (apiResponse.success && Array.isArray(apiResponse.data)) {
        const sortedApps = apiResponse.data.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
        setApplications(sortedApps);
      } else {
        setError(apiResponse.message || "Impossible de charger les candidatures.");
        setApplications([]);
      }
    } catch (err) {
      console.error(err);
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
    fetchApplications();
    handleCloseModal();
  };

  const getStatusStyle = (status) => {
    const baseStyle = {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600',
      textTransform: 'capitalize',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    };
    
    switch (status) {
      case 'PENDING':
        return { 
          ...baseStyle, 
          backgroundColor: 'var(--warning-color)', 
          color: 'var(--text-primary)',
          opacity: '0.9'
        };
      case 'REVIEWED':
        return { 
          ...baseStyle, 
          backgroundColor: 'var(--primary-color)', 
          color: 'white' 
        };
      case 'ACCEPTED':
        return { 
          ...baseStyle, 
          backgroundColor: 'var(--success-color)', 
          color: 'white' 
        };
      case 'REJECTED':
        return { 
          ...baseStyle, 
          backgroundColor: 'var(--danger-color)', 
          color: 'white' 
        };
      default:
        return baseStyle;
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
              <Link to="/offers" className="btn btn-primary">
                Parcourir les offres
              </Link>
            </div>
          ) : (
            <div className="applications-grid">
              {applications.map(app => (
                <div key={app.id} className="application-card">
                  <div className="application-header">
                    <div className="application-title-section">
                      <h3 className="application-title">
                        <Link to={`/offers/${app.jobOfferId}`} className="application-link">
                          {app.jobOfferTitle}
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
                          {app.cvFileName}
                        </span>
                      </div>
                    </div>
                    <div className="application-status">
                      <span style={getStatusStyle(app.status)}>
                        {translateStatus(app.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="application-actions">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleOpenUpdateModal(app.id)}
                    >
                      <EditIcon />
                      Modifier le CV
                    </button>
                    <Link 
                      to={`/offers/${app.jobOfferId}`} 
                      className="btn btn-secondary btn-sm"
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