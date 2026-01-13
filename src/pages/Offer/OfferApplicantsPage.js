import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import ApplicationService from '../../services/ApplicationService';
import OfferService from '../../services/OfferService';
import NoProfileImage from '../../assets/noprofile.jpeg';
import './OfferApplicantsPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// --- Composants UI Internes ---

const StatCard = ({ title, value, icon, colorClass }) => (
    <div className={`stat-card ${colorClass}`}>
        <div className="stat-icon">{icon}</div>
        <div className="stat-content">
            <div className="stat-value">{value}</div>
            <div className="stat-title">{title}</div>
        </div>
    </div>
);

const ProgressBar = ({ value, max, label }) => {
    const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="progress-container">
            <div className="progress-header">
                <span>{label}</span>
                <span className="progress-percentage">{percentage}% ({value}/{max})</span>
            </div>
            <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

function OfferApplicantsPage() {
    const { offerId } = useParams(); // Assurez-vous que votre route utilise :offerId
    
    // --- États des Données ---
    const [applicants, setApplicants] = useState([]);
    const [offerDetails, setOfferDetails] = useState(null);
    
    // --- États de l'Interface (UI) ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('ALL'); 
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    // --- États pour la Sélection Automatique ---
    const [topNCount, setTopNCount] = useState(3);
    const [isSelecting, setIsSelecting] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkConfig, setBulkConfig] = useState({
        actionType: 'INTERVIEW', // ou 'ACCEPT'
        customMessage: ''
    });

    // --- États des Modales IA ---
    const [modalContent, setModalContent] = useState({ isOpen: false, title: '', content: '', type: '' }); 

    const loadData = useCallback(async () => {
        if (!offerId) return;
        setLoading(true);
        try {
            // 1. Charger détails offre
            const offerResp = await OfferService.getOfferDetailsForEdit(offerId);
            if (offerResp.success) {
                setOfferDetails(offerResp.data);
            }

            // 2. Charger la liste des candidats
            const appResp = await ApplicationService.getApplicationsForOffer(offerId);
            if (appResp.success) {
                setApplicants(appResp.data);
            }
            
        } catch (err) {
            console.error("Erreur chargement:", err);
            setError(err.message || "Impossible de charger les données.");
        } finally {
            setLoading(false);
        }
    }, [offerId]);

    // --- Chargement Initial ---
    useEffect(() => {
        loadData();
    }, [loadData]);

    // --- Logique Calculée (Stats & Filtres) ---

    const stats = useMemo(() => {
        const total = applicants.length;
        const analyzed = applicants.filter(a => a.cvScore !== null).length;
        const accepted = applicants.filter(a => a.status === 'ACCEPTED' || a.status === 'INTERVIEW_SCHEDULED').length;
        
        const avgScore = analyzed > 0 
            ? Math.round(applicants.reduce((acc, curr) => acc + (curr.cvScore || 0), 0) / analyzed) 
            : 0;
        
        return { total, analyzed, accepted, avgScore };
    }, [applicants]);

    const filteredApplicants = useMemo(() => {
        let list = [...applicants];
        
        if (activeTab === 'SHORTLIST') {
            return list.filter(a => a.status === 'ACCEPTED' || a.status === 'INTERVIEW_SCHEDULED')
                       .sort((a, b) => (b.cvScore || 0) - (a.cvScore || 0));
        }
        
        if (activeTab === 'REJECTED') {
            return list.filter(a => a.status === 'REJECTED');
        }
        
        // Pour l'onglet 'ALL'
        return list.sort((a, b) => {
            const scoreA = a.cvScore || -1;
            const scoreB = b.cvScore || -1;
            if (scoreA !== scoreB) return scoreB - scoreA;
            return new Date(b.appliedAt) - new Date(a.appliedAt);
        });
    }, [applicants, activeTab]);

    const isDeadlinePassed = useMemo(() => {
        if (!offerDetails?.deadline) return false; 
        const today = new Date();
        today.setHours(0,0,0,0);
        const deadlineDate = new Date(offerDetails.deadline);
        return today > deadlineDate;
    }, [offerDetails]);


    // --- Actions Utilisateur ---

    const handleAnalyzeAll = async () => {
        if (!window.confirm("Voulez-vous lancer l'analyse IA pour tous les CVs ? Cela peut prendre une minute.")) return;
        
        setIsAnalyzing(true);
        try {
            await ApplicationService.analyzeAllCvs(offerId); // Appel au nouveau service
            alert("🤖 Analyse lancée en arrière-plan ! Les scores vont apparaître progressivement.");
            
            setTimeout(loadData, 4000);
        } catch (e) { 
            alert("Erreur: " + e.message); 
        } finally { 
            setIsAnalyzing(false); 
        }
    };

    // Ouverture de la modale de sélection
    const openBulkModal = () => {
        if (offerDetails?.deadline && !isDeadlinePassed) {
            alert(`⚠️ Impossible de classer avant la date limite du ${new Date(offerDetails.deadline).toLocaleDateString()}.`);
            return;
        }
        if (!offerDetails?.deadline) {
             if(!window.confirm("Attention : Aucune date limite n'est définie pour cette offre.\nVoulez-vous vraiment procéder au classement définitif maintenant ?")) return;
        }
        setShowBulkModal(true);
    };

    // Soumission de la sélection de masse
    const handleBulkSubmit = async (e) => {
        e.preventDefault();
        setIsSelecting(true);
        try {
            await ApplicationService.bulkSelectCandidates(offerId, {
                topCount: parseInt(topNCount),
                actionType: bulkConfig.actionType,
                message: bulkConfig.customMessage
            });
            
            await loadData();
            setActiveTab('SHORTLIST');
            setShowBulkModal(false);
            alert(`✅ Opération réussie ! Top ${topNCount} candidats traités.`);
        } catch (e) { 
            alert("Erreur lors de la sélection : " + e.message); 
        } finally { 
            setIsSelecting(false); 
        }
    };

    const handleGenerateAiContent = async (appId, type) => {
        setModalContent({ isOpen: true, title: 'Génération en cours...', content: 'Veuillez patienter pendant que l\'IA analyse le profil...', type });
        
        try {
            let res;
            if (type === 'SUMMARY') {
                res = await ApplicationService.generateAiSummary(appId); // Vérifiez que cette méthode existe dans ApplicationService
            } else {
                res = await ApplicationService.generateAiQuestions(appId); // Vérifiez que cette méthode existe dans ApplicationService
            }
            
            if (res.success) {
                setModalContent({ 
                    isOpen: true, 
                    title: type === 'SUMMARY' ? '📝 Résumé du Profil & Justification' : '❓ Questions d\'Entretien Suggérées', 
                    content: res.data || res.message,
                    type 
                });
            }
        } catch (e) {
            setModalContent({ isOpen: true, title: 'Erreur', content: "Impossible de générer le contenu : " + e.message, type: 'ERROR' });
        }
    };

    // --- Rendu de l'Interface ---

    if (loading && applicants.length === 0) return <div className="dashboard-layout"><div className="spinner"></div></div>;

    return (
        <div className="dashboard-layout">
            {/* Header Dashboard */}
            <div className="dashboard-header">
                <div>
                    <h1 className="page-title">Pilotage des Candidatures</h1>
                    <div className="offer-meta">
                        <span className="offer-tag">Offre : {offerDetails?.title || 'Chargement...'}</span>
                        {offerDetails?.deadline ? (
                            <span className={`deadline-tag ${isDeadlinePassed ? 'expired' : 'active'}`}>
                                📅 Deadline : {new Date(offerDetails.deadline).toLocaleDateString()}
                                {isDeadlinePassed ? ' (Passée)' : ''}
                            </span>
                        ) : (
                            <span className="deadline-tag" style={{background:'#f3f4f6', color:'#6b7280', border:'1px solid #e5e7eb'}}>
                                ⚠️ Pas de deadline définie
                            </span>
                        )}
                    </div>
                </div>
                <div className="header-actions">
                    <Link to="/offers/manage" className="btn btn-outline">← Retour aux offres</Link>
                </div>
            </div>

            {error && <div className="alert alert-error" style={{marginBottom:'1rem'}}>{error}</div>}

            {/* Zone Statistiques & Actions IA */}
            <div className="stats-grid">
                <StatCard 
                    title="Total Candidats" 
                    value={stats.total} 
                    icon="👥" 
                    colorClass="blue" 
                />
                <StatCard 
                    title="Score Moyen IA" 
                    value={stats.avgScore > 0 ? `${stats.avgScore}/100` : '-'} 
                    icon="⭐" 
                    colorClass="yellow" 
                />
                <StatCard 
                    title="Convoqués" 
                    value={stats.accepted} 
                    icon="✅" 
                    colorClass="green" 
                />
                
                <div className="action-card">
                    <ProgressBar value={stats.analyzed} max={stats.total} label="Candidats Analysés (IA)" />
                    <button 
                        className="btn btn-primary btn-sm btn-full" 
                        onClick={handleAnalyzeAll} 
                        disabled={isAnalyzing || stats.total === 0}
                        style={{marginTop: 'auto'}}
                    >
                        {isAnalyzing ? (
                            <><div className="spinner-small"></div> Analyse...</>
                        ) : (
                            '✨ Lancer Analyse IA'
                        )}
                    </button>
                </div>
            </div>

            {/* Barre de Contrôle */}
            <div className="control-bar">
                <div className="tabs">
                    <button 
                        className={`tab ${activeTab === 'ALL' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('ALL')}
                    >
                        Tous ({stats.total})
                    </button>
                    <button 
                        className={`tab ${activeTab === 'SHORTLIST' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('SHORTLIST')}
                    >
                        Convoqués ({stats.accepted})
                    </button>
                    <button 
                        className={`tab ${activeTab === 'REJECTED' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('REJECTED')}
                    >
                        Rejetés
                    </button>
                </div>

                <div className="selection-tool">
                    <button 
                        className="btn btn-dark btn-sm" 
                        onClick={openBulkModal}
                        disabled={isSelecting || stats.analyzed === 0}
                        style={{
                            opacity: (!isDeadlinePassed && offerDetails?.deadline) ? 0.6 : 1,
                            cursor: (!isDeadlinePassed && offerDetails?.deadline) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        🤖 Sélection Automatique
                    </button>
                </div>
            </div>

            {/* Liste des Candidats */}
            <div className="applicants-list">
                {filteredApplicants.length === 0 ? (
                    <div className="empty-state" style={{background:'white', padding:'3rem', borderRadius:'12px'}}>
                        <p>Aucun candidat ne correspond à ce filtre.</p>
                    </div>
                ) : (
                    filteredApplicants.map(app => (
                        <div key={app.id} className={`applicant-row ${app.status}`}>
                            <div className="col-avatar">
                                <img 
                                    src={`${API_URL}/profile/${app.applicantId}/picture`} 
                                    onError={(e) => e.target.src=NoProfileImage} 
                                    alt="Avatar" 
                                />
                            </div>
                            
                            <div className="col-info">
                                <div className="app-name">{app.applicantName || 'Candidat Inconnu'}</div>
                                <div className="app-date">
                                    Postulé le {new Date(app.appliedAt).toLocaleDateString('fr-FR', {day:'numeric', month:'long', year:'numeric'})}
                                </div>
                            </div>
                            
                            <div className="col-score">
                                {app.cvScore !== null ? (
                                    <div className="score-badge" style={{ 
                                        background: `conic-gradient(from 0deg, #4f46e5 ${app.cvScore}%, #e5e7eb ${app.cvScore}%)` 
                                    }}>
                                        <span title={`Score IA: ${app.cvScore}/100`}>{app.cvScore}</span>
                                    </div>
                                ) : (
                                    <span style={{color:'#9ca3af', fontSize:'0.85rem'}}>Non noté</span>
                                )}
                            </div>
                            
                            <div className="col-status">
                                <span className={`status-pill ${app.status}`}>
                                    {app.status === 'ACCEPTED' ? 'CONVOQUÉ' : app.status}
                                </span>
                            </div>
                            
                            <div className="col-actions">
                                <button 
                                    className="btn-icon" 
                                    onClick={() => ApplicationService.downloadCv(app.id)} 
                                    title="Voir le CV"
                                >
                                    📄
                                </button>
                                
                                {(app.status === 'ACCEPTED' || app.status === 'INTERVIEW_SCHEDULED') && (
                                    <>
                                        <button 
                                            className="btn-icon ai-btn" 
                                            onClick={() => handleGenerateAiContent(app.id, 'SUMMARY')} 
                                            title="Générer Résumé & Justification IA"
                                        >
                                            📝
                                        </button>
                                        <button 
                                            className="btn-icon ai-btn" 
                                            onClick={() => handleGenerateAiContent(app.id, 'QUESTIONS')} 
                                            title="Générer Questions d'Entretien IA"
                                        >
                                            ❓
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modale de Sélection Automatique */}
            {showBulkModal && (
                <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
                    <div className="modal-content-modern" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">✨ Sélection Automatique</h2>
                        <p className="modal-desc">
                            Sélectionnez les meilleurs profils et déclenchez les actions N8N automatiquement.
                        </p>

                        <form onSubmit={handleBulkSubmit}>
                            
                            <div className="form-group">
                                <label>Nombre de candidats (Top N)</label>
                                <input 
                                    type="number" 
                                    className="form-input"
                                    min="1" 
                                    max={stats.total}
                                    value={topNCount}
                                    onChange={(e) => setTopNCount(e.target.value)}
                                />
                                <p className="form-hint">Les candidats seront triés par leur Score IA.</p>
                            </div>

                            <div className="form-group">
                                <label>Action à effectuer</label>
                                <div className="radio-cards">
                                    <div 
                                        className={`radio-card ${bulkConfig.actionType === 'INTERVIEW' ? 'active' : ''}`}
                                        onClick={() => setBulkConfig({...bulkConfig, actionType: 'INTERVIEW'})}
                                    >
                                        <h4>📅 Inviter à un entretien</h4>
                                        <p>Envoie un email de proposition de date.</p>
                                    </div>
                                    <div 
                                        className={`radio-card ${bulkConfig.actionType === 'ACCEPT' ? 'active' : ''}`}
                                        onClick={() => setBulkConfig({...bulkConfig, actionType: 'ACCEPT'})}
                                    >
                                        <h4>✅ Accepter le profil</h4>
                                        <p>Marque comme accepté et envoie une confirmation.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Message personnalisé (Email)</label>
                                <textarea 
                                    className="form-input"
                                    rows="3"
                                    placeholder={bulkConfig.actionType === 'INTERVIEW' 
                                        ? "Ex: Nous aimerions vous rencontrer..." 
                                        : "Ex: Félicitations, vous êtes sélectionné..."}
                                    value={bulkConfig.customMessage}
                                    onChange={(e) => setBulkConfig({...bulkConfig, customMessage: e.target.value})}
                                ></textarea>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowBulkModal(false)} className="btn btn-outline">
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isSelecting}>
                                    {isSelecting ? 'Traitement...' : 'Lancer la sélection'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* Modale pour Affichage Contenu IA */}
            {modalContent.isOpen && (
                <div className="modal-overlay" onClick={() => setModalContent({...modalContent, isOpen: false})}>
                    <div className="modal-content ai-modal" onClick={e => e.stopPropagation()}>
                        <h3>{modalContent.title}</h3>
                        <div className="modal-body-text">
                            {modalContent.content ? (
                                modalContent.content.split('\n').map((line, i) => (
                                    <div key={i} style={{minHeight: line ? 'auto' : '1rem'}}>
                                        {line}
                                    </div>
                                ))
                            ) : (
                                <p>Aucun contenu généré.</p>
                            )}
                        </div>
                        <div style={{display:'flex', justifyContent:'flex-end', marginTop:'1rem'}}>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => setModalContent({...modalContent, isOpen: false})}
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OfferApplicantsPage;