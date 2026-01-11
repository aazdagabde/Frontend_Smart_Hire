// src/pages/OfferCreateEditPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import OfferService from '../../services/OfferService';

// Icônes SVG
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

// Copié depuis OfferDetailPage.js pour cohérence
const DocumentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

function OfferCreateEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [offerData, setOfferData] = useState({ 
    title: '', 
    description: '', 
    location: '', 
    contractType: 'CDI', 
    status: 'DRAFT' ,
    deadline: ''
  });
  
  // NOUVEAU : State pour l'image
  const [selectedImage, setSelectedImage] = useState(null);

  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [customFields, setCustomFields] = useState([]);
  const [fieldsLoading, setFieldsLoading] = useState(isEditMode);
  const [fieldsError, setFieldsError] = useState('');
  const [fieldActionLoading, setFieldActionLoading] = useState(false);
  const [newField, setNewField] = useState({ 
    label: '', 
    fieldType: 'TEXT', 
    options: '', 
    isRequired: false 
  });
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const initialOfferState = { 
      title: '', 
      description: '', 
      location: '', 
      contractType: 'CDI', 
      status: 'DRAFT' 
    };
    
    if (isEditMode && id) {
      setLoading(true);
      setError('');
      OfferService.getOfferDetailsForEdit(id)
        .then(response => {
          if (response.success && response.data) {
            const d = response.data;
            setOfferData({ 
              title: d.title || '', 
              description: d.description || '', 
              location: d.location || '', 
              contractType: d.contractType || 'CDI', 
              status: d.status || 'DRAFT' 
            });
          } else {
            setError(`Erreur chargement offre: ${response.message || 'Non trouvée/Accès refusé'}`);
            setOfferData(initialOfferState);
          }
        })
        .catch(err => {
          console.error("Erreur getOfferDetailsForEdit:", err);
          setError(`Erreur chargement offre: ${err.message || err}`);
          setOfferData(initialOfferState);
        })
        .finally(() => setLoading(false));
    } else {
      setOfferData(initialOfferState);
      setLoading(false);
    }
  }, [id, isEditMode]);

  useEffect(() => {
    const fetchCustomFields = async () => {
      setFieldsLoading(true);
      setFieldsError('');
      try {
        const response = await OfferService.getCustomFields(id);
        if (response.success && Array.isArray(response.data)) {
          const sanitized = response.data.map(f => ({
            ...f, 
            options: (f && typeof f.options === 'string') ? f.options : null 
          }));
          setCustomFields(sanitized);
        } else {
          setCustomFields([]);
          if (!response.success && response.message) setFieldsError(response.message);
        }
      } catch (err) {
        console.error("Erreur chargement champs:", err);
        setCustomFields([]);
        if (!err.message || !err.message.toLowerCase().includes('not found')) {
          setFieldsError(err.message || "Erreur chargement champs.");
        }
      } finally {
        setFieldsLoading(false);
      }
    };
    
    if (isEditMode && id) {
      fetchCustomFields();
    } else {
      setFieldsLoading(false);
      setCustomFields([]);
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setOfferData({ ...offerData, [e.target.id]: e.target.value });
  };

  const showActionMessage = (text, type = 'success') => {
    setActionMessage({ text, type });
    if (type === 'success') {
      if (text.includes('offre')) setError('');
      if (text.includes('Champ')) setFieldsError('');
    }
    setTimeout(() => setActionMessage({ text: '', type: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionMessage({ text: '', type: '' });
    setLoading(true);
    const payload = { ...offerData };

    try {
      let response;
      let currentOfferId; // Pour stocker l'ID de l'offre (créée ou éditée)

      if (isEditMode) {
        response = await OfferService.updateOffer(id, payload);
        currentOfferId = id;
      } else {
        response = await OfferService.createOffer(payload);
        // Récupérer l'ID de la nouvelle offre
        if (response.success && response.data && response.data.id) {
            currentOfferId = response.data.id;
        }
      }

      if (response.success) {
        
        // MODIFICATION : Upload de l'image si sélectionnée
        if (selectedImage && currentOfferId) {
            try {
                await OfferService.uploadOfferImage(currentOfferId, selectedImage);
            } catch (imageErr) {
                console.error("Erreur upload image:", imageErr);
                // On affiche une alerte mais on ne bloque pas la redirection
                showActionMessage("Offre sauvegardée, mais erreur lors de l'envoi de l'image.", "warning");
            }
        }

        let nextUrl = '/offers/manage';
        // Si on vient de créer une offre (pas en mode edit), on redirige vers l'édition de cette offre
        if (!isEditMode && currentOfferId) {
          nextUrl = `/offers/edit/${currentOfferId}`;
        }

        const successMsg = isEditMode ? 'Offre mise à jour !' : 'Offre créée !';
        showActionMessage(successMsg, 'success');
        setTimeout(() => navigate(nextUrl), 1500);
      } else {
        setError(response.message || `Erreur lors de la ${isEditMode ? 'mise à jour' : 'création'}`);
      }
    } catch (err) {
      console.error("Erreur submit offre:", err);
      setError(`Erreur: ${err.message || 'Inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNewFieldChange = (e) => {
    const { id: fieldId, value, type, checked } = e.target;
    setNewField(prev => ({ 
      ...prev, 
      [fieldId]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleAddField = async (e) => {
    e.preventDefault();
    if (!newField.label || !newField.fieldType) {
      showActionMessage("Libellé et type requis.", 'error');
      return;
    }
    
    if (['RADIO', 'CHECKBOX'].includes(newField.fieldType) && (!newField.options || newField.options.trim() === '')) {
      showActionMessage("Options requises pour ce type.", 'error');
      return;
    }

    setFieldActionLoading(true);
    setFieldsError('');
    setActionMessage({ text: '', type: '' });
    
    try {
      const fieldData = { 
        ...newField, 
        options: ['RADIO', 'CHECKBOX'].includes(newField.fieldType) ? newField.options : null 
      };
      const response = await OfferService.createCustomField(id, fieldData);
      
      if (response.success && response.data) {
        setCustomFields(prev => [...prev, response.data]);
        setNewField({ label: '', fieldType: 'TEXT', options: '', isRequired: false });
        showActionMessage('Champ ajouté !', 'success');
      } else {
        setFieldsError(response.message || "Erreur ajout.");
        showActionMessage(response.message || "Erreur ajout.", 'error');
      }
    } catch (err) {
      console.error("Erreur ajout champ:", err);
      setFieldsError(err.message || "Erreur ajout.");
      showActionMessage(err.message || "Erreur ajout.", 'error');
    } finally {
      setFieldActionLoading(false);
    }
  };

  const handleDeleteField = async (fieldIdToDelete) => {
    if (!window.confirm("Supprimer ce champ ?")) return;
    setFieldsError('');
    setActionMessage({ text: '', type: '' });
    setFieldActionLoading(true);
    
    try {
      const response = await OfferService.deleteCustomField(id, fieldIdToDelete);
      if (response.success || response.status === 204) {
        setCustomFields(prev => prev.filter(field => field.id !== fieldIdToDelete));
        showActionMessage('Champ supprimé !', 'success');
      } else {
        setFieldsError(response.message || "Erreur suppression.");
        showActionMessage(response.message || "Erreur suppression.", 'error');
      }
    } catch (err) {
      console.error("Erreur suppression champ:", err);
      setFieldsError(err.message || "Erreur suppression.");
      showActionMessage(err.message || "Erreur suppression.", 'error');
    } finally {
      setFieldActionLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Chargement de l'offre...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="page-title">
              {isEditMode ? 'Modifier l\'offre' : 'Créer une offre'}
            </h1>
            <p className="page-subtitle">
              {isEditMode ? 'Modifiez les détails de votre offre' : 'Remplissez les détails de votre nouvelle offre'}
            </p>
          </div>
          <Link to="/offers/manage" className="btn btn-outline">
            ← Retour aux offres
          </Link>
        </div>
      </div>

      <div className="form-layout">
        <div className="form-main">
          {/* Carte principale */}
          <div className="form-card full-width"> 
            {actionMessage.text && (
              <div className={`alert alert-${actionMessage.type === 'success' ? 'success' : 'error'}`}>
                <div className="alert-content">
                  {actionMessage.text}
                </div>
              </div>
            )}
            
            {error && !actionMessage.text && (
              <div className="alert alert-error">
                <div className="alert-content">
                  {error}
                </div>
              </div>
            )}

            <div className="form-section-header">
              <DocumentIcon />
              <h3 className="form-section-title">Informations principales</h3>
            </div>
            <p className="form-section-description">
              Définissez les informations de base de votre offre d'emploi.
            </p>

            {(!loading || !isEditMode) && (
              <form onSubmit={handleSubmit} className="offer-form">
                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    Titre de l'offre <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="form-input"
                    value={offerData.title}
                    onChange={handleChange}
                    required
                    minLength="5"
                    placeholder="Ex: Développeur Full Stack React/Node.js"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Description <span className="required">*</span>
                  </label>
                  <textarea
                    id="description"
                    className="form-input"
                    value={offerData.description}
                    onChange={handleChange}
                    rows="8"
                    required
                    minLength="20"
                    placeholder="Décrivez en détail le poste, les missions, les compétences requises..."
                  ></textarea>
                </div>

                {/* NOUVEAU : Champ pour l'image */}
                <div className="form-group">
                  <label htmlFor="image" className="form-label">
                    Image de l'offre (Optionnel)
                  </label>
                  <input
                    type="file"
                    id="image"
                    className="form-input"
                    accept="image/*"
                    onChange={(e) => setSelectedImage(e.target.files[0])}
                  />
                  <p className="form-hint">Une image attrayante pour la liste des offres (minuature).</p>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="location" className="form-label">
                      Lieu <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="location"
                      className="form-input"
                      value={offerData.location}
                      onChange={handleChange}
                      required
                      placeholder="Ex: Paris, Toulouse, Télétravail..."
                    />
                  </div>

                    <div className="form-group">
                      <label htmlFor="deadline" className="form-label">
                        Date limite de candidature
                      </label>
                      <input
                        type="date"
                        id="deadline"
                        className="form-input"
                        value={offerData.deadline || ''}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]} // Empêcher dates passées
                      />
                      <p className="form-hint">Après cette date, vous pourrez utiliser la sélection automatique.</p>
                    </div>

                  <div className="form-group">
                    <label htmlFor="contractType" className="form-label">
                      Type de contrat
                    </label>
                    <select
                      id="contractType"
                      className="form-input"
                      value={offerData.contractType}
                      onChange={handleChange}
                    >
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="STAGE">Stage</option>
                      <option value="ALTERNANCE">Alternance</option>
                      <option value="FREELANCE">Freelance</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="status" className="form-label">
                      Statut
                    </label>
                    <select
                      id="status"
                      className="form-input"
                      value={offerData.status}
                      onChange={handleChange}
                    >
                      <option value="DRAFT">Brouillon</option>
                      <option value="PUBLISHED">Publiée</option>
                      <option value="ARCHIVED">Archivée</option>
                    </select>
                  </div>
                </div>
                

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => navigate('/offers/manage')}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="spinner-small"></div>
                        {isEditMode ? 'Mise à jour...' : 'Création...'}
                      </>
                    ) : (
                      isEditMode ? 'Mettre à jour' : 'Créer l\'offre'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {isEditMode && (
            // Carte des champs personnalisés
            <div className="form-card full-width">
              <div className="form-section-header">
                <SettingsIcon />
                <h3 className="form-section-title">Champs personnalisés</h3>
              </div>
              
              <p className="form-section-description">
                Ajoutez des questions spécifiques pour les candidats
              </p>

              {fieldsLoading && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Chargement des champs...</p>
                </div>
              )}

              {fieldsError && !actionMessage.text && (
                <div className="alert alert-error">
                  <div className="alert-content">
                    {fieldsError}
                  </div>
                </div>
              )}

              {!fieldsLoading && (
                <>
                  {Array.isArray(customFields) && customFields.length > 0 ? (
                    <div className="custom-fields-list">
                      <h4>Champs existants</h4>
                      {customFields.map(field => (
                        field?.id && (
                          <div key={field.id} className="custom-field-item">
                            <div className="field-info">
                              <span className="field-label">{field.label}</span>
                              <span className="field-type">
                                {field.fieldType}
                                {field.isRequired && <span className="field-required"> • Requis</span>}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteField(field.id)}
                              className="btn btn-danger btn-sm"
                              disabled={fieldActionLoading}
                              title="Supprimer"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        )
                      ))}
                    </div>
                  ) : (
                    !fieldsError && (
                      <div className="empty-state empty-state-small">
                        <p>Aucun champ personnalisé</p>
                      </div>
                    )
                  )}

                  <div className="add-field-section">
                    <h4>Ajouter un champ</h4>
                    <form onSubmit={handleAddField} className="add-field-form">
                      <div className="form-grid">
                        <div className="form-group">
                          <label htmlFor="label" className="form-label">
                            Libellé <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            id="label"
                            className="form-input"
                            value={newField.label}
                            onChange={handleNewFieldChange}
                            required
                            placeholder="Ex: Disponibilité, Salaire attendu..."
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="fieldType" className="form-label">
                            Type <span className="required">*</span>
                          </label>
                          <select
                            id="fieldType"
                            className="form-input"
                            value={newField.fieldType}
                            onChange={handleNewFieldChange}
                          >
                            <option value="TEXT">Texte court</option>
                            <option value="TEXTAREA">Texte long</option>
                            <option value="RADIO">Choix unique</option>
                            <option value="CHECKBOX">Choix multiples</option>
                          </select>
                        </div>
                      </div>

                      {['RADIO', 'CHECKBOX'].includes(newField.fieldType) && (
                        <div className="form-group">
                          <label htmlFor="options" className="form-label">
                            Options <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            id="options"
                            className="form-input"
                            value={newField.options}
                            onChange={handleNewFieldChange}
                            required
                            placeholder="Séparées par des points-virgules (;)"
                          />
                          <div className="form-hint">
                            Ex: Option 1;Option 2;Option 3
                          </div>
                        </div>
                      )}

                      <div className="form-group-inline">
                        <input
                          type="checkbox"
                          id="isRequired"
                          checked={newField.isRequired}
                          onChange={handleNewFieldChange}
                          className="checkbox"
                        />
                        <label htmlFor="isRequired" className="form-label">
                          Champ obligatoire
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-outline"
                        disabled={fieldActionLoading}
                      >
                        {fieldActionLoading ? (
                          <>
                            <div className="spinner-small"></div>
                            Ajout...
                          </>
                        ) : (
                          <>
                            <PlusIcon />
                            Ajouter le champ
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OfferCreateEditPage;