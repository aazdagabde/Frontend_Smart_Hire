// src/pages/OfferCreateEditPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import OfferService from '../services/OfferService';

// <<< NOUVEAU : Icône de suppression (SVG simple) >>>
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer', color: 'var(--danger-color)' }}>
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

function OfferCreateEditPage() {
  const { offerId } = useParams(); // Récupère l'ID de l'URL
  const navigate = useNavigate();
  const isEditMode = Boolean(offerId);

  // --- État pour le formulaire principal de l'offre ---
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    contractType: 'CDI',
    status: 'DRAFT',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // --- <<< NOUVEAU : État pour les champs personnalisés >>> ---
  const [customFields, setCustomFields] = useState([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [fieldsError, setFieldsError] = useState('');
  const [fieldAddingLoading, setFieldAddingLoading] = useState(false);
  
  // État pour le formulaire d'ajout de *nouveau* champ
  const [newField, setNewField] = useState({
      label: '',
      fieldType: 'TEXT', // Valeur par défaut
      options: '',
      isRequired: false
  });
  // --- <<< FIN NOUVEL ÉTAT >>> ---


  // --- Chargement de l'offre (si mode édition) ---
  useEffect(() => {
    if (isEditMode) {
      setLoading(true); // Active le chargement principal
      OfferService.getOfferById(offerId)
        .then(response => {
          if (response.success && response.data) {
            setFormData(response.data); // Pré-remplit le formulaire
          } else {
            setMessage(response.message || "Offre non trouvée.");
          }
        })
        .catch(err => {
          console.error(err);
          setMessage(err.message || "Erreur lors du chargement de l'offre.");
        })
        .finally(() => {
          setLoading(false); // Désactive le chargement principal
        });

      // <<< NOUVEAU : Chargement des champs personnalisés (uniquement en mode édition) >>>
      setFieldsLoading(true);
      setFieldsError('');
      OfferService.getCustomFields(offerId)
        .then(response => {
            if (response.success && Array.isArray(response.data)) {
                setCustomFields(response.data);
            } else {
                setFieldsError(response.message || "Erreur chargement des champs.");
            }
        })
        .catch(err => {
            console.error(err);
            setFieldsError(err.message || "Erreur chargement des champs.");
        })
        .finally(() => {
            setFieldsLoading(false);
        });
      // --- <<< FIN NOUVEAU USEEFFECT >>> ---
    }
  }, [offerId, isEditMode]);

  // --- Gestionnaires pour le formulaire principal (inchangés) ---
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const apiCall = isEditMode
        ? OfferService.updateOffer(offerId, formData)
        : OfferService.createOffer(formData);
      
      const apiResponse = await apiCall;

      setMessage(apiResponse.message || (isEditMode ? "Offre mise à jour !" : "Offre créée !"));
      setIsSuccess(true);

      if (!isEditMode) {
        // Si c'est une création, rediriger vers la page de gestion après succès
        setTimeout(() => {
          navigate('/offers/manage');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Une erreur est survenue.");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };


  // --- <<< NOUVEAU : Gestionnaires pour les champs personnalisés >>> ---

  // Gère la saisie dans le formulaire d'ajout de champ
  const handleNewFieldChange = (e) => {
    const { id, value, type, checked } = e.target;
    setNewField(prev => ({
        ...prev,
        [id]: type === 'checkbox' ? checked : value
    }));
  };

  // Soumission du formulaire d'ajout de champ
  const handleAddField = async (e) => {
    e.preventDefault();
    if (!newField.label || !newField.fieldType) {
        setFieldsError("Le libellé et le type sont obligatoires.");
        return;
    }
    // Validation pour radio/checkbox
    if (['RADIO', 'CHECKBOX'].includes(newField.fieldType) && !newField.options) {
        setFieldsError("Les options (séparées par ';') sont obligatoires pour ce type de champ.");
        return;
    }

    setFieldAddingLoading(true);
    setFieldsError('');

    try {
        const fieldData = {
            ...newField,
            // Assurer que les options sont null si non applicables
            options: ['RADIO', 'CHECKBOX'].includes(newField.fieldType) ? newField.options : null
        };

        const response = await OfferService.createCustomField(offerId, fieldData);

        if (response.success && response.data) {
            // Ajouter le nouveau champ à la liste locale
            setCustomFields(prev => [...prev, response.data]);
            // Réinitialiser le formulaire d'ajout
            setNewField({ label: '', fieldType: 'TEXT', options: '', isRequired: false });
        } else {
            setFieldsError(response.message || "Erreur lors de l'ajout.");
        }
    } catch (err) {
        console.error(err);
        setFieldsError(err.message || "Erreur lors de l'ajout du champ.");
    } finally {
        setFieldAddingLoading(false);
    }
  };

  // Suppression d'un champ
  const handleDeleteField = async (fieldId) => {
    // Demande de confirmation
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce champ ? Les réponses associées seront perdues.")) {
        return;
    }

    setFieldsError(''); // Réinitialise l'erreur

    try {
        const response = await OfferService.deleteCustomField(offerId, fieldId);
        if (response.success) {
            // Mettre à jour l'état en filtrant le champ supprimé
            setCustomFields(prev => prev.filter(field => field.id !== fieldId));
        } else {
             setFieldsError(response.message || "Erreur lors de la suppression.");
        }
    } catch (err) {
        console.error(err);
        setFieldsError(err.message || "Erreur lors de la suppression du champ.");
    }
  };
  // --- <<< FIN NOUVEAUX GESTIONNAIRES >>> ---


  return (
    <div className="form-card" style={{ maxWidth: '800px' }}>
      <h2 className="form-title">{isEditMode ? "Modifier l'offre" : "Créer une offre"}</h2>
      <Link to="/offers/manage" style={{ display: 'inline-block', marginBottom: '1rem', color: 'var(--primary-color)' }}>
        &larr; Retour à la gestion
      </Link>

      {/* --- Formulaire Principal (Offre) --- */}
      <form onSubmit={handleSubmit}>
        
        {/* Titre */}
        <div className="form-group">
          <label htmlFor="title" className="form-label">Titre de l'offre</label>
          <input type="text" id="title" className="form-input" value={formData.title} onChange={handleChange} placeholder="Ex: Développeur Full-Stack" required />
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea id="description" className="form-input" value={formData.description} onChange={handleChange} rows="8" placeholder="Détail des missions, profil recherché..." required minLength="20"></textarea>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {/* Localisation */}
            <div className="form-group">
              <label htmlFor="location" className="form-label">Localisation</label>
              <input type="text" id="location" className="form-input" value={formData.location} onChange={handleChange} placeholder="Ex: Casablanca" required />
            </div>

            {/* Type de contrat */}
            <div className="form-group">
              <label htmlFor="contractType" className="form-label">Type de contrat</label>
              <select id="contractType" className="form-input" value={formData.contractType} onChange={handleChange}>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="STAGE">STAGE</option>
                <option value="ALTERNANCE">ALTERNANCE</option>
                <option value="FREELANCE">FREELANCE</option>
              </select>
            </div>

            {/* Statut (Brouillon/Publiée) */}
            <div className="form-group">
              <label htmlFor="status" className="form-label">Statut</label>
              <select id="status" className="form-input" value={formData.status} onChange={handleChange}>
                <option value="DRAFT">Brouillon (Non visible)</option>
                <option value="PUBLISHED">Publiée (Visible)</option>
                <option value="ARCHIVED">Archivée (Non visible)</option>
              </select>
            </div>
        </div>

        {message && (
          <div className={`message ${isSuccess ? 'message-success' : 'message-error'}`} style={{ marginTop: '1rem' }}>
            {message}
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem', width: 'auto' }}>
          {loading && <span className="loading"></span>}
          {isEditMode ? (loading ? 'Mise à jour...' : 'Mettre à jour') : (loading ? 'Création...' : 'Créer l\'offre')}
        </button>
      </form>
      {/* --- Fin Formulaire Principal --- */}


      {/* --- <<< NOUVEAU : Section Champs Personnalisés (Mode Édition seulement) >>> --- */}
      {isEditMode && (
        <fieldset style={{ border: '1px solid var(--lightest-navy)', borderRadius: 'var(--border-radius)', padding: '1.5rem', marginTop: '2.5rem' }}>
          <legend style={{ color: 'var(--primary-color)', padding: '0 0.5rem' }}>Champs de candidature personnalisés</legend>
          
          <p style={{ color: 'var(--slate)', fontSize: '0.9rem', marginTop: '-0.5rem', marginBottom: '1.5rem' }}>
            Ajoutez des questions spécifiques (lettre de motivation, portfolio, etc.) que le candidat devra remplir.
          </p>

          {/* Liste des champs existants */}
          {fieldsLoading && <div><span className="loading"></span> Chargement des champs...</div>}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {customFields.length > 0 ? (
              customFields.map(field => (
                <div key={field.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(100, 255, 218, 0.05)', padding: '0.75rem 1rem', borderRadius: 'var(--border-radius)' }}>
                  <div>
                    <span style={{ color: 'var(--lightest-slate)', fontWeight: '500' }}>{field.label}</span>
                    <span style={{ color: 'var(--slate)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>({field.fieldType}{field.isRequired ? ', Requis' : ''})</span>
                  </div>
                  <button onClick={() => handleDeleteField(field.id)} title="Supprimer ce champ" style={{ background: 'none', border: 'none' }}>
                    <TrashIcon />
                  </button>
                </div>
              ))
            ) : (
              !fieldsLoading && <p style={{ color: 'var(--slate)', fontSize: '0.9rem' }}>Aucun champ personnalisé pour cette offre.</p>
            )}
          </div>

          {/* Formulaire d'ajout d'un nouveau champ */}
          <form onSubmit={handleAddField} style={{ background: 'var(--navy-blue)', padding: '1rem', borderRadius: 'var(--border-radius)' }}>
             <h4 style={{ color: 'var(--lightest-slate)', marginTop: '0', marginBottom: '1rem' }}>Ajouter un nouveau champ</h4>
             <div className="form-group">
                <label htmlFor="label" className="form-label" style={{fontSize: '0.8rem'}}>Libellé (Question)</label>
                <input
                    type="text"
                    id="label"
                    className="form-input"
                    value={newField.label}
                    onChange={handleNewFieldChange}
                    placeholder="Ex: Lien vers votre portfolio"
                />
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                    <label htmlFor="fieldType" className="form-label" style={{fontSize: '0.8rem'}}>Type de champ</label>
                    <select id="fieldType" className="form-input" value={newField.fieldType} onChange={handleNewFieldChange}>
                        <option value="TEXT">Texte (court)</option>
                        <option value="TEXTAREA">Texte (long / Motivation)</option>
                        <option value="RADIO">Choix unique (Radio)</option>
                        <option value="CHECKBOX">Choix multiples (Checkbox)</option>
                    </select>
                </div>
                
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.5rem' }}>
                    <input
                        type="checkbox"
                        id="isRequired"
                        checked={newField.isRequired}
                        onChange={handleNewFieldChange}
                        style={{ width: 'auto', marginRight: '0.5rem' }}
                    />
                    <label htmlFor="isRequired" className="form-label" style={{ marginBottom: 0 }}>Requis ?</label>
                </div>
             </div>

            {/* Champ 'Options' (conditionnel) */}
            {['RADIO', 'CHECKBOX'].includes(newField.fieldType) && (
                 <div className="form-group">
                    <label htmlFor="options" className="form-label" style={{fontSize: '0.8rem'}}>Options (séparées par un point-virgule ";")</label>
                    <input
                        type="text"
                        id="options"
                        className="form-input"
                        value={newField.options}
                        onChange={handleNewFieldChange}
                        placeholder="Ex: Oui;Non;Peut-être"
                    />
                </div>
            )}
            
            {fieldsError && <div className="message message-error">{fieldsError}</div>}

            <button type="submit" className="btn" disabled={fieldAddingLoading} style={{ width: 'auto', background: 'var(--light-slate)', color: 'var(--navy-blue)', fontSize: '0.9rem' }}>
                {fieldAddingLoading && <span className="loading"></span>}
                Ajouter ce champ
            </button>
          </form>

        </fieldset>
      )}
      {/* --- <<< FIN NOUVELLE SECTION >>> --- */}

    </div>
  );
}

export default OfferCreateEditPage;