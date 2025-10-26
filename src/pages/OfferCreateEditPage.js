// src/pages/OfferCreateEditPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Ajout de Link
import OfferService from '../services/OfferService';

// Icône de suppression
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer', color: 'var(--danger-color)' }}>
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

function OfferCreateEditPage() {
  // Gardons 'id' comme dans ton code fonctionnel, car useParams le retourne ainsi pour cette route
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id); // Renommé pour clarté

  // --- État formulaire principal (comme ton ancien code) ---
  const [offerData, setOfferData] = useState({
    title: '', description: '', location: '', contractType: 'CDI', status: 'DRAFT',
  });
  const [loading, setLoading] = useState(isEditMode); // Chargement principal
  const [error, setError] = useState(''); // Erreur principale
  const [pageTitle, setPageTitle] = useState(isEditMode ? 'Modifier l\'offre' : 'Créer une nouvelle offre');

  // --- NOUVEL ÉTAT : Champs personnalisés ---
  const [customFields, setCustomFields] = useState([]);
  const [fieldsLoading, setFieldsLoading] = useState(isEditMode); // Charger si en édition
  const [fieldsError, setFieldsError] = useState(''); // Erreur spécifique aux champs
  const [fieldActionLoading, setFieldActionLoading] = useState(false); // Pour ajout/suppression
  const [newField, setNewField] = useState({
      label: '', fieldType: 'TEXT', options: '', isRequired: false
  });
  const [fieldActionMessage, setFieldActionMessage] = useState(''); // Message succès ajout/suppression

  // --- Chargement de l'offre (basé sur ton code fonctionnel) ---
  useEffect(() => {
    const initialOfferState = { title: '', description: '', location: '', contractType: 'CDI', status: 'DRAFT' };

    if (isEditMode && id) {
      setPageTitle('Modifier l\'offre');
      setLoading(true);
      OfferService.getOfferById(id) // Utilise l'ID de useParams
        .then(response => { // Utilise la structure {success, data, message}
          if (response.success && response.data) {
            const fetchedData = response.data;
            setOfferData({ // S'assurer que les valeurs ne sont pas null/undefined
              title: fetchedData.title || '',
              description: fetchedData.description || '',
              location: fetchedData.location || '',
              contractType: fetchedData.contractType || 'CDI',
              status: fetchedData.status || 'DRAFT'
            });
          } else {
             setError(`Impossible de charger l'offre: ${response.message || 'Données non trouvées'}`);
             setOfferData(initialOfferState); // Reset si erreur
          }
        })
        .catch(err => {
            console.error("Erreur chargement offre:", err);
            setError(`Impossible de charger l'offre: ${err.message || err}`);
            setOfferData(initialOfferState); // Reset si erreur
        })
        .finally(() => setLoading(false));
    } else {
      setOfferData(initialOfferState);
      setPageTitle('Créer une nouvelle offre');
      setLoading(false); // Pas de chargement en création
    }
  }, [id, isEditMode]); // Dépendances correctes

  // --- NOUVEAU : Chargement des champs personnalisés (séparé) ---
  useEffect(() => {
    const fetchCustomFields = async () => {
        setFieldsLoading(true); setFieldsError('');
        console.log(`Fetching custom fields for offer id: ${id}`); // Log ID
        try {
            const response = await OfferService.getCustomFields(id); // Utilise l'ID de useParams
            console.log("Response getCustomFields (HR):", response); // Log réponse
            if (response.success && Array.isArray(response.data)) {
                const sanitized = response.data.map(f => ({...f, options: (f && typeof f.options === 'string') ? f.options : null }));
                setCustomFields(sanitized);
            } else { setCustomFields([]); } // Si succès mais data invalide, tableau vide
        } catch (err) {
            console.error("Erreur chargement champs:", err);
            setCustomFields([]); // Tableau vide en cas d'erreur
            // Afficher l'erreur seulement si ce n'est pas juste "non trouvé"
            if (!err.message || !err.message.toLowerCase().includes('not found')) {
              setFieldsError(err.message || "Erreur chargement des champs.");
            }
        } finally { setFieldsLoading(false); }
    };

    if (isEditMode && id) { fetchCustomFields(); }
    else { setFieldsLoading(false); setCustomFields([]); } // Pas de chargement en création

  }, [id, isEditMode]); // Dépendances correctes

  // --- Gestionnaires ---
  const handleChange = (e) => {
    setOfferData({ ...offerData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true); // Loading principal
    const payload = { ...offerData };

    try {
      let response;
      if (isEditMode) { response = await OfferService.updateOffer(id, payload); } // Utilise ID
      else { response = await OfferService.createOffer(payload); }

      if (response.success) {
           const nextUrl = !isEditMode && response.data?.id ? `/offers/edit/${response.data.id}` : '/offers/manage';
           // Utiliser setError pour afficher le message de succès avant navigation
           setError(isEditMode ? 'Offre mise à jour avec succès !' : 'Offre créée ! Redirection...');
           setTimeout(() => navigate(nextUrl), 1500);
      } else { setError(response.message || `Erreur lors de la ${isEditMode ? 'mise à jour' : 'création'}`); }
    } catch (err) {
       console.error("Erreur submit offre:", err);
       setError(`Erreur: ${err.message || 'Erreur inconnue'}`);
    } finally { setLoading(false); }
  };

  // --- NOUVEAU : Gestionnaires champs personnalisés ---
  const handleNewFieldChange = (e) => {
    const { id: fieldId, value, type, checked } = e.target; // Renommer id en fieldId pour éviter confusion
    setNewField(prev => ({ ...prev, [fieldId]: type === 'checkbox' ? checked : value }));
  };

  const handleAddField = async (e) => {
    e.preventDefault();
    if (!newField.label || !newField.fieldType) { setFieldsError("Libellé et type requis."); return; }
    if (['RADIO', 'CHECKBOX'].includes(newField.fieldType) && (!newField.options || newField.options.trim() === '')) {
        setFieldsError("Options requises pour ce type."); return; }
    setFieldActionLoading(true); setFieldsError(''); setFieldActionMessage('');

    try {
        const fieldData = { ...newField, options: ['RADIO', 'CHECKBOX'].includes(newField.fieldType) ? newField.options : null };
        const response = await OfferService.createCustomField(id, fieldData); // Utilise ID
        if (response.success && response.data) {
            setCustomFields(prev => [...prev, response.data]);
            setNewField({ label: '', fieldType: 'TEXT', options: '', isRequired: false });
            setFieldActionMessage('Champ ajouté !');
            setTimeout(() => setFieldActionMessage(''), 2000);
        } else { setFieldsError(response.message || "Erreur ajout."); }
    } catch (err) {
        console.error("Erreur ajout champ:", err); setFieldsError(err.message || "Erreur ajout.");
    } finally { setFieldActionLoading(false); }
  };

  const handleDeleteField = async (fieldIdToDelete) => {
    if (!window.confirm("Supprimer ce champ ?")) return;
    setFieldsError(''); setFieldActionMessage(''); setFieldActionLoading(true);
    try {
        const response = await OfferService.deleteCustomField(id, fieldIdToDelete); // Utilise ID
        if (response.success) {
            setCustomFields(prev => prev.filter(field => field.id !== fieldIdToDelete));
            setFieldActionMessage('Champ supprimé !');
            setTimeout(() => setFieldActionMessage(''), 2000);
        } else { setFieldsError(response.message || "Erreur suppression."); }
    } catch (err) {
        console.error("Erreur suppression champ:", err); setFieldsError(err.message || "Erreur suppression.");
    } finally { setFieldActionLoading(false); }
  };

  // --- Rendu JSX ---
  // Affiche chargement principal si offre charge en mode édition
  if (loading && isEditMode) return <div style={{padding:'2rem', textAlign:'center'}}><span className="loading"></span> Chargement...</div>;

  return (
    <div className="form-card" style={{ maxWidth: '800px' }}>
      <h2 className="form-title">{pageTitle}</h2>
      <Link to="/offers/manage" style={{ display: 'inline-block', marginBottom: '1rem', color: 'var(--primary-color)' }}>
        &larr; Retour
      </Link>

      {/* Formulaire Principal (Offre) */}
      <form onSubmit={handleSubmit}>
        {/* Champs Title, Description, Location, Contract Type, Status (comme ton ancien code) */}
        <div className="form-group">
          <label htmlFor="title" className="form-label">Titre</label>
          <input type="text" id="title" className="form-input" value={offerData.title} onChange={handleChange} required minLength="5" />
        </div>
        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea id="description" className="form-input" value={offerData.description} onChange={handleChange} rows="8" required minLength="20"></textarea>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div className="form-group">
            <label htmlFor="location" className="form-label">Lieu</label>
            <input type="text" id="location" className="form-input" value={offerData.location} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="contractType" className="form-label">Contrat</label>
            <select id="contractType" className="form-input" value={offerData.contractType} onChange={handleChange}>
              <option value="CDI">CDI</option> <option value="CDD">CDD</option> <option value="STAGE">STAGE</option>
              <option value="ALTERNANCE">ALTERNANCE</option> <option value="FREELANCE">FREELANCE</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="status" className="form-label">Statut</label>
            <select id="status" className="form-input" value={offerData.status} onChange={handleChange}>
              <option value="DRAFT">Brouillon</option> <option value="PUBLISHED">Publiée</option> <option value="ARCHIVED">Archivée</option>
            </select>
          </div>
        </div>
        {/* Afficher l'erreur principale OU le message de succès temporaire */}
        {error && <div className={`message ${error.includes('succès') || error.includes('créée') || error.includes('jour') ? 'message-success' : 'message-error'}`} style={{ marginTop: '1rem' }}>{error}</div>}
        {/* Boutons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
           <button type="button" className="btn" onClick={() => navigate('/offers/manage')} style={{ background: 'var(--slate)', color: 'white', width: 'auto' }}>Annuler</button>
           <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: 'auto', flexGrow: 1 }}>
               {loading && <span className="loading"></span>}
               {isEditMode ? 'Mettre à jour' : 'Créer l\'offre'}
           </button>
       </div>
      </form>

      {/* --- Section Champs Personnalisés (Affichée seulement en mode édition) --- */}
      {isEditMode && (
        <fieldset style={{ border: '1px solid var(--lightest-navy)', borderRadius: 'var(--border-radius)', padding: '1.5rem', marginTop: '2.5rem' }}>
          <legend style={{ color: 'var(--primary-color)', padding: '0 0.5rem' }}>Champs personnalisés</legend>

          {fieldsLoading && <div style={{ textAlign:'center', padding:'1rem' }}><span className="loading"></span> Chargement...</div>}
          {fieldsError && <div className="message message-error">{fieldsError}</div>}
          {fieldActionMessage && <div className="message message-success">{fieldActionMessage}</div>}

          {/* Afficher Liste + Formulaire seulement si chargement terminé */}
          {!fieldsLoading && (
            <>
              {/* Liste */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                {Array.isArray(customFields) && customFields.length > 0 ? (
                  customFields.map(field => (
                    field?.id ? ( // Utilise optional chaining ?. pour plus de sécurité
                        <div key={field.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(100, 255, 218, 0.05)', padding: '0.75rem 1rem', borderRadius: 'var(--border-radius)' }}>
                          <div>
                            <span>{field.label}</span> <span style={{ color: 'var(--slate)', fontSize: '0.8rem' }}>({field.fieldType}{field.isRequired ? ', Requis' : ''})</span>
                          </div>
                          <button onClick={() => handleDeleteField(field.id)} title="Supprimer" disabled={fieldActionLoading} style={{ background: 'none', border: 'none' }}>
                            <TrashIcon />
                          </button>
                        </div>
                    ) : null
                  ))
                ) : (
                   !fieldsError && <p style={{ color: 'var(--slate)', fontSize: '0.9rem' }}>Aucun champ personnalisé.</p>
                )}
              </div>

              {/* Formulaire ajout */}
              <form onSubmit={handleAddField} style={{ background: 'var(--navy-blue)', padding: '1rem', borderRadius: 'var(--border-radius)' }}>
                 <h4 style={{ color: 'var(--lightest-slate)', marginTop: '0', marginBottom: '1rem' }}>Ajouter un champ</h4>
                 {/* Libellé */}
                 <div className="form-group">
                    <label htmlFor="label" className="form-label" style={{fontSize: '0.8rem'}}>Libellé</label>
                    {/* Utilise 'label' pour l'id, correspond à l'état newField */}
                    <input type="text" id="label" className="form-input" value={newField.label} onChange={handleNewFieldChange} required/>
                 </div>
                 {/* Type et Requis */}
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems:'flex-end' }}>
                    <div className="form-group" style={{marginBottom:0}}>
                        <label htmlFor="fieldType" className="form-label" style={{fontSize: '0.8rem'}}>Type</label>
                        {/* Utilise 'fieldType' pour l'id */}
                        <select id="fieldType" className="form-input" value={newField.fieldType} onChange={handleNewFieldChange}>
                            <option value="TEXT">Texte (court)</option> <option value="TEXTAREA">Texte (long)</option>
                            <option value="RADIO">Choix unique</option> <option value="CHECKBOX">Choix multiples</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingBottom: '0.75rem' }}>
                         {/* Utilise 'isRequired' pour l'id */}
                        <input type="checkbox" id="isRequired" checked={newField.isRequired} onChange={handleNewFieldChange} style={{ width: 'auto', marginRight: '0.5rem' }}/>
                        <label htmlFor="isRequired" className="form-label" style={{ marginBottom: 0 }}>Requis?</label>
                    </div>
                 </div>
                 {/* Options (conditionnel) */}
                 {['RADIO', 'CHECKBOX'].includes(newField.fieldType) && (
                     <div className="form-group">
                        <label htmlFor="options" className="form-label" style={{fontSize: '0.8rem'}}>Options (séparées par ";")</label>
                         {/* Utilise 'options' pour l'id */}
                        <input type="text" id="options" className="form-input" value={newField.options} onChange={handleNewFieldChange} required/>
                    </div>
                 )}
                 {/* Afficher erreur spécifique aux champs ici si elle existe */}
                 {fieldsError && <div className="message message-error" style={{marginTop:'-0.5rem', marginBottom:'1rem'}}>{fieldsError}</div>}
                 {/* Bouton Ajouter */}
                 <button type="submit" className="btn" disabled={fieldActionLoading} style={{ width: 'auto', background: 'var(--light-slate)', color: 'var(--navy-blue)', fontSize: '0.9rem', marginTop:'1rem' }}>
                    {fieldActionLoading && <span className="loading"></span>}
                    {fieldActionLoading ? 'Ajout...' : 'Ajouter ce champ'}
                 </button>
              </form>
            </>
          )}
        </fieldset>
      )}
    </div>
  );
}

export default OfferCreateEditPage;