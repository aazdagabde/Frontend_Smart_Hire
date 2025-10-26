// src/pages/OfferCreateEditPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  const { id } = useParams(); // Utilise 'id'
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // --- États ---
  const [offerData, setOfferData] = useState({ title: '', description: '', location: '', contractType: 'CDI', status: 'DRAFT' });
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [pageTitle, setPageTitle] = useState(isEditMode ? 'Modifier l\'offre' : 'Créer une nouvelle offre');
  const [customFields, setCustomFields] = useState([]);
  const [fieldsLoading, setFieldsLoading] = useState(isEditMode);
  const [fieldsError, setFieldsError] = useState('');
  const [fieldActionLoading, setFieldActionLoading] = useState(false);
  const [newField, setNewField] = useState({ label: '', fieldType: 'TEXT', options: '', isRequired: false });
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  // --- Chargement Offre (Mode Édition) ---
  useEffect(() => {
    const initialOfferState = { title: '', description: '', location: '', contractType: 'CDI', status: 'DRAFT' };
    if (isEditMode && id) {
      setPageTitle('Modifier l\'offre'); setLoading(true); setError('');
      OfferService.getOfferDetailsForEdit(id)
        .then(response => {
          if (response.success && response.data) {
            const d = response.data; // Alias
            setOfferData({ title: d.title || '', description: d.description || '', location: d.location || '', contractType: d.contractType || 'CDI', status: d.status || 'DRAFT' });
          } else { setError(`Erreur chargement offre: ${response.message || 'Non trouvée/Accès refusé'}`); setOfferData(initialOfferState); }
        })
        .catch(err => { console.error("Erreur getOfferDetailsForEdit:", err); setError(`Erreur chargement offre: ${err.message || err}`); setOfferData(initialOfferState); })
        .finally(() => setLoading(false));
    } else { setOfferData(initialOfferState); setPageTitle('Créer une nouvelle offre'); setLoading(false); }
  }, [id, isEditMode]);

  // --- Chargement Champs Personnalisés (Mode Édition) ---
  useEffect(() => {
    const fetchCustomFields = async () => {
        setFieldsLoading(true); setFieldsError('');
        try {
            const response = await OfferService.getCustomFields(id); // Utilise 'id'
            if (response.success && Array.isArray(response.data)) {
                const sanitized = response.data.map(f => ({...f, options: (f && typeof f.options === 'string') ? f.options : null }));
                setCustomFields(sanitized);
            } else { setCustomFields([]); if (!response.success && response.message) setFieldsError(response.message); }
        } catch (err) {
            console.error("Erreur chargement champs:", err); setCustomFields([]);
            if (!err.message || !err.message.toLowerCase().includes('not found')) { setFieldsError(err.message || "Erreur chargement champs."); }
        } finally { setFieldsLoading(false); }
    };
    if (isEditMode && id) { fetchCustomFields(); }
    else { setFieldsLoading(false); setCustomFields([]); }
  }, [id, isEditMode]);

  // --- Gestionnaires ---
  const handleChange = (e) => { setOfferData({ ...offerData, [e.target.id]: e.target.value }); };

  // Affiche un message temporaire
  const showActionMessage = (text, type = 'success') => {
      setActionMessage({ text, type });
      // Clear specific errors if action is successful
      if (type === 'success') {
          if (text.includes('offre')) setError(''); // Clear main error on offer success
          if (text.includes('Champ')) setFieldsError(''); // Clear field error on field action success
      }
      setTimeout(() => setActionMessage({ text: '', type: '' }), 3000);
  };

  // Submit formulaire principal (Offre)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionMessage({ text: '', type: '' }); setLoading(true);
    const payload = { ...offerData };

    try {
      let response;
      if (isEditMode) { response = await OfferService.updateOffer(id, payload); }
      else { response = await OfferService.createOffer(payload); }

      console.log("Submit Offer Response:", response); // <<< LOG IMPORTANT

      // <<< CORRECTION ICI : Vérifier response.data ET response.data.id >>>
      if (response.success) {
           let nextUrl = '/offers/manage'; // Default redirection
           // Tenter la redirection vers l'édition SEULEMENT si création réussie ET ID présent
           if (!isEditMode && response.data && response.data.id) {
               nextUrl = `/offers/edit/${response.data.id}`;
               console.log(`Creation success, redirecting to edit: ${nextUrl}`);
           } else if (!isEditMode) {
               console.log("Creation success, but no ID in response.data, redirecting to manage.");
           } else {
               console.log("Update success, redirecting to manage.");
           }
           // <<< FIN CORRECTION >>>

           const successMsg = isEditMode ? 'Offre mise à jour !' : 'Offre créée !';
           showActionMessage(successMsg, 'success');
           setTimeout(() => navigate(nextUrl), 1500); // Navigue après délai
      } else {
          // Afficher l'erreur retournée par l'API dans l'état principal 'error'
          setError(response.message || `Erreur lors de la ${isEditMode ? 'mise à jour' : 'création'}`);
      }
    } catch (err) {
       console.error("Erreur submit offre:", err);
       // Afficher l'erreur catchée dans l'état principal 'error'
       setError(`Erreur: ${err.message || 'Inconnue'}`);
    } finally { setLoading(false); }
  };

  // Input formulaire ajout champ
  const handleNewFieldChange = (e) => {
    const { id: fieldId, value, type, checked } = e.target;
    setNewField(prev => ({ ...prev, [fieldId]: type === 'checkbox' ? checked : value }));
  };

  // Submit formulaire ajout champ
  const handleAddField = async (e) => {
    e.preventDefault();
    if (!newField.label || !newField.fieldType) { showActionMessage("Libellé et type requis.", 'error'); return; }
    if (['RADIO', 'CHECKBOX'].includes(newField.fieldType) && (!newField.options || newField.options.trim() === '')) {
        showActionMessage("Options requises pour ce type.", 'error'); return; }

    setFieldActionLoading(true); setFieldsError(''); setActionMessage({ text: '', type: '' });
    try {
        const fieldData = { ...newField, options: ['RADIO', 'CHECKBOX'].includes(newField.fieldType) ? newField.options : null };
        const response = await OfferService.createCustomField(id, fieldData); // Utilise 'id'
        if (response.success && response.data) {
            setCustomFields(prev => [...prev, response.data]);
            setNewField({ label: '', fieldType: 'TEXT', options: '', isRequired: false });
            showActionMessage('Champ ajouté !', 'success');
        } else {
            // Afficher l'erreur spécifique aux champs
            setFieldsError(response.message || "Erreur ajout.");
            showActionMessage(response.message || "Erreur ajout.", 'error'); // Aussi message global
        }
    } catch (err) {
        console.error("Erreur ajout champ:", err);
        setFieldsError(err.message || "Erreur ajout."); // Erreur spécifique
        showActionMessage(err.message || "Erreur ajout.", 'error'); // Message global
    } finally { setFieldActionLoading(false); }
  };

  // Suppression champ
  const handleDeleteField = async (fieldIdToDelete) => {
    if (!window.confirm("Supprimer ce champ ?")) return;
    setFieldsError(''); setActionMessage({ text: '', type: '' }); setFieldActionLoading(true);
    try {
        const response = await OfferService.deleteCustomField(id, fieldIdToDelete); // Utilise 'id'
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
    } finally { setFieldActionLoading(false); }
  };

  // --- Rendu JSX ---
  if (loading && isEditMode) return <div style={{padding:'2rem', textAlign:'center'}}><span className="loading"></span> Chargement...</div>;

  return (
    <div className="form-card" style={{ maxWidth: '800px' }}>
      <h2 className="form-title">{pageTitle}</h2>
      <Link to="/offers/manage" style={{ display: 'inline-block', marginBottom: '1rem', color: 'var(--primary-color)' }}>
        &larr; Retour
      </Link>

      {/* Afficher message global (succès OU erreur principale) */}
      {actionMessage.text && (
          <div className={`message ${actionMessage.type === 'success' ? 'message-success' : 'message-error'}`} style={{ marginTop: '1rem' }}>
              {actionMessage.text}
          </div>
      )}
      {/* Afficher erreur principale si pas remplacée par message d'action */}
      {error && !actionMessage.text && (
           <div className="message message-error" style={{ marginTop: '1rem' }}>{error}</div>
      )}

      {/* Formulaire Principal (Offre) */}
      {(!loading || !isEditMode) && (
          <form onSubmit={handleSubmit}>
            {/* Champs Title, Description, Location, Contract Type, Status */}
            <div className="form-group"> <label htmlFor="title" className="form-label">Titre</label> <input type="text" id="title" className="form-input" value={offerData.title} onChange={handleChange} required minLength="5" /> </div>
            <div className="form-group"> <label htmlFor="description" className="form-label">Description</label> <textarea id="description" className="form-input" value={offerData.description} onChange={handleChange} rows="8" required minLength="20"></textarea> </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div className="form-group"> <label htmlFor="location" className="form-label">Lieu</label> <input type="text" id="location" className="form-input" value={offerData.location} onChange={handleChange} required /> </div>
              <div className="form-group"> <label htmlFor="contractType" className="form-label">Contrat</label> <select id="contractType" className="form-input" value={offerData.contractType} onChange={handleChange}> <option value="CDI">CDI</option> <option value="CDD">CDD</option> <option value="STAGE">STAGE</option> <option value="ALTERNANCE">ALTERNANCE</option> <option value="FREELANCE">FREELANCE</option> </select> </div>
              <div className="form-group"> <label htmlFor="status" className="form-label">Statut</label> <select id="status" className="form-input" value={offerData.status} onChange={handleChange}> <option value="DRAFT">Brouillon</option> <option value="PUBLISHED">Publiée</option> <option value="ARCHIVED">Archivée</option> </select> </div>
            </div>
            {/* Boutons Annuler/Soumettre */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
               <button type="button" className="btn" onClick={() => navigate('/offers/manage')} style={{ background: 'var(--slate)', color: 'white', width: 'auto' }}>Annuler</button>
               <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: 'auto', flexGrow: 1 }}>
                   {loading && <span className="loading"></span>}
                   {isEditMode ? 'Mettre à jour' : 'Créer l\'offre'}
               </button>
           </div>
          </form>
      )}

      {/* --- Section Champs Personnalisés (Affichée seulement en mode édition) --- */}
      {isEditMode && (
        <fieldset style={{ border: '1px solid var(--lightest-navy)', borderRadius: 'var(--border-radius)', padding: '1.5rem', marginTop: '2.5rem' }}>
          <legend style={{ color: 'var(--primary-color)', padding: '0 0.5rem' }}>Champs personnalisés</legend>

          {fieldsLoading && <div style={{ textAlign:'center', padding:'1rem' }}><span className="loading"></span> Chargement...</div>}
          {/* Afficher erreur spécifique aux champs si elle existe ET pas remplacée par message d'action */}
          {fieldsError && !actionMessage.text && <div className="message message-error">{fieldsError}</div>}

          {/* Afficher Liste + Formulaire seulement si chargement terminé */}
          {!fieldsLoading && (
            <>
              {/* Liste */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                {Array.isArray(customFields) && customFields.length > 0 ? (
                  customFields.map(field => (
                    field?.id ? (
                        <div key={field.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(100, 255, 218, 0.05)', padding: '0.75rem 1rem', borderRadius: 'var(--border-radius)' }}>
                          <div> <span>{field.label}</span> <span style={{ color: 'var(--slate)', fontSize: '0.8rem' }}>({field.fieldType}{field.isRequired ? ', Requis' : ''})</span> </div>
                          <button onClick={() => handleDeleteField(field.id)} title="Supprimer" disabled={fieldActionLoading} style={{ background: 'none', border: 'none' }}> <TrashIcon /> </button>
                        </div>
                    ) : null
                  ))
                ) : ( !fieldsError && <p style={{ color: 'var(--slate)', fontSize: '0.9rem' }}>Aucun champ personnalisé.</p> )}
              </div>

              {/* Formulaire ajout */}
              <form onSubmit={handleAddField} style={{ background: 'var(--navy-blue)', padding: '1rem', borderRadius: 'var(--border-radius)' }}>
                 <h4 style={{ color: 'var(--lightest-slate)', marginTop: '0', marginBottom: '1rem' }}>Ajouter un champ</h4>
                 <div className="form-group"> <label htmlFor="label" className="form-label" style={{fontSize: '0.8rem'}}>Libellé</label> <input type="text" id="label" className="form-input" value={newField.label} onChange={handleNewFieldChange} required/> </div>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems:'flex-end' }}>
                    <div className="form-group" style={{marginBottom:0}}> <label htmlFor="fieldType" className="form-label" style={{fontSize: '0.8rem'}}>Type</label> <select id="fieldType" className="form-input" value={newField.fieldType} onChange={handleNewFieldChange}> <option value="TEXT">Texte (court)</option> <option value="TEXTAREA">Texte (long)</option> <option value="RADIO">Choix unique</option> <option value="CHECKBOX">Choix multiples</option> </select> </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingBottom: '0.75rem' }}> <input type="checkbox" id="isRequired" checked={newField.isRequired} onChange={handleNewFieldChange} style={{ width: 'auto', marginRight: '0.5rem' }}/> <label htmlFor="isRequired" className="form-label" style={{ marginBottom: 0 }}>Requis?</label> </div>
                 </div>
                 {['RADIO', 'CHECKBOX'].includes(newField.fieldType) && (
                     <div className="form-group"> <label htmlFor="options" className="form-label" style={{fontSize: '0.8rem'}}>Options (séparées par ";")</label> <input type="text" id="options" className="form-input" value={newField.options} onChange={handleNewFieldChange} required/> </div>
                 )}
                 {/* Afficher erreur spécifique si elle existe ET pas remplacée */}
                 {fieldsError && !actionMessage.text && <div className="message message-error" style={{marginTop:'-0.5rem', marginBottom:'1rem'}}>{fieldsError}</div>}
                 <button type="submit" className="btn" disabled={fieldActionLoading} style={{ width: 'auto', background: 'var(--light-slate)', color: 'var(--navy-blue)', fontSize: '0.9rem', marginTop:'1rem' }}>
                    {fieldActionLoading && <span className="loading"></span>}
                    {fieldActionLoading ? 'Action...' : 'Ajouter ce champ'}
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