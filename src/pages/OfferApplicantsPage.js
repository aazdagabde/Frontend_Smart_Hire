// src/pages/OfferApplicantsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ApplicationService from '../services/ApplicationService';
import OfferService from '../services/OfferService';
import CustomDataModal from '../components/CustomDataModal';

// Icônes SVG
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

function OfferApplicantsPage() {
  const { offerId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [offerTitle, setOfferTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingCvId, setDownloadingCvId] = useState(null);
  const [copySuccessId, setCopySuccessId] = useState(null);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [selectedApplicantData, setSelectedApplicantData] = useState([]);
  const [selectedApplicantName, setSelectedApplicantName] = useState('');
  const [dataLoadingId, setDataLoadingId] = useState(null);
  const [dataError, setDataError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const offerResponse = await OfferService.getOfferById(offerId);
        if (offerResponse.success && offerResponse.data) {
          setOfferTitle(offerResponse.data.title);
        }

        const applicantsResponse = await ApplicationService.getApplicationsForOffer(offerId);
        if (applicantsResponse.success && Array.isArray(applicantsResponse.data)) {
          const sortedApplicants = applicantsResponse.data.sort((a, b) =>
            new Date(b.appliedAt) - new Date(a.appliedAt)
          );
          setApplicants(sortedApplicants);
        } else {
          setError(applicantsResponse.message || "Impossible de charger les candidats.");
          setApplicants([]);
        }
      } catch (err) {
        console.error(err);
        if (err.message.includes('403') || err.message.includes('autorisé')) {
          setError("Vous n'avez pas l'autorisation de voir les candidats pour cette offre.");
        } else if (err.message.includes('404') || err.message.toLowerCase().includes('not found')) {
          setError("L'offre ou les candidatures n'ont pas été trouvées.");
        } else {
          setError(err.message || 'Une erreur est survenue.');
        }
        setApplicants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [offerId]);

  const handleDownloadCv = async (applicationId, filename) => {
    setDownloadingCvId(applicationId);
    setError('');
    try {
      await ApplicationService.downloadCv(applicationId);
    } catch (err) {
      console.error("Erreur téléchargement CV:", err);
      setError(`Erreur lors du téléchargement du CV ${filename}: ${err.message}`);
    } finally {
      setDownloadingCvId(null);
    }
  };

  const handleCopyToClipboard = (textToCopy, id) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopySuccessId(id);
      setTimeout(() => setCopySuccessId(null), 1500);
    }).catch(err => {
      console.error('Erreur de copie:', err);
    });
  };

  const handleViewCustomData = async (applicationId, applicantName) => {
    setDataLoadingId(applicationId);
    setDataError('');
    try {
      const response = await ApplicationService.getApplicationCustomData(applicationId);
      if (response.success && Array.isArray(response.data)) {
        setSelectedApplicantData(response.data);
        setSelectedApplicantName(applicantName);
        setIsDataModalOpen(true);
      } else {
        setDataError(response.message || "Erreur lors de la récupération des réponses.");
      }
    } catch (err) {
      console.error(err);
      setDataError(err.message || "Erreur lors de la récupération des réponses.");
    } finally {
      setDataLoadingId(null);
    }
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
        return { ...baseStyle, backgroundColor: 'var(--warning-color)', color: 'var(--text-primary)', opacity: '0.9' };
      case 'REVIEWED': 
        return { ...baseStyle, backgroundColor: 'var(--primary-color)', color: 'white' };
      case 'ACCEPTED': 
        return { ...baseStyle, backgroundColor: 'var(--success-color)', color: 'white' };
      case 'REJECTED': 
        return { ...baseStyle, backgroundColor: 'var(--danger-color)', color: 'white' };
      default: return baseStyle;
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
        <div className="page-header-content">
          <div>
            <h1 className="page-title">Candidats</h1>
            <p className="page-subtitle">
              Pour l'offre : <strong>"{offerTitle || `Offre #${offerId}`}"</strong>
            </p>
          </div>
          <Link to="/offers/manage" className="btn btn-outline">
            ← Retour aux offres
          </Link>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Chargement des candidats...</p>
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
          {applicants.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <UserIcon />
              </div>
              <h3>Aucun candidat</h3>
              <p>Aucun candidat n'a postulé à cette offre pour le moment.</p>
            </div>
          ) : (
            <div className="table-container">
              <div className="applicants-stats">
                <div className="stat-card">
                  <div className="stat-number">{applicants.length}</div>
                  <div className="stat-label">Candidats total</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {applicants.filter(app => app.status === 'PENDING').length}
                  </div>
                  <div className="stat-label">En attente</div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="applicants-table">
                  <thead>
                    <tr>
                      <th>Candidat</th>
                      <th>Contact</th>
                      <th>Date</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.map(app => (
                      <tr key={app.id} className="applicant-row">
                        <td>
                          <div className="applicant-info">
                            <div className="applicant-avatar">
                              <UserIcon />
                            </div>
                            <div className="applicant-details">
                              <div className="applicant-name">{app.applicantName}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="contact-info">
                            <div className="contact-item">
                              <span className="contact-value">{app.applicantEmail}</span>
                              <button
                                onClick={() => handleCopyToClipboard(app.applicantEmail, `email-${app.id}`)}
                                className="btn-icon"
                                title="Copier l'email"
                              >
                                <CopyIcon />
                              </button>
                              {copySuccessId === `email-${app.id}` && (
                                <span className="copy-success">Copié!</span>
                              )}
                            </div>
                            {app.applicantPhoneNumber && (
                              <div className="contact-item">
                                <span className="contact-value">{app.applicantPhoneNumber}</span>
                                <button
                                  onClick={() => handleCopyToClipboard(app.applicantPhoneNumber, `phone-${app.id}`)}
                                  className="btn-icon"
                                  title="Copier le téléphone"
                                >
                                  <CopyIcon />
                                </button>
                                {copySuccessId === `phone-${app.id}` && (
                                  <span className="copy-success">Copié!</span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="application-date">
                            {new Date(app.appliedAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </td>
                        <td>
                          <span style={getStatusStyle(app.status)}>
                            {translateStatus(app.status)}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handleDownloadCv(app.id, app.cvFileName)}
                              disabled={downloadingCvId === app.id}
                              title={`Télécharger ${app.cvFileName}`}
                            >
                              {downloadingCvId === app.id ? (
                                <div className="spinner-small"></div>
                              ) : (
                                <DownloadIcon />
                              )}
                              CV
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handleViewCustomData(app.id, app.applicantName)}
                              disabled={dataLoadingId === app.id}
                              title="Voir les réponses personnalisées"
                            >
                              {dataLoadingId === app.id ? (
                                <div className="spinner-small"></div>
                              ) : (
                                <MessageIcon />
                              )}
                              Réponses
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {isDataModalOpen && (
        <CustomDataModal
          applicantName={selectedApplicantName}
          data={selectedApplicantData}
          onClose={() => setIsDataModalOpen(false)}
        />
      )}
    </div>
  );
}

export default OfferApplicantsPage;