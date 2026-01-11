// src/pages/OfferDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import OfferService from '../../services/OfferService';
import ApplicationService from '../../services/ApplicationService';
import { useAuth } from '../../contexts/AuthContext';
import defaultOfferImage from '../../assets/image_offre.png'; // Image par défaut

// --- Icônes SVG ---
const DocumentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const ContractIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
};

function OfferDetailPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // États pour la candidature
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [customFields, setCustomFields] = useState([]);
  const [customData, setCustomData] = useState({});
  const [fieldsLoading, setFieldsLoading] = useState(true);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    const fetchOfferAndFields = async () => {
      setLoading(true);
      setFieldsLoading(true);
      setError('');
      try {
        const offerResponse = await OfferService.getOfferById(id);
        if (offerResponse.success && offerResponse.data) {
          setOffer(offerResponse.data);
        } else {
          setError(offerResponse.message || "Offre non trouvée.");
          setLoading(false);
          return;
        }

        try {
          const fieldsResponse = await OfferService.getCustomFields(id);
          if (fieldsResponse.success && Array.isArray(fieldsResponse.data)) {
            setCustomFields(fieldsResponse.data);
            const initialData = {};
            fieldsResponse.data.forEach(field => {
              if (field && field.id) {
                initialData[field.id] = field.fieldType === 'CHECKBOX' ? [] : '';
              }
            });
            setCustomData(initialData);
          }
        } catch (fieldsErr) {
          console.warn("Could not load custom fields:", fieldsErr);
        }

      } catch (err) {
        console.error("Error fetching offer details:", err);
        setError(err.message || 'Une erreur est survenue.');
      } finally {
        setLoading(false);
        setFieldsLoading(false);
      }
    };

    if (id) fetchOfferAndFields();
    else { setError("ID manquant."); setLoading(false); }
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setApplyError('');
    if (file && file.type !== "application/pdf") {
      setApplyError("Le CV doit être au format PDF.");
      setCvFile(null);
    } else if (file && file.size > 5 * 1024 * 1024) {
      setApplyError("Le fichier ne doit pas dépasser 5MB.");
      setCvFile(null);
    } else {
      setCvFile(file);
    }
  };

  const handleCustomDataChange = (fieldId, fieldType, value) => {
    setCustomData(prevData => {
      if (fieldType === 'CHECKBOX') {
        const currentValues = prevData[fieldId] || [];
        return { ...prevData, [fieldId]: currentValues.includes(value) ? currentValues.filter(v => v !== value) : [...currentValues, value] };
      }
      return { ...prevData, [fieldId]: value };
    });
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyError('');
    setApplyLoading(true);

    if (!cvFile) {
      setApplyError("Le CV (PDF) est obligatoire.");
      setApplyLoading(false);
      return;
    }

    let validationError = false;
    for (const field of customFields) {
      if (field.isRequired) {
        const value = customData[field.id];
        if ((field.fieldType === 'CHECKBOX' && (!value || value.length === 0)) || !value) {
          validationError = true;
        }
      }
      if (validationError) {
        setApplyError(`Le champ "${field.label}" est obligatoire.`);
        setApplyLoading(false);
        return;
      }
    }

    const formData = new FormData();
    formData.append('cv', cvFile);
    const formattedData = Object.entries(customData).map(([fieldId, value]) => ({
      fieldId: parseInt(fieldId),
      value: Array.isArray(value) ? value.join(';') : value
    }));
    formData.append('customData', JSON.stringify(formattedData));

    try {
      const response = await ApplicationService.applyToOffer(id, formData);
      if (response.success) {
        setApplySuccess(true);
        setApplyError('');
      } else {
        setApplyError(response.message || "Erreur lors de la candidature.");
      }
    } catch (err) {
      setApplyError(err.message || "Une erreur est survenue.");
    } finally {
      setApplyLoading(false);
    }
  };

  const renderFormField = (field) => {
    const commonProps = { id: `field-${field.id}`, className: "form-input", required: field.isRequired };
    switch (field.fieldType) {
      case 'TEXT': return <input type="text" {...commonProps} value={customData[field.id] || ''} onChange={(e) => handleCustomDataChange(field.id, 'TEXT', e.target.value)} />;
      case 'TEXTAREA': return <textarea {...commonProps} rows="5" value={customData[field.id] || ''} onChange={(e) => handleCustomDataChange(field.id, 'TEXTAREA', e.target.value)} />;
      case 'RADIO': return <div className="radio-group">{field.options.split(';').map(option => (<div key={option} className="radio-option"><input type="radio" id={`field-${field.id}-${option}`} name={`field-${field.id}`} value={option} checked={customData[field.id] === option} onChange={(e) => handleCustomDataChange(field.id, 'RADIO', e.target.value)} required={field.isRequired} className="radio-input" /><label htmlFor={`field-${field.id}-${option}`} className="radio-label">{option}</label></div>))}</div>;
      case 'CHECKBOX': return <div className="checkbox-group">{field.options.split(';').map(option => (<div key={option} className="checkbox-option"><input type="checkbox" id={`field-${field.id}-${option}`} value={option} checked={(customData[field.id] || []).includes(option)} onChange={(e) => handleCustomDataChange(field.id, 'CHECKBOX', e.target.value)} className="checkbox-input" /><label htmlFor={`field-${field.id}-${option}`} className="checkbox-label">{option}</label></div>))}</div>;
      default: return null;
    }
  };

  const getDeadlineDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const isUrgent = (dateString) => {
    if (!dateString) return false;
    const diffDays = Math.ceil((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays <= 5;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <Link to="/offers" className="btn btn-outline btn-sm">← Retour aux offres</Link>
      </div>

      {loading && <div className="loading-state"><div className="spinner"></div><p>Chargement...</p></div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && offer && (
        <div className="offer-detail-layout">
          
          {/* Colonne principale */}
          <div className="offer-detail-main">
            <div className="form-card full-width">
              
              {/* --- IMAGE DE L'OFFRE (BANNIÈRE) --- */}
              <div className="offer-image-banner" style={{
                  width: 'calc(100% + 3rem)', // Pour compenser le padding du parent si nécessaire, ou on ajuste le style
                  margin: '-1.5rem -1.5rem 1.5rem -1.5rem', // Marges négatives pour coller aux bords si le form-card a du padding
                  height: '250px', 
                  overflow: 'hidden', 
                  borderRadius: '12px 12px 0 0',
                  backgroundColor: '#f1f5f9'
              }}>
                  <img
                      src={offer.hasImage ? OfferService.getOfferImageUrl(offer.id) : defaultOfferImage}
                      alt={offer.title}
                      style={{width: '100%', height: '100%', objectFit: 'cover'}}
                      onError={(e) => {e.target.onerror = null; e.target.src = defaultOfferImage}}
                  />
              </div>

              <div className="offer-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem'}}>
                
                <div style={{flex: 1}}>
                    <h1 className="offer-title" style={{marginBottom: '1rem'}}>{offer.title}</h1>
                    <div className="offer-tags">
                    <span className="offer-tag"><LocationIcon /> {offer.location}</span>
                    <span className="offer-tag"><ContractIcon /> {offer.contractType}</span>
                    </div>
                </div>

                <div className="offer-meta-container">
                    <div className="meta-item">
                        <CalendarIcon /> 
                        <span>Posté le {formatDate(offer.createdAt)}</span>
                    </div>
                    
                    {offer.deadline && (
                        <div className={`meta-item ${isUrgent(offer.deadline) ? 'deadline' : ''}`}>
                            <ClockIcon />
                            <span>Date limite : {getDeadlineDate(offer.deadline)}</span>
                        </div>
                    )}
                </div>

              </div>

              <div className="offer-content">
                <div className="description-section">
                  <h3 className="section-title">Description du poste</h3>
                  <div className="description-text">{offer.description}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne latérale */}
          <div className="offer-detail-sidebar">
            
            {/* Bloc Action */}
            <div className="form-card" style={{ borderTop: '4px solid var(--primary-color)' }}>
              <div className="form-section-header">
                <DocumentIcon />
                <h3 className="section-title" style={{marginBottom: 0}}>Candidature</h3>
              </div>
              
              <p className="form-section-description" style={{fontSize: '0.9rem'}}>
                Intéressé par ce poste ? N'attendez plus !
              </p>

              {!currentUser ? (
                <div className="alert alert-info">
                  <Link to={`/login?redirect=/offers/${id}`} style={{fontWeight:'bold', textDecoration:'underline'}}>Connectez-vous</Link> pour postuler.
                </div>
              ) : Array.isArray(currentUser.roles) && currentUser.roles.includes('ROLE_CANDIDAT') ? (
                <button 
                    onClick={() => setIsApplyModalOpen(true)}
                    className="btn btn-primary w-full btn-lg"
                    style={{boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)'}}
                >
                    Postuler maintenant
                </button>
              ) : (
                <div className="alert alert-warning">Espace réservé aux candidats.</div>
              )}
            </div>

            {/* Bloc Informations Clés */}
            <div className="form-card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
                <h4 style={{fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)'}}>Détails clés</h4>
                <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                    <li style={{marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><LocationIcon /> <strong>Lieu :</strong> {offer.location}</li>
                    <li style={{marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><ContractIcon /> <strong>Contrat :</strong> {offer.contractType}</li>
                    {offer.deadline && (
                        <li style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: isUrgent(offer.deadline) ? 'var(--danger-color)' : 'inherit'}}>
                            <ClockIcon /> <strong>Limite :</strong> {getDeadlineDate(offer.deadline)}
                        </li>
                    )}
                </ul>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE CANDIDATURE (Reste inchangé) --- */}
      {isApplyModalOpen && (
          <div className="modal-overlay" onClick={() => setIsApplyModalOpen(false)}>
              <div className="modal-content-modern" onClick={e => e.stopPropagation()}>
                  <button className="modal-close-btn" onClick={() => setIsApplyModalOpen(false)} title="Fermer">
                      <CloseIcon />
                  </button>
                  
                  <h2 className="form-title" style={{textAlign:'left', fontSize: '1.5rem', marginBottom: '0.5rem'}}>Postuler à l'offre</h2>
                  <p className="page-subtitle" style={{marginBottom: '2rem', fontSize:'1rem'}}>Complétez votre dossier pour <strong>{offer.title}</strong>.</p>

                  {applySuccess ? (
                    <div className="alert alert-success">
                      <div className="alert-content" style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                        <h4>🎉 Candidature envoyée !</h4>
                        <p style={{fontSize:'0.9rem', marginTop:'0.5rem'}}>Votre candidature a bien été reçue.</p>
                        <div style={{display:'flex', gap: '1rem', width: '100%', marginTop: '1rem'}}>
                            <button onClick={() => setIsApplyModalOpen(false)} className="btn btn-outline btn-sm" style={{flex:1}}>Fermer la fenêtre</button>
                            <Link to="/my-applications" className="btn btn-primary btn-sm" style={{flex:1, textDecoration:'none', justifyContent:'center'}}>Voir mes candidatures</Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleApply} className="application-form">
                      
                      <div className="form-group" style={{marginBottom: '2rem'}}>
                        <label className="form-label" style={{fontSize: '1.1rem', marginBottom:'1rem', display:'block'}}>Votre CV (PDF) <span className="required">*</span></label>
                        <input type="file" id="cvFile" accept="application/pdf" onChange={handleFileChange} required className="hidden-input" />
                        <label htmlFor="cvFile" className={`upload-zone-modern ${cvFile ? 'has-file' : ''}`}>
                             {cvFile ? (
                                 <div className="file-selected-info">
                                     <span style={{fontSize:'1.5rem'}}>📄</span>
                                     <span>Fichier sélectionné : <strong>{cvFile.name}</strong></span>
                                 </div>
                             ) : (
                                 <>
                                     <div className="upload-icon-large">☁️</div>
                                     <div className="upload-text-main">
                                         <span className="upload-highlight">Cliquez pour parcourir</span> ou glissez votre fichier ici.
                                     </div>
                                     <div className="upload-text-sub">Format PDF uniquement. Taille maximale : 5MB.</div>
                                 </>
                             )}
                        </label>
                      </div>

                      {!fieldsLoading && Array.isArray(customFields) && customFields.length > 0 && (
                        <div className="custom-fields-container">
                          <h4 className="section-subtitle-modern">Questions de l'employeur</h4>
                          <p style={{fontSize:'0.9rem', color:'var(--text-muted)', marginBottom:'1.5rem'}}>Merci de répondre précisément aux questions suivantes.</p>
                          
                          {customFields.map(field => (
                            field && field.id && (
                              <div key={field.id} className="form-group" style={{marginBottom: '1.5rem'}}>
                                <label htmlFor={`field-${field.id}`} className="form-label" style={{fontSize: '0.95rem', fontWeight: '600', marginBottom:'0.5rem', display:'block'}}>
                                  {field.label} {field.isRequired && <span className="required" style={{color:'var(--danger-color)'}}>*</span>}
                                </label>
                                {renderFormField(field)}
                              </div>
                            )
                          ))}
                        </div>
                      )}

                      {applyError && <div className="alert alert-error" style={{marginTop: '1.5rem'}}>{applyError}</div>}

                      <div className="modal-actions">
                          <button type="button" onClick={() => setIsApplyModalOpen(false)} className="btn-modal-cancel" disabled={applyLoading}>
                              Annuler
                          </button>
                          <button type="submit" className="btn-modal-confirm" disabled={applyLoading}>
                            {applyLoading ? <><div className="spinner-small"></div> Envoi en cours...</> : 'Envoyer ma candidature ✨'}
                          </button>
                      </div>
                    </form>
                  )}
              </div>
          </div>
      )}
    </div>
  );
}

export default OfferDetailPage;