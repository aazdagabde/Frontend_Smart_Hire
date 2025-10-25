// src/pages/OfferApplicantsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ApplicationService from '../services/ApplicationService';
import OfferService from '../services/OfferService';
import CustomDataModal from '../components/CustomDataModal'; // <<< AJOUTER

// Icône Copier (inchangée)
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '5px', cursor: 'pointer' }}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);
// <<< NOUVEAU : Icône pour les réponses >>>
const MessageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
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

  // --- <<< NOUVEL ÉTAT : Pour le modal des réponses >>> ---
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [selectedApplicantData, setSelectedApplicantData] = useState([]);
  const [selectedApplicantName, setSelectedApplicantName] = useState('');
  const [dataLoadingId, setDataLoadingId] = useState(null); // Pour le spinner du bouton
  const [dataError, setDataError] = useState('');
  // --- <<< FIN NOUVEL ÉTAT >>> ---


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

  // handleDownloadCv (inchangé)
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

  // handleCopyToClipboard (inchangé)
  const handleCopyToClipboard = (textToCopy, id) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
        setCopySuccessId(id);
        setTimeout(() => setCopySuccessId(null), 1500);
    }).catch(err => {
        console.error('Erreur de copie:', err);
    });
  };

  // --- <<< NOUVELLE FONCTION : Gérer l'ouverture du modal >>> ---
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
  // --- <<< FIN NOUVELLE FONCTION >>> ---

  // Helpers getStatusStyle et translateStatus (inchangés)
  const getStatusStyle = (status) => {
    const baseStyle = { padding: '3px 10px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '500', textTransform: 'capitalize', display: 'inline-block' };
    switch (status) {
      case 'PENDING': return { ...baseStyle, backgroundColor: '#f0f0f0', color: '#555' };
      case 'REVIEWED': return { ...baseStyle, backgroundColor: '#e0f7fa', color: '#007bff' };
      case 'ACCEPTED': return { ...baseStyle, backgroundColor: '#e8f5e9', color: '#28a745' };
      case 'REJECTED': return { ...baseStyle, backgroundColor: '#ffebee', color: '#dc3545' };
      default: return baseStyle;
    }
  };
  const translateStatus = (status) => {
     switch (status) {
      case 'PENDING': return 'En attente'; case 'REVIEWED': return 'Examinée';
      case 'ACCEPTED': return 'Acceptée'; case 'REJECTED': return 'Rejetée';
      default: return status;
    }
  }


  return (
    <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
      <h2 className="form-title">Candidats pour "{offerTitle || `Offre #${offerId}`}"</h2>
      <Link to="/offers/manage" style={{ display: 'inline-block', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
        &larr; Retour à la gestion des offres
      </Link>

      {loading && ( /* ... (inchangé) */
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <span className="loading"></span> Chargement des candidats...
        </div>
      )}
      {error && <div className="message message-error">{error}</div>}
      {dataError && <div className="message message-error" style={{marginTop: '0.5rem'}}>{dataError}</div>} {/* <<< AJOUT : Erreur chargement réponses */}


      {!loading && !error && (
        <>
          {applicants.length === 0 ? (
            <div className="message message-info" style={{ textAlign: 'center' }}>
              Aucun candidat n'a postulé à cette offre pour le moment.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--primary-color)', textAlign: 'left', background: 'rgba(10, 25, 47, 0.6)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Nom</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Contact</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Date Candidature</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Statut</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Actions</th> {/* <<< MODIF : Colonne Actions */}
                  </tr>
                </thead>
                <tbody>
                  {applicants.map(app => (
                    <tr key={app.id} style={{ borderBottom: '1px solid rgba(136, 146, 176, 0.2)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: '500' }}>{app.applicantName}</td>

                      <td style={{ padding: '0.75rem 1rem' }}>
                         <div style={{ display: 'flex', alignItems: 'center' }}>
                            {app.applicantEmail}
                            <span onClick={() => handleCopyToClipboard(app.applicantEmail, `email-${app.id}`)} title="Copier l'email">
                                <CopyIcon />
                            </span>
                            {copySuccessId === `email-${app.id}` && <span style={{fontSize: '0.7rem', color: 'var(--success)', marginLeft: '5px'}}>Copié!</span>}
                         </div>
                         {app.applicantPhoneNumber && (
                           <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px', color: 'var(--slate)' }}>
                              {app.applicantPhoneNumber}
                              <span onClick={() => handleCopyToClipboard(app.applicantPhoneNumber, `phone-${app.id}`)} title="Copier le téléphone">
                                  <CopyIcon />
                              </span>
                              {copySuccessId === `phone-${app.id}` && <span style={{fontSize: '0.7rem', color: 'var(--success)', marginLeft: '5px'}}>Copié!</span>}
                           </div>
                         )}
                      </td>

                      <td style={{ padding: '0.75rem 1rem', color: 'var(--slate)' }}>
                        {new Date(app.appliedAt).toLocaleDateString('fr-FR')}
                      </td>
                       <td style={{ padding: '0.75rem 1rem' }}>
                         <span style={getStatusStyle(app.status)}>
                            {translateStatus(app.status)}
                         </span>
                      </td>
                      
                      {/* <<< MODIF : Colonne Actions avec 2 boutons >>> */}
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                        <button
                          className="btn"
                          onClick={() => handleDownloadCv(app.id, app.cvFileName)}
                          disabled={downloadingCvId === app.id}
                          style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', width: 'auto', background: 'var(--light-slate)', color: 'var(--navy-blue)' }}
                          title={`Télécharger ${app.cvFileName}`}
                        >
                          {downloadingCvId === app.id ? <span className="loading" style={{width: '12px', height: '12px'}}></span> : 'CV'}
                        </button>
                        
                        {/* <<< NOUVEAU BOUTON : Voir Réponses >>> */}
                        <button
                          className="btn"
                          onClick={() => handleViewCustomData(app.id, app.applicantName)}
                          disabled={dataLoadingId === app.id}
                          style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', width: 'auto', background: 'var(--light-slate)', color: 'var(--navy-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Voir les réponses personnalisées"
                        >
                          {dataLoadingId === app.id ? <span className="loading" style={{width: '12px', height: '12px'}}></span> : <MessageIcon />}
                        </button>
                      </td>
                      {/* <<< FIN MODIF >>> */}

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* --- <<< AJOUT DU MODAL (conditionnellement rendu) >>> --- */}
      {isDataModalOpen && (
        <CustomDataModal
            applicantName={selectedApplicantName}
            data={selectedApplicantData}
            onClose={() => setIsDataModalOpen(false)}
        />
      )}
      {/* --- <<< FIN AJOUT MODAL >>> --- */}

    </div>
  );
}

export default OfferApplicantsPage;