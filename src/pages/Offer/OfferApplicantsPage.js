import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import ApplicationService from '../../services/ApplicationService';
import OfferService from '../../services/OfferService';
import CustomDataModal from '../../components/CustomDataModal';
import InternalNotesModal from '../../components/InternalNotesModal';
import NoProfileImage from '../../assets/noprofile.jpeg'; // <-- AJOUTÉ

// URL de l'API pour les images
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api'; // <-- AJOUTÉ

// --- Icônes SVG ---
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

// Icône CV modifiée (représente "voir")
const ViewCvIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line> {/* Lignes de texte simplifiées */}
        <line x1="16" y1="17" x2="8" y2="17"></line>
    </svg>
);

const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

// Icône Notes (Crayon)
const NotesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

// Icône Étoile
const StarIcon = ({ filled = false }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
       fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

// Icône Utilisateur
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

// Icône Email
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

// Icône Téléphone
const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);
// --- Fin Icônes ---


// Composant StarRating pour afficher et interagir avec la note (0-100 converti en 0-5 étoiles)
const StarRating = ({ score, maxScore = 5, onRate, applicationId, disabled }) => {
  // Fonction pour gérer le clic sur une étoile
  const handleRate = async (newStarRating) => {
    if (disabled || !onRate) return;
    // Convertir la note étoile (1-5) en score (0-100)
    const newScore = Math.round((newStarRating / maxScore) * 100);
    try {
      await onRate(applicationId, newScore); // Appelle la fonction de mise à jour du score
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la note:", error);
      // Gérer l'erreur (ex: afficher un message à l'utilisateur)
    }
  };

  // Calcule le nombre d'étoiles remplies basé sur le score (0-100)
  const currentFilledStars = score !== null && score !== undefined ? Math.round((score / 100) * maxScore) : 0;

  return (
    <div className="star-rating-container">
      {[...Array(maxScore)].map((_, i) => {
        const ratingValue = i + 1;
        return (
          <button
            key={i}
            type="button"
            onClick={() => handleRate(ratingValue)}
            className={`star-button ${disabled ? 'disabled' : ''}`}
            disabled={disabled}
            title={disabled ? `${currentFilledStars}/${maxScore} étoiles` : `Noter ${ratingValue}/${maxScore}`}
            aria-label={`Noter ${ratingValue} sur ${maxScore}`}
            style={{ color: ratingValue <= currentFilledStars ? 'var(--warning-color)' : 'var(--text-muted)' }}
          >
            <StarIcon filled={ratingValue <= currentFilledStars} />
          </button>
        );
      })}
      {/* Affichage optionnel du score numérique */}
      <span className="score-text">
         {score !== null && score !== undefined ? `${score}/100` : '(Non noté)'}
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
  const [viewingCvId, setViewingCvId] = useState(null); // Pour indiquer le chargement/visualisation
  const [copySuccessId, setCopySuccessId] = useState(null);

  // États pour les Modals
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [selectedApplicantData, setSelectedApplicantData] = useState([]);
  const [selectedApplicantName, setSelectedApplicantName] = useState('');
  const [dataLoadingId, setDataLoadingId] = useState(null);
  const [, setDataError] = useState(''); // Peut être utilisé pour afficher une erreur spécifique au modal

  // États pour les mises à jour en ligne (Statut, Score)
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [updatingScoreId, setUpdatingScoreId] = useState(null);

  // États pour le Modal de Notes Internes
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedApplicantForNotes, setSelectedApplicantForNotes] = useState(null); // Stocke l'objet application complet

  // États pour le Filtrage et Tri
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'PENDING', 'REVIEWED', etc.
  const [sortBy, setSortBy] = useState('appliedAt_desc'); // Ex: 'appliedAt_desc', 'score_desc', 'name_asc'


    // Fetch des données initiales
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                // Essayer de récupérer le titre de l'offre (priorité à la version RH si disponible)
                try {
                    const offerResponse = await OfferService.getOfferDetailsForEdit(offerId);
                    if (offerResponse.success && offerResponse.data) {
                        setOfferTitle(offerResponse.data.title);
                    } else {
                        // Fallback vers l'API publique si l'API RH échoue (ex: rôle non RH accède ?)
                        const publicOfferResponse = await OfferService.getOfferById(offerId);
                        if(publicOfferResponse.success && publicOfferResponse.data) {
                            setOfferTitle(publicOfferResponse.data.title);
                        }
                    }
                } catch (offerErr) {
                    console.warn("Could not fetch offer title via RH endpoint, trying public:", offerErr);
                    try {
                        const publicOfferResponse = await OfferService.getOfferById(offerId);
                        if(publicOfferResponse.success && publicOfferResponse.data) {
                            setOfferTitle(publicOfferResponse.data.title);
                        } else {
                            setOfferTitle(`Offre #${offerId}`); // Fallback final
                        }
                    } catch (publicErr) {
                        console.error("Could not fetch offer title:", publicErr);
                        setOfferTitle(`Offre #${offerId}`); // Fallback final
                    }
                }

                // Récupérer les candidatures
                const applicantsResponse = await ApplicationService.getApplicationsForOffer(offerId);
                if (applicantsResponse.success && Array.isArray(applicantsResponse.data)) {
                    // Stocker les données brutes, le tri se fera via useMemo
                    setApplicants(applicantsResponse.data);
                } else {
                    setError(applicantsResponse.message || "Impossible de charger les candidats.");
                    setApplicants([]);
                }
            } catch (err) {
                console.error("Error fetching applicants:", err);
                // Logique de gestion d'erreur affinée
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

    // Filtrage et Tri des candidats à l'aide de useMemo pour optimiser
    const filteredAndSortedApplicants = useMemo(() => {
        let processedApplicants = [...applicants];

        // 1. Filtrage par statut
        if (statusFilter !== 'ALL') {
            processedApplicants = processedApplicants.filter(
                (app) => app.status === statusFilter
            );
        }

        // 2. Tri
        switch (sortBy) {
            case 'score_desc':
                processedApplicants.sort((a, b) => (b.cvScore ?? -1) - (a.cvScore ?? -1)); // Les non-notés (null) vont à la fin
                break;
            case 'score_asc':
                processedApplicants.sort((a, b) => (a.cvScore ?? 101) - (b.cvScore ?? 101)); // Les non-notés (null) vont à la fin
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
            default: // appliedAt_desc (Tri par défaut)
                processedApplicants.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
        }

        return processedApplicants;
    }, [applicants, statusFilter, sortBy]);


  // Ouvre le CV dans un nouvel onglet
  const handleViewCv = async (applicationId) => {
    setViewingCvId(applicationId);
    setError('');
    try {
      // Modifiez downloadCv dans ApplicationService pour ouvrir dans un nouvel onglet
      await ApplicationService.downloadCv(applicationId, true); // true pour ouvrir au lieu de télécharger
    } catch (err) {
      console.error("Erreur visualisation CV:", err);
      setError(`Erreur lors de l'ouverture du CV : ${err.message}`);
    } finally {
      setViewingCvId(null);
    }
  };

    // Copie dans le presse-papier
    const handleCopyToClipboard = (textToCopy, id) => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopySuccessId(id);
            setTimeout(() => setCopySuccessId(null), 1500); // Message s'efface après 1.5s
        }).catch(err => {
            console.error('Erreur de copie:', err);
            setError('Impossible de copier dans le presse-papiers.'); // Afficher l'erreur
        });
    };

    // Ouvre le modal des réponses personnalisées
    const handleViewCustomData = async (applicationId, applicantName) => {
        setDataLoadingId(applicationId);
        setDataError(''); // Renommé pour clarté
        try {
            const response = await ApplicationService.getApplicationCustomData(applicationId);
            if (response.success && Array.isArray(response.data)) {
                setSelectedApplicantData(response.data);
                setSelectedApplicantName(applicantName);
                setIsDataModalOpen(true);
            } else {
                setDataError(response.message || "Erreur lors de la récupération des réponses.");
                setError(response.message || "Erreur lors de la récupération des réponses personnalisées."); // Afficher aussi globalement
            }
        } catch (err) {
            console.error("Erreur récupération données personnalisées:", err);
            const errorMsg = err.message || "Erreur lors de la récupération des réponses personnalisées.";
            setDataError(errorMsg);
            setError(errorMsg); // Afficher aussi globalement
        } finally {
            setDataLoadingId(null);
        }
    };

    // Met à jour le statut d'une candidature
    const handleStatusChange = async (applicationId, newStatus) => {
        setUpdatingStatusId(applicationId);
        setError('');
        try {
            // Assurez-vous que votre service a cette fonction !
            const response = await ApplicationService.updateApplicationStatus(applicationId, newStatus);
            if (response.success && response.data) {
                // Met à jour l'état local pour refléter le changement immédiatement
                setApplicants(prev => prev.map(app =>
                    app.id === applicationId ? { ...app, status: response.data.status } : app
                ));
            } else {
                setError(response.message || "Erreur lors de la mise à jour du statut.");
                // Optionnel: Revenir à l'ancien statut visuellement si l'API échoue
                 setApplicants(prev => [...prev]); // Force re-render pour remettre l'ancien statut du select
            }
        } catch (err) {
            console.error("Erreur changement statut:", err);
            setError(err.message || "Erreur lors de la mise à jour du statut.");
             setApplicants(prev => [...prev]); // Force re-render
        } finally {
            setUpdatingStatusId(null);
        }
    };

    // Met à jour la note CV d'une candidature
    const handleScoreUpdate = async (applicationId, newScore) => {
        // Validation basique (peut être plus robuste)
        const score = parseInt(newScore, 10);
        if (isNaN(score) || score < 0 || score > 100) {
            setError("La note doit être un nombre valide entre 0 et 100.");
            return; // Arrêter si invalide
        }

        setUpdatingScoreId(applicationId);
        setError('');
        try {
             // Assurez-vous que votre service a cette fonction !
            const response = await ApplicationService.updateCvScore(applicationId, score);
            if (response.success && response.data) {
                // Met à jour l'état local
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


    // Ouvre le modal de notes internes
    const handleOpenNotesModal = (application) => {
        setSelectedApplicantForNotes(application); // Stocke l'objet complet
        setIsNotesModalOpen(true);
    };

    // Ferme le modal de notes internes
    const handleCloseNotesModal = () => {
        setIsNotesModalOpen(false);
        setSelectedApplicantForNotes(null);
    };

    // Callback après succès de la mise à jour des notes
    const handleNotesUpdateSuccess = (updatedApplication) => {
        // Met à jour l'état local avec les nouvelles notes
        setApplicants(prev => prev.map(app =>
            app.id === updatedApplication.id ? { ...app, internalNotes: updatedApplication.internalNotes } : app
        ));
        handleCloseNotesModal(); // Ferme le modal
    };

    // --- Fonctions utilitaires ---
    const getStatusStyle = (status) => {
        // Styles de base améliorés
        const baseStyle = {
          padding: '4px 10px', // Un peu plus large
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600',
          textTransform: 'uppercase', // Majuscules pour plus d'impact
          letterSpacing: '0.5px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          border: '1px solid transparent',
          whiteSpace: 'nowrap' // Empêche le retour à la ligne
        };

        switch (status) {
          case 'PENDING':
            return { ...baseStyle, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#d97706', borderColor: 'rgba(245, 158, 11, 0.2)' }; // Jaune/Orange
          case 'REVIEWED':
            return { ...baseStyle, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)', borderColor: 'rgba(59, 130, 246, 0.2)' }; // Bleu
          case 'ACCEPTED':
            return { ...baseStyle, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', borderColor: 'rgba(16, 185, 129, 0.2)' }; // Vert
          case 'REJECTED':
            return { ...baseStyle, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', borderColor: 'rgba(239, 68, 68, 0.2)' }; // Rouge
          default:
            return { ...baseStyle, backgroundColor: 'var(--surface-color)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }; // Gris par défaut
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
            {/* ... En-tête de page ... */}
             <div className="page-header">
                 <div className="page-header-content">
                     <div>
                         <h1 className="page-title">Candidats</h1>
                         <p className="page-subtitle">
                          Pour l'offre : <strong>"{offerTitle || `Offre #${offerId}`}"</strong>
                         </p>
                     </div>
                     <Link to="/offers/manage" className="btn btn-outline btn-auto"> {/* btn-auto */}
                         ← Retour aux offres
                     </Link>
                 </div>
             </div>

            {loading && ( /* ... Loading state ... */
                 <div className="loading-state"><div className="spinner"></div><p>Chargement des candidats...</p></div>
            )}
            {error && ( /* ... Error alert ... */
                 <div className="alert alert-error"><strong>Erreur :</strong> {error}</div>
            )}

            {!loading && !error && (
                <>
                    {applicants.length === 0 ? (
                        /* ... Empty state ... */
                         <div className="empty-state">
                            <div className="empty-state-icon"><UserIcon /></div>
                            <h3>Aucun candidat</h3>
                            <p>Personne n'a encore postulé à cette offre.</p>
                         </div>
                    ) : (
                        <div className="applicants-container"> {/* Nouveau conteneur global */}

                            {/* Barre de Filtres et Tri */}
                             <div className="applicants-filters-bar">
                                 <div className="form-group filter-group">
                                     <label htmlFor="statusFilter" className="form-label form-label-sm">Filtrer</label>
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

                                 <div className="form-group filter-group">
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
                                         <option value="score_asc">Moins bonne note</option>
                                         <option value="name_asc">Nom (A-Z)</option>
                                         <option value="name_desc">Nom (Z-A)</option>
                                     </select>
                                 </div>
                                 <div className="applicant-count-info">
                                      {filteredAndSortedApplicants.length} sur {applicants.length} candidat(s) affiché(s)
                                 </div>
                             </div>

                               {/* Grille des cartes de candidats */}
                               {filteredAndSortedApplicants.length > 0 ? (
                                 <div className="applicants-grid-layout">
                                     {filteredAndSortedApplicants.map(app => (
                                         <div key={app.id} className="applicant-card">
                                             {/* Header avec avatar, nom, date, statut */}
                                             <div className="applicant-card-header">
                                                
                                                {/* --- MODIFICATION : Affichage de la photo de profil --- */}
                                                {/* Assure-toi que 'app.candidateId' est bien fourni par ton API */}
                                                <img
                                                    src={`${API_URL}/profile/${app.candidateId}/picture`}
                                                    alt={`Profil de ${app.applicantName || 'Candidat'}`}
                                                    className="applicant-avatar" // Cette classe doit styler l'image
                                                    onError={(e) => { e.target.src = NoProfileImage; }}
                                                />
                                                {/* --- FIN MODIFICATION --- */}

                                                 <div className="applicant-card-title">
                                                     <h3 className="applicant-name">{app.applicantName || 'Nom inconnu'}</h3>
                                                     <span className="application-date-card">
                                                         Postulé le {new Date(app.appliedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                     </span>
                                                 </div>
                                                  {/* Sélecteur de statut */}
                                                 <div className="applicant-status-selector">
                                                     {updatingStatusId === app.id ? (
                                                         <div className="spinner-small"></div>
                                                     ) : (
                                                         <select
                                                             value={app.status}
                                                             onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                                             style={getStatusStyle(app.status)} // Applique le style basé sur la valeur
                                                             className="status-select"
                                                             disabled={updatingStatusId === app.id}
                                                             aria-label={`Statut de ${app.applicantName}`}
                                                         >
                                                             {statusOptions.map(status => (
                                                                 <option key={status} value={status}>
                                                                     {translateStatus(status)}
                                                                 </option>
                                                             ))}
                                                         </select>
                                                     )}
                                                 </div>
                                             </div>

                                              {/* Section Note CV */}
                                              <div className="applicant-card-rating">
                                                 <label className="form-label form-label-sm">Note CV</label>
                                                 <StarRating
                                                     score={app.cvScore}
                                                     maxScore={5}
                                                     onRate={handleScoreUpdate}
                                                     applicationId={app.id}
                                                     disabled={updatingScoreId === app.id}
                                                 />
                                                  {updatingScoreId === app.id && <div className="spinner-small" style={{marginLeft: '10px'}}></div>}
                                              </div>


                                             {/* Informations de contact */}
                                             <div className="applicant-card-contact">
                                                 <div className="contact-item-card">
                                                     <MailIcon />
                                                     <span className="contact-value">{app.applicantEmail}</span>
                                                     <button onClick={() => handleCopyToClipboard(app.applicantEmail, `email-${app.id}`)} className="btn-icon copy-button" title="Copier l'email">
                                                         <CopyIcon />
                                                         {copySuccessId === `email-${app.id}` && <span className="copy-success-tooltip">Copié!</span>}
                                                     </button>
                                                 </div>
                                                 {app.applicantPhoneNumber && (
                                                     <div className="contact-item-card">
                                                         <PhoneIcon />
                                                         <span className="contact-value">{app.applicantPhoneNumber}</span>
                                                         <button onClick={() => handleCopyToClipboard(app.applicantPhoneNumber, `phone-${app.id}`)} className="btn-icon copy-button" title="Copier le téléphone">
                                                             <CopyIcon />
                                                             {copySuccessId === `phone-${app.id}` && <span className="copy-success-tooltip">Copié!</span>}
                                                         </button>
                                                     </div>
                                                 )}
                                             </div>

                                             {/* Actions */}
                                             <div className="applicant-card-actions">
                                                 <button className="btn btn-secondary btn-sm btn-icon-text" onClick={() => handleViewCv(app.id)} disabled={viewingCvId === app.id} title={`Voir le CV (${app.cvFileName || ''})`}>
                                                     {viewingCvId === app.id ? <div className="spinner-small"></div> : <ViewCvIcon />}
                                                     <span>CV</span>
                                                 </button>
                                                 <button className="btn btn-secondary btn-sm btn-icon-text" onClick={() => handleViewCustomData(app.id, app.applicantName)} disabled={dataLoadingId === app.id} title="Voir les réponses">
                                                     {dataLoadingId === app.id ? <div className="spinner-small"></div> : <MessageIcon />}
                                                     <span>Réponses</span>
                                                 </button>
                                                 <button className="btn btn-secondary btn-sm btn-icon-text" onClick={() => handleOpenNotesModal(app)} title="Gérer les notes internes">
                                                     <NotesIcon />
                                                     <span>Notes ({app.internalNotes ? 'Voir/Mod.' : 'Ajouter'})</span>
                                                 </button>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                               ) : (
                                   <div className="empty-state" style={{paddingTop: '2rem'}}>
                                       <p>Aucun candidat ne correspond à vos filtres actuels.</p>
                                   </div>
                               )}
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            {isDataModalOpen && ( /* ... CustomDataModal ... */
                 <CustomDataModal applicantName={selectedApplicantName} data={selectedApplicantData} onClose={() => setIsDataModalOpen(false)} />
            )}

            {isNotesModalOpen && selectedApplicantForNotes && ( /* ... InternalNotesModal ... */
                 <InternalNotesModal application={selectedApplicantForNotes} onClose={handleCloseNotesModal} onSuccess={handleNotesUpdateSuccess} />
            )}

        </div>
    );
}

export default OfferApplicantsPage;