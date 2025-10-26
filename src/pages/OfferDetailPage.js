// src/pages/OfferDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import OfferService from '../services/OfferService';
import ApplicationService from '../services/ApplicationService';
import { useAuth } from '../contexts/AuthContext';

// Icônes SVG
const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const ContractIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

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

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
          setFieldsLoading(false);
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
          } else {
            setCustomFields([]);
          }
        } catch (fieldsErr) {
          console.warn("Could not load custom fields for candidate:", fieldsErr);
          setCustomFields([]);
        }

      } catch (err) {
        console.error("Error fetching offer details:", err);
        setError(err.message || 'Une erreur est survenue.');
      } finally {
        setLoading(false);
        setFieldsLoading(false);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setApplyError('');
    if (file && file.type !== "application/pdf") {
      setApplyError("Le CV doit être au format PDF.");
      setCvFile(null);
      e.target.value = null;
    } else if (file && file.size > 5 * 1024 * 1024) {
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
          newValues = currentValues.filter(v => v !== value);
        } else {
          newValues = [...currentValues, value];
        }
        return { ...prevData, [fieldId]: newValues };
      }
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
          <div className="radio-group">
            {field.options.split(';').map(option => (
              <div key={option} className="radio-option">
                <input
                  type="radio"
                  id={`field-${field.id}-${option}`}
                  name={`field-${field.id}`}
                  value={option}
                  checked={customData[field.id] === option}
                  onChange={(e) => handleCustomDataChange(field.id, 'RADIO', e.target.value)}
                  required={field.isRequired}
                  className="radio-input"
                />
                <label htmlFor={`field-${field.id}-${option}`} className="radio-label">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
      case 'CHECKBOX':
        return (
          <div className="checkbox-group">
            {field.options.split(';').map(option => (
              <div key={option} className="checkbox-option">
                <input
                  type="checkbox"
                  id={`field-${field.id}-${option}`}
                  value={option}
                  checked={(customData[field.id] || []).includes(option)}
                  onChange={(e) => handleCustomDataChange(field.id, 'CHECKBOX', e.target.value)}
                  className="checkbox-input"
                />
                <label htmlFor={`field-${field.id}-${option}`} className="checkbox-label">
                  {option}
                </label>
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

    if (!cvFile) {
      setApplyError("Le CV (PDF) est obligatoire.");
      setApplyLoading(false);
      return;
    }

    let validationError = false;
    for (const field of customFields) {
      if (field.isRequired) {
        const value = customData[field.id];
        if (field.fieldType === 'CHECKBOX' && (!value || value.length === 0)) {
          validationError = true;
        } else if (!value) {
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
      console.error(err);
      setApplyError(err.message || "Une erreur est survenue.");
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <Link to="/offers" className="btn btn-outline btn-sm">
          ← Retour aux offres
        </Link>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Chargement de l'offre...</p>
        </div>
      )}

      {error && !loading && (
        <div className="alert alert-error">
          <div className="alert-content">
            {error}
          </div>
        </div>
      )}

      {!loading && !error && offer && (
        <div className="offer-detail-layout">
          {/* Colonne principale - Détails de l'offre */}
          <div className="offer-detail-main">
            <div className="form-card">
              <div className="offer-header">
                <div className="offer-meta">
                  <span className="offer-date">
                    <CalendarIcon />
                    Posté le {formatDate(offer.createdAt)}
                  </span>
                </div>
                
                <h1 className="offer-title">{offer.title}</h1>
                
                <div className="offer-tags">
                  <span className="offer-tag">
                    <LocationIcon />
                    {offer.location}
                  </span>
                  <span className="offer-tag">
                    <ContractIcon />
                    {offer.contractType}
                  </span>
                </div>
              </div>

              <div className="offer-content">
                <div className="description-section">
                  <h3 className="section-title">Description du poste</h3>
                  <div className="description-text">
                    {offer.description}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne latérale - Formulaire de candidature */}
          <div className="offer-detail-sidebar">
            <div className="form-card">
              <h3 className="section-title">Postuler à cette offre</h3>

              {!currentUser ? (
                <div className="alert alert-info">
                  <div className="alert-content">
                    Vous devez être <Link to={`/login?redirect=/offers/${id}`}>connecté</Link> en tant que candidat pour postuler.
                  </div>
                </div>
              ) : Array.isArray(currentUser.roles) && currentUser.roles.includes('ROLE_RH') ? (
                <div className="alert alert-info">
                  <div className="alert-content">
                    Vous êtes connecté en tant que Recruteur. Seuls les candidats peuvent postuler.
                  </div>
                </div>
              ) : Array.isArray(currentUser.roles) && currentUser.roles.includes('ROLE_CANDIDAT') ? (
                <>
                  {applySuccess ? (
                    <div className="alert alert-success">
                      <div className="alert-content">
                        <h4>🎉 Candidature envoyée !</h4>
                        <p>Votre candidature pour <strong>"{offer.title}"</strong> a été envoyée avec succès.</p>
                        <p className="mt-2">
                          <Link to="/my-applications" className="btn btn-outline btn-sm">
                            Voir mes candidatures
                          </Link>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleApply} className="application-form">
                      <div className="form-group">
                        <label htmlFor="cvFile" className="form-label">
                          <DocumentIcon />
                          Votre CV (PDF, 5MB max) <span className="required">*</span>
                        </label>
                        <input
                          type="file"
                          id="cvFile"
                          accept="application/pdf"
                          onChange={handleFileChange}
                          required
                          className="form-input"
                        />
                        <div className="form-hint">
                          Format PDF accepté uniquement, taille max: 5MB
                        </div>
                      </div>

                      {fieldsLoading && (
                        <div className="loading-state">
                          <div className="spinner-small"></div>
                          <p>Chargement des questions...</p>
                        </div>
                      )}

                      {!fieldsLoading && Array.isArray(customFields) && customFields.length > 0 && (
                        <div className="custom-fields-section">
                          <h4 className="section-subtitle">Informations supplémentaires</h4>
                          {customFields.map(field => (
                            field && field.id && (
                              <div key={field.id} className="form-group">
                                <label htmlFor={`field-${field.id}`} className="form-label">
                                  {field.label}
                                  {field.isRequired && <span className="required"> *</span>}
                                </label>
                                {renderFormField(field)}
                              </div>
                            )
                          ))}
                        </div>
                      )}

                      {!fieldsLoading && (!Array.isArray(customFields) || customFields.length === 0) && (
                        <div className="alert alert-info">
                          <div className="alert-content">
                            Aucune information supplémentaire requise.
                          </div>
                        </div>
                      )}

                      {applyError && (
                        <div className="alert alert-error">
                          <div className="alert-content">
                            {applyError}
                          </div>
                        </div>
                      )}

                      <button 
                        type="submit" 
                        className="btn btn-primary w-full" 
                        disabled={applyLoading}
                      >
                        {applyLoading ? (
                          <>
                            <div className="spinner-small"></div>
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <DocumentIcon />
                            Envoyer ma candidature
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </>
              ) : (
                <div className="alert alert-warning">
                  <div className="alert-content">
                    Rôle utilisateur inconnu. Impossible de déterminer si vous pouvez postuler.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!loading && !error && !offer && (
        <div className="alert alert-info">
          <div className="alert-content">
            Offre non trouvée.
          </div>
        </div>
      )}
    </div>
  );
}

export default OfferDetailPage;