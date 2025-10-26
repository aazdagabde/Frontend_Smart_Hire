// src/pages/OfferDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import OfferService from '../services/OfferService';
import ApplicationService from '../services/ApplicationService';
import { useAuth } from '../contexts/AuthContext';

// formatDate (inchangé)
const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

function OfferDetailPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();

  // États (inchangés)
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true); // Chargement principal (offre)
  const [error, setError] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [customFields, setCustomFields] = useState([]);
  const [customData, setCustomData] = useState({});
  const [fieldsLoading, setFieldsLoading] = useState(true); // Chargement séparé pour les champs
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  // --- MODIFICATION useEffect ---
  useEffect(() => {
    const fetchOfferAndFields = async () => {
      setLoading(true);
      setFieldsLoading(true); // Active les deux chargements
      setError('');
      try {
        // 1. Récupérer l'offre
        const offerResponse = await OfferService.getOfferById(id);
        if (offerResponse.success && offerResponse.data) {
          setOffer(offerResponse.data);
        } else {
          setError(offerResponse.message || "Offre non trouvée.");
          setFieldsLoading(false); // Arrêter chargement champs si offre non trouvée
          setLoading(false);
          return;
        }

        // 2. Récupérer les champs personnalisés (avec son propre try/catch)
        try {
            const fieldsResponse = await OfferService.getCustomFields(id);
            console.log("Response getCustomFields (Candidate):", fieldsResponse); // <<< Log pour déboguer
            if (fieldsResponse.success && Array.isArray(fieldsResponse.data)) {
                setCustomFields(fieldsResponse.data);
                const initialData = {};
                fieldsResponse.data.forEach(field => {
                    if (field && field.id) {
                        initialData[field.id] = field.fieldType === 'CHECKBOX' ? [] : '';
                    }
                });
                setCustomData(initialData);
            } else {
                 setCustomFields([]); // Assurer tableau vide
            }
        } catch (fieldsErr) {
            console.warn("Could not load custom fields for candidate:", fieldsErr); // Avertissement
             setCustomFields([]); // Assurer tableau vide
        }

      } catch (err) {
        console.error("Error fetching offer details:", err);
        setError(err.message || 'Une erreur est survenue.');
      } finally {
        setLoading(false); // Arrêter chargement principal
        setFieldsLoading(false); // Arrêter chargement champs
      }
    };

    if (id) {
      fetchOfferAndFields();
    } else {
      setError("ID de l'offre manquant dans l'URL.");
      setLoading(false);
      setFieldsLoading(false);
    }
  }, [id]);
  // --- FIN MODIFICATION useEffect ---


  // --- Fonctions formulaire ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setApplyError(''); // Réinitialiser l'erreur
    if (file && file.type !== "application/pdf") {
      setApplyError("Le CV doit être au format PDF.");
      setCvFile(null);
      e.target.value = null;
    } else if (file && file.size > 5 * 1024 * 1024) { // 5MB
      setApplyError("Le fichier CV ne doit pas dépasser 5MB.");
      setCvFile(null);
      e.target.value = null;
    } else {
      setCvFile(file);
    }
  };

  const handleCustomDataChange = (fieldId, fieldType, value) => {
    setCustomData(prevData => {
        if (fieldType === 'CHECKBOX') {
            const currentValues = prevData[fieldId] || [];
            let newValues;
            if (currentValues.includes(value)) {
                // Décocher
                newValues = currentValues.filter(v => v !== value);
            } else {
                // Cocher
                newValues = [...currentValues, value];
            }
            return { ...prevData, [fieldId]: newValues };
        }
        // Pour TEXT, TEXTAREA, RADIO
        return { ...prevData, [fieldId]: value };
    });
  };

  const renderFormField = (field) => {
    const commonProps = {
        id: `field-${field.id}`,
        className: "form-input",
        required: field.isRequired,
    };

    switch (field.fieldType) {
        case 'TEXT':
            return (
                <input
                    type="text"
                    {...commonProps}
                    value={customData[field.id] || ''}
                    onChange={(e) => handleCustomDataChange(field.id, 'TEXT', e.target.value)}
                />
            );
        case 'TEXTAREA':
            return (
                <textarea
                    {...commonProps}
                    rows="5"
                    value={customData[field.id] || ''}
                    onChange={(e) => handleCustomDataChange(field.id, 'TEXTAREA', e.target.value)}
                />
            );
        case 'RADIO':
            return (
                <div style={{ padding: '0.5rem 0', color: 'var(--light-slate)' }}>
                    {field.options.split(';').map(option => (
                        <div key={option} style={{ marginBottom: '0.5rem' }}>
                            <input
                                type="radio"
                                id={`field-${field.id}-${option}`}
                                name={`field-${field.id}`} // Lien entre les radios
                                value={option}
                                checked={customData[field.id] === option}
                                onChange={(e) => handleCustomDataChange(field.id, 'RADIO', e.target.value)}
                                required={field.isRequired}
                                style={{ width: 'auto', marginRight: '0.5rem' }}
                            />
                            <label htmlFor={`field-${field.id}-${option}`}>{option}</label>
                        </div>
                    ))}
                </div>
            );
        case 'CHECKBOX':
             return (
                <div style={{ padding: '0.5rem 0', color: 'var(--light-slate)' }}>
                    {field.options.split(';').map(option => (
                        <div key={option} style={{ marginBottom: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id={`field-${field.id}-${option}`}
                                value={option}
                                checked={(customData[field.id] || []).includes(option)}
                                onChange={(e) => handleCustomDataChange(field.id, 'CHECKBOX', e.target.value)}
                                // 'required' sur un groupe de checkbox est complexe, on le gère à la soumission
                                style={{ width: 'auto', marginRight: '0.5rem' }}
                            />
                            <label htmlFor={`field-${field.id}-${option}`}>{option}</label>
                        </div>
                    ))}
                </div>
            );
        default:
            return null;
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyError('');
    setApplyLoading(true);

    // 1. Validation
    if (!cvFile) {
        setApplyError("Le CV (PDF) est obligatoire.");
        setApplyLoading(false);
        return;
    }
    // Validation des champs requis
    let validationError = false;
    for (const field of customFields) {
        if (field.isRequired) {
            const value = customData[field.id];
            if (field.fieldType === 'CHECKBOX' && (!value || value.length === 0)) {
                validationError = true;
            } else if (!value) { // TEXT, TEXTAREA, RADIO
                validationError = true;
            }
        }
        if (validationError) {
             setApplyError(`Le champ "${field.label}" est obligatoire.`);
             setApplyLoading(false);
             return;
        }
    }

    // 2. Préparation des FormData
    const formData = new FormData();
    formData.append('cv', cvFile);

    // Formater les réponses customData
    const formattedData = Object.entries(customData).map(([fieldId, value]) => ({
        fieldId: parseInt(fieldId),
        // Si c'est un tableau (CHECKBOX), joindre avec ";", sinon garder la string
        value: Array.isArray(value) ? value.join(';') : value 
    }));
    
    // Ajouter les données personnalisées en tant que chaîne JSON
    formData.append('customData', JSON.stringify(formattedData));

    // 3. Appel API
    try {
        const response = await ApplicationService.applyToOffer(id, formData);
        if (response.success) {
            setApplySuccess(true);
            setApplyError('');
        } else {
            setApplyError(response.message || "Erreur lors de la candidature.");
        }
    } catch (err) {
        console.error(err);
        setApplyError(err.message || "Une erreur est survenue.");
    } finally {
        setApplyLoading(false);
    }
  };

  // --- Rendu JSX ---
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Chargement principal */}
      {loading && <div style={{ textAlign: 'center', padding: '2rem' }}><span className="loading"></span></div>}
      {/* Erreur principale */}
      {error && !loading && <div className="message message-error">{error}</div>}

      {/* Affichage si offre chargée */}
      {!loading && !error && offer && (
        <div className="form-card" style={{ background: 'transparent', border: 'none', padding: '0' }}>
          {/* Détails de l'offre */}
          <p style={{ color: 'var(--slate)', fontSize: '0.9rem' }}>Posté le {formatDate(offer.createdAt)}</p>
          <h1 className="form-title" style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--lightest-slate)', textAlign: 'left' }}>{offer.title}</h1>
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--primary-color)', fontWeight: '500', marginBottom: '1.5rem' }}>
            <span>{offer.location}</span>
            <span>&bull;</span>
            <span>{offer.contractType}</span>
          </div>

          {/* Description de l'offre */}
          <div className="job-description" style={{ color: 'var(--slate)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
            {offer.description}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--lightest-navy)', margin: '2.5rem 0' }} />

          {/* Section Postuler */}
          <div>
            <h2 className="form-title" style={{ textAlign: 'left', fontSize: '1.5rem', color: 'var(--primary-color)' }}>Postuler à cette offre</h2>

            {/* Conditions currentUser */}
            {!currentUser ? (
                 <div className="message message-info">
                   Vous devez être <Link to={`/login?redirect=/offers/${id}`}>connecté</Link> en tant que candidat pour postuler.
                 </div>
            ) : Array.isArray(currentUser.roles) && currentUser.roles.includes('ROLE_RH') ? (
                <div className="message message-info">
                  Vous êtes connecté en tant que Recruteur. Seuls les candidats peuvent postuler.
                </div>
            ) : Array.isArray(currentUser.roles) && currentUser.roles.includes('ROLE_CANDIDAT') ? (
              <>
                {applySuccess ? (
                  <div className="message message-success">
                    <h4>Candidature envoyée !</h4>
                    <p>Votre candidature pour "{offer.title}" a été envoyée avec succès. Vous pouvez suivre son statut dans la section <Link to="/my-applications">Mes Candidatures</Link>.</p>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="form-card" style={{ background: 'var(--navy-blue)', padding: '1.5rem 2rem' }}>
                    
                    {/* Champ CV */}
                    <div className="form-group">
                      <label htmlFor="cvFile" className="form-label">Votre CV (PDF, 5MB max) <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                      <input
                        type="file"
                        id="cvFile"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        required
                        className="form-input"
                      />
                    </div>

                    {/* MODIFICATION : Affichage champs personnalisés */}
                    {/* Indicateur de chargement spécifique aux champs */}
                    {fieldsLoading && <div><span className="loading"></span> Chargement des questions...</div>}

                    {/* Afficher les champs si chargement terminé ET si customFields est un tableau */}
                    {!fieldsLoading && Array.isArray(customFields) && customFields.length > 0 && (
                        <div style={{marginTop: '1rem', borderTop: '1px solid var(--lightest-navy)', paddingTop: '1rem'}}>
                            <h4 style={{marginTop: 0, color:'var(--lightest-slate)'}}>Informations supplémentaires</h4>
                            {customFields.map(field => (
                                field && field.id ? ( // Vérification ajoutée
                                    <div key={field.id} className="form-group">
                                    <label htmlFor={`field-${field.id}`} className="form-label">
                                        {field.label}
                                        {field.isRequired && <span style={{ color: 'var(--danger-color)' }}> *</span>}
                                    </label>
                                    {renderFormField(field)}
                                    </div>
                                ) : null
                            ))}
                        </div>
                    )}
                    {/* Message si aucun champ après chargement */}
                    {!fieldsLoading && (!Array.isArray(customFields) || customFields.length === 0) && (
                         <p style={{color: 'var(--slate)', fontSize: '0.9rem', marginBottom: '1rem'}}>Aucune information supplémentaire requise.</p>
                    )}
                    {/* FIN MODIFICATION */}

                    {applyError && <div className="message message-error">{applyError}</div>}

                    <button type="submit" className="btn btn-primary" disabled={applyLoading} style={{ width: 'auto', marginTop: '1rem' }}>
                      {applyLoading && <span className="loading"></span>}
                      {applyLoading ? 'Envoi...' : 'Envoyer ma candidature'}
                    </button>
                  </form>
                )}
              </>
            ) : (
                 <div className="message message-warning">
                   Rôle utilisateur inconnu. Impossible de déterminer si vous pouvez postuler.
                 </div>
            )}
          </div>
        </div>
      )}
      {/* Fallback offre non trouvée */}
      {!loading && !error && !offer && <div className="message message-info">Offre non trouvée.</div>}
    </div>
  );
}

export default OfferDetailPage;