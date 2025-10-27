// Fichier : src/pages/Offer/OfferApplicantsPage.js

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import ApplicationService from '../../services/ApplicationService';
import OfferService from '../../services/OfferService';
import CustomDataModal from '../../components/CustomDataModal';
import InternalNotesModal from '../../components/InternalNotesModal'; // NOUVEAU

// --- Icônes SVG ---
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

// Icône CV modifiée (représente "voir" plutôt que "télécharger")
const ViewCvIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
    </svg>
);

const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

// NOUVELLE ICÔNE NOTES (Crayon)
const NotesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const StarIcon = ({ filled = false }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
       fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);
// --- Fin Icônes ---


// Composant StarRating (inchangé)
const StarRating = ({ score, maxScore = 5, onRate, applicationId, disabled }) => {
  const handleRate = async (newScore) => {
    if (disabled || !onRate) return;
    try {
      await onRate(applicationId, newScore);
    } catch (error) {
      console.error("Erreur de notation:", error);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {[...Array(maxScore)].map((_, i) => {
        const ratingValue = i + 1;
        const currentScoreOutOfMax = score ? Math.round((score / 100) * maxScore) : 0;

        return (
          <button
            key={i}
            type="button"
            onClick={() => handleRate(Math.round((ratingValue / maxScore) * 100))}
            style={{ background: 'none', border: 'none', cursor: disabled ? 'default' : 'pointer', padding: '2px', color: ratingValue <= currentScoreOutOfMax ? 'var(--warning-color)' : 'var(--text-muted)' }}
            disabled={disabled}
            title={`Noter ${ratingValue}/${maxScore}`}
          >
            <StarIcon filled={ratingValue <= currentScoreOutOfMax} />
          </button>
        );
      })}
      <span style={{ fontSize: '0.8rem', marginLeft: '5px', color: 'var(--text-secondary)' }}>
        {score !== null && score !== undefined ? `${score}/100` : 'Non noté'}
      </span>
    </div>
  );
};


function OfferApplicantsPage() {
  const { offerId } = useParams();
  const [applicants, setApplicants] = useState([]); // Données brutes de l'API
  const [offerTitle, setOfferTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingCvId, setViewingCvId] = useState(null); // Renommé
  const [copySuccessId, setCopySuccessId] = useState(null);
  
  // États pour les Modals
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [selectedApplicantData, setSelectedApplicantData] = useState([]);
  const [selectedApplicantName, setSelectedApplicantName] = useState('');
  const [dataLoadingId, setDataLoadingId] = useState(null);
  const [, setDataError] = useState('');
  
  // États de mise à jour
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [updatingScoreId, setUpdatingScoreId] = useState(null);

  // NOUVEAU (Amélioration 3) : États pour le Modal de Notes Internes
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedApplicantForNotes, setSelectedApplicantForNotes] = useState(null);

  // NOUVEAU (Amélioration 1) : États pour le Filtrage et Tri
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('appliedAt_desc'); // Tri par défaut


  // Fetch des données (inchangé)
   useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        try {
          const offerResponse = await OfferService.getOfferDetailsForEdit(offerId);
          if (offerResponse.success && offerResponse.data) {
            setOfferTitle(offerResponse.data.title);
          } else {
             const publicOfferResponse = await OfferService.getOfferById(offerId);
             if(publicOfferResponse.success && publicOfferResponse.data) {
                 setOfferTitle(publicOfferResponse.data.title);
             }
          }
        } catch (offerErr) {
            console.warn("Could not fetch offer title:", offerErr);
            setOfferTitle(`Offre #${offerId}`);
        }

        const applicantsResponse = await ApplicationService.getApplicationsForOffer(offerId);
        if (applicantsResponse.success && Array.isArray(applicantsResponse.data)) {
          // Pas de tri ici, on le fait dans 'useMemo'
          setApplicants(applicantsResponse.data);
        } else {
          setError(applicantsResponse.message || "Impossible de charger les candidats.");
          setApplicants([]);
        }
      } catch (err) {
        console.error("Error fetching applicants:", err);
        if (err.message.includes('403') || err.message.toLowerCase().includes('autorisé')) {
          setError("Vous n'avez pas l'autorisation de voir les candidats pour cette offre.");
        } else if (err.message.includes('404') || err.message.toLowerCase().includes('not found')) {
          setError("L'offre demandée ou les candidatures associées n'ont pas été trouvées.");
        } else {
          setError(err.message || 'Une erreur est survenue lors du chargement des données.');
        }
        setApplicants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [offerId]);

  // NOUVEAU (Amélioration 1) : Logique de filtrage et tri
  const filteredAndSortedApplicants = useMemo(() => {
    let processedApplicants = [...applicants];

    // 1. Filtrage
    if (statusFilter !== 'ALL') {
      processedApplicants = processedApplicants.filter(
        (app) => app.status === statusFilter
      );
    }

    // 2. Tri
    switch (sortBy) {
      case 'score_desc':
        processedApplicants.sort((a, b) => (b.cvScore ?? -1) - (a.cvScore ?? -1)); // Mettre les non-notés à la fin
        break;
      case 'score_asc':
        processedApplicants.sort((a, b) => (a.cvScore ?? 101) - (b.cvScore ?? 101)); // Mettre les non-notés à la fin
        break;
      case 'appliedAt_asc':
         processedApplicants.sort((a, b) => new Date(a.appliedAt) - new Date(b.appliedAt));
        break;
      case 'name_asc':
         processedApplicants.sort((a, b) => (a.applicantName || '').localeCompare(b.applicantName || ''));
        break;
      case 'name_desc':
         processedApplicants.sort((a, b) => (b.applicantName || '').localeCompare(a.applicantName || ''));
        break;
      default: // appliedAt_desc
         processedApplicants.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    }

    return processedApplicants;
  }, [applicants, statusFilter, sortBy]);


  // MODIFIÉ (Amélioration 2) : Gérer la visualisation du CV
  const handleViewCv = async (applicationId) => {
    setViewingCvId(applicationId);
    setError('');
    try {
      // Le service s'occupe mtn d'ouvrir le nouvel onglet
      await ApplicationService.downloadCv(applicationId); 
    } catch (err) {
      console.error("Erreur visualisation CV:", err);
      setError(`Erreur lors de l'ouverture du CV : ${err.message}`);
    } finally {
      setViewingCvId(null);
    }
  };

  const handleCopyToClipboard = (textToCopy, id) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopySuccessId(id);
      setTimeout(() => setCopySuccessId(null), 1500);
    }).catch(err => {
      console.error('Erreur de copie:', err);
      setError('Impossible de copier dans le presse-papiers.');
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
      console.error("Erreur récupération données personnalisées:", err);
      setDataError(err.message || "Erreur lors de la récupération des réponses.");
    } finally {
      setDataLoadingId(null);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingStatusId(applicationId);
    setError('');
    try {
      const response = await ApplicationService.updateApplicationStatus(applicationId, newStatus, null);
      if (response.success && response.data) {
        // Mettre à jour l'état local
        setApplicants(prev => prev.map(app =>
          app.id === applicationId ? { ...app, status: response.data.status, candidateMessage: response.data.candidateMessage } : app
        ));
      } else {
        setError(response.message || "Erreur lors de la mise à jour du statut.");
      }
    } catch (err) {
      console.error("Erreur changement statut:", err);
      setError(err.message || "Erreur lors de la mise à jour du statut.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleScoreUpdate = async (applicationId, newScore) => {
    setUpdatingScoreId(applicationId);
    setError('');
    try {
      const score = parseInt(newScore, 10);
      if (isNaN(score) || score < 0 || score > 100) {
        throw new Error("La note doit être un nombre entre 0 et 100.");
      }

      const response = await ApplicationService.updateCvScore(applicationId, score);
      if (response.success && response.data) {
        setApplicants(prev => prev.map(app =>
          app.id === applicationId ? { ...app, cvScore: response.data.cvScore } : app
        ));
      } else {
        setError(response.message || "Erreur lors de la mise à jour de la note.");
      }
    } catch (err) {
      console.error("Erreur mise à jour note:", err);
      setError(err.message || "Erreur lors de la mise à jour de la note.");
    } finally {
      setUpdatingScoreId(null);
    }
  };

  // NOUVEAU (Amélioration 3) : Gérer l'ouverture/fermeture du modal de notes
  const handleOpenNotesModal = (application) => {
    setSelectedApplicantForNotes(application);
    setIsNotesModalOpen(true);
  };

  const handleCloseNotesModal = () => {
    setIsNotesModalOpen(false);
    setSelectedApplicantForNotes(null);
  };

  const handleNotesUpdateSuccess = (updatedApplication) => {
    // Mettre à jour l'état local avec les nouvelles notes
    setApplicants(prev => prev.map(app =>
      app.id === updatedApplication.id ? updatedApplication : app
    ));
    handleCloseNotesModal(); // Fermer le modal
  };

  // --- Fonctions utilitaires (inchangées) ---
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

  const statusOptions = ['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'];
  // --- Fin Fonctions utilitaires ---


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
          <div className="loading-state"><div className="spinner"></div><p>Chargement...</p></div>
      )}
      {error && (
          <div className="alert alert-error">{error}</div>
      )}

      {!loading && !error && (
        <>
          {applicants.length === 0 ? (
            <div className="empty-state">
                <h3>Aucun candidat</h3>
                <p>Personne n'a encore postulé à cette offre.</p>
            </div>
          ) : (
            <div className="table-container">
              
               {/* NOUVEAU (Amélioration 1) : Filtres et Tri */}
               <div className="applicants-filters-bar">
                 <div className="form-group">
                   <label htmlFor="statusFilter" className="form-label form-label-sm">Filtrer par statut</label>
                   <select
                     id="statusFilter"
                     className="form-input form-input-sm"
                     value={statusFilter}
                     onChange={(e) => setStatusFilter(e.target.value)}
                   >
                     <option value="ALL">Tous les statuts</option>
                     {statusOptions.map(status => (
                       <option key={status} value={status}>
                         {translateStatus(status)}
                       </option>
                     ))}
                   </select>
                 </div>

                 <div className="form-group">
                   <label htmlFor="sortBy" className="form-label form-label-sm">Trier par</label>
                   <select
                     id="sortBy"
                     className="form-input form-input-sm"
                     value={sortBy}
                     onChange={(e) => setSortBy(e.target.value)}
                   >
                     <option value="appliedAt_desc">Plus récent</option>
                     <option value="appliedAt_asc">Plus ancien</option>
                     <option value="score_desc">Meilleure note</option>
                     <option value="score_asc">Pire note</option>
                     <option value="name_asc">Nom (A-Z)</option>
                     <option value="name_desc">Nom (Z-A)</option>
                   </select>
                 </div>
               </div>

               {/* Stats (utilise mtn la liste filtrée) */}
               <div className="applicants-stats">
                 <div className="stat-card">
                   <div className="stat-number">{filteredAndSortedApplicants.length}</div>
                   <div className="stat-label">
                     Candidat{filteredAndSortedApplicants.length > 1 ? 's' : ''} affiché{filteredAndSortedApplicants.length > 1 ? 's' : ''}
                   </div>
                 </div>
                 <div className="stat-card">
                   <div className="stat-number">
                     {applicants.length}
                   </div>
                   <div className="stat-label">Candidats total</div>
                 </div>
               </div>

              <div className="table-responsive">
                <table className="applicants-table">
                  <thead>
                    <tr>
                      <th>Candidat</th>
                      <th>Contact</th>
                      <th>Date</th>
                      <th>Note CV</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* MODIFIÉ : Utilise la liste filtrée et triée */}
                    {filteredAndSortedApplicants.map(app => (
                      <tr key={app.id} className="applicant-row">
                        <td data-label="Candidat">
                          <div className="applicant-info">
                            <div className="applicant-avatar">
                               {app.applicantName?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="applicant-details">
                              <div className="applicant-name">{app.applicantName || 'Nom inconnu'}</div>
                            </div>
                          </div>
                        </td>
                        <td data-label="Contact">
                          <div className="contact-info">
                            {app.applicantEmail && (
                              <div className="contact-item">
                                <span className="contact-value">{app.applicantEmail}</span>
                                <button
                                  onClick={() => handleCopyToClipboard(app.applicantEmail, `email-${app.id}`)}
                                  className="btn-icon"
                                  title="Copier l'email"
                                >
                                  <CopyIcon />
                                  {copySuccessId === `email-${app.id}` && (
                                    <span className="copy-success">Copié!</span>
                                  )}
                                </button>
                              </div>
                            )}
                            {app.applicantPhoneNumber && (
                              <div className="contact-item">
                                <span className="contact-value">{app.applicantPhoneNumber}</span>
                                <button
                                  onClick={() => handleCopyToClipboard(app.applicantPhoneNumber, `phone-${app.id}`)}
                                  className="btn-icon"
                                  title="Copier le téléphone"
                                >
                                  <CopyIcon />
                                  {copySuccessId === `phone-${app.id}` && (
                                    <span className="copy-success">Copié!</span>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td data-label="Date">
                          <div className="application-date">
                            {new Date(app.appliedAt).toLocaleDateString('fr-FR', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                          </div>
                        </td>
                        <td data-label="Note CV">
                          <StarRating
                            score={app.cvScore}
                            maxScore={5}
                            onRate={handleScoreUpdate}
                            applicationId={app.id}
                            disabled={updatingScoreId === app.id}
                          />
                        </td>
                        <td data-label="Statut">
                          {updatingStatusId === app.id ? (
                            <div className="spinner-small" style={{ margin: 'auto' }}></div>
                          ) : (
                            <select
                              value={app.status}
                              onChange={(e) => handleStatusChange(app.id, e.target.value)}
                              style={{ ...getStatusStyle(app.status), border: '1px solid var(--border-color)', appearance: 'none', backgroundPosition: 'right 0.5rem center' }}
                              className="form-input"
                              disabled={updatingStatusId === app.id}
                            >
                              {statusOptions.map(status => (
                                <option key={status} value={status}>
                                  {translateStatus(status)}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        
                        {/* MODIFIÉ : Actions */}
                         <td data-label="Actions">
                          <div className="action-buttons">
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handleViewCv(app.id)}
                              disabled={viewingCvId === app.id}
                              title={`Voir le CV (${app.cvFileName || ''})`}
                            >
                              {viewingCvId === app.id ? (
                                <div className="spinner-small"></div>
                              ) : (
                                <ViewCvIcon />
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
                            {/* NOUVEAU BOUTON (Amélioration 3) */}
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handleOpenNotesModal(app)}
                              title="Ajouter/Voir les notes internes"
                            >
                              <NotesIcon />
                              Notes
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Message si aucun candidat ne correspond aux filtres */}
              {filteredAndSortedApplicants.length === 0 && applicants.length > 0 && (
                <div className="empty-state" style={{paddingTop: '2rem'}}>
                    <p>Aucun candidat ne correspond à vos filtres actuels.</p>
                </div>
              )}

            </div>
          )}
        </>
      )}

      {/* Modals */}
       {isDataModalOpen && (
         <CustomDataModal
           applicantName={selectedApplicantName}
           data={selectedApplicantData}
           onClose={() => setIsDataModalOpen(false)}
         />
       )}

       {/* NOUVEAU MODAL (Amélioration 3) */}
       {isNotesModalOpen && selectedApplicantForNotes && (
           <InternalNotesModal
             application={selectedApplicantForNotes}
             onClose={handleCloseNotesModal}
             onSuccess={handleNotesUpdateSuccess}
           />
       )}

    </div>
  );
}

export default OfferApplicantsPage;