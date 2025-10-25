// src/pages/OfferDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import OfferService from '../services/OfferService';
import ApplicationService from '../services/ApplicationService'; // <<< AJOUTER
import { useAuth } from '../contexts/AuthContext'; // <<< AJOUTER

// Helper pour formater la date (inchangé)
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
  const { currentUser } = useAuth(); // <<< AJOUTER : Pour vérifier le rôle
  
  // État de l'offre (inchangé)
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- <<< NOUVEL ÉTAT : Pour le formulaire de candidature >>> ---
  const [cvFile, setCvFile] = useState(null);
  const [customFields, setCustomFields] = useState([]); // Champs du formulaire
  const [customData, setCustomData] = useState({}); // Réponses { fieldId: value }
  const [fieldsLoading, setFieldsLoading] = useState(true);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);
  // --- <<< FIN NOUVEL ÉTAT >>> ---


  useEffect(() => {
    const fetchOfferAndFields = async () => {
      setLoading(true);
      setFieldsLoading(true);
      setError('');
      try {
        // 1. Récupérer l'offre
        const offerResponse = await OfferService.getOfferById(id);
        if (offerResponse.success && offerResponse.data) {
          setOffer(offerResponse.data);
        } else {
          setError(offerResponse.message || "Offre non trouvée.");
        }
        
        // 2. <<< NOUVEAU : Récupérer les champs personnalisés >>>
        const fieldsResponse = await OfferService.getCustomFields(id);
        if (fieldsResponse.success && Array.isArray(fieldsResponse.data)) {
            setCustomFields(fieldsResponse.data);
            // Initialiser l'état des réponses
            const initialData = {};
            fieldsResponse.data.forEach(field => {
                if (field.fieldType === 'CHECKBOX') {
                    initialData[field.id] = []; // Utiliser un tableau pour les checkbox
                } else {
                    initialData[field.id] = ''; // String vide pour les autres
                }
            });
            setCustomData(initialData);
        }
        // (Pas d'erreur si les champs ne chargent pas, c'est peut-être normal)
        // --- <<< FIN NOUVEAU >>> ---

      } catch (err) {
        console.error(err);
        setError(err.message || 'Une erreur est survenue.');
      } finally {
        setLoading(false);
        setFieldsLoading(false); // <<< NOUVEAU
      }
    };

    fetchOfferAndFields();
  }, [id]);

  // --- <<< NOUVELLES FONCTIONS : Gestion du formulaire >>> ---

  // Gère le changement du fichier CV
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

  // Gère la saisie dans les champs personnalisés
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

  // Fonction pour afficher un champ de formulaire
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

  // Soumission de la candidature
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
  // --- <<< FIN NOUVELLES FONCTIONS >>> ---


  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}><span className="loading"></span></div>;
  }
  if (error) {
    return <div className="message message-error">{error}</div>;
  }
  if (!offer) {
    return <div className="message message-info">Offre non trouvée.</div>;
  }

  // Rendu de la page
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="form-card" style={{ background: 'transparent', border: 'none', padding: '0' }}>
        
        {/* En-tête de l'offre */}
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

        {/* --- <<< NOUVELLE SECTION POSTULER (REMPLACE L'ANCIENNE) >>> --- */}
        <div>
          <h2 className="form-title" style={{ textAlign: 'left', fontSize: '1.5rem', color: 'var(--primary-color)' }}>Postuler à cette offre</h2>

          {/* Non connecté */}
          {!currentUser && (
            <div className="message message-info">
              Vous devez être <Link to={`/login?redirect=/offers/${id}`}>connecté</Link> en tant que candidat pour postuler.
            </div>
          )}

          {/* Connecté en RH */}
          {currentUser && currentUser.roles.includes('ROLE_RH') && (
            <div className="message message-info">
              Vous êtes connecté en tant que Recruteur. Seuls les candidats peuvent postuler.
            </div>
          )}

          {/* Connecté en Candidat */}
          {currentUser && currentUser.roles.includes('ROLE_CANDIDAT') && (
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

                  {/* Champs personnalisés */}
                  {fieldsLoading && <div><span className="loading"></span> Chargement des champs...</div>}
                  
                  {!fieldsLoading && customFields.length > 0 && customFields.map(field => (
                    <div key={field.id} className="form-group">
                      <label htmlFor={`field-${field.id}`} className="form-label">
                        {field.label}
                        {field.isRequired && <span style={{ color: 'var(--danger-color)' }}> *</span>}
                      </label>
                      {renderFormField(field)}
                    </div>
                  ))}

                  {/* Message d'erreur */}
                  {applyError && <div className="message message-error">{applyError}</div>}

                  {/* Bouton Soumettre */}
                  <button type="submit" className="btn btn-primary" disabled={applyLoading} style={{ width: 'auto', marginTop: '1rem' }}>
                    {applyLoading && <span className="loading"></span>}
                    {applyLoading ? 'Envoi...' : 'Envoyer ma candidature'}
                  </button>

                </form>
              )}
            </>
          )}

        </div>
        {/* --- <<< FIN NOUVELLE SECTION POSTULER >>> --- */}

      </div>
    </div>
  );
}

export default OfferDetailPage;