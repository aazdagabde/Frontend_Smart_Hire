// src/pages/OfferCreateEditPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OfferService from '../services/OfferService';

function OfferCreateEditPage() {
  const [offerData, setOfferData] = useState({
    title: '',
    description: '',
    location: '',
    contractType: '', // Mettre une valeur par défaut si pertinent ex: 'CDI'
    requiredSkills: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageTitle, setPageTitle] = useState('Créer une nouvelle offre');
  const { id } = useParams(); // Récupère l'ID si on est en mode édition
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
      setPageTitle('Modifier l\'offre');
      setLoading(true);
      OfferService.getOfferById(id)
        .then(data => {
          // Pré-remplir le formulaire avec les données existantes
          setOfferData({
            title: data.title || '',
            description: data.description || '',
            location: data.location || '',
            contractType: data.contractType || '',
            requiredSkills: data.requiredSkills || ''
          });
        })
        .catch(err => setError(`Impossible de charger l'offre: ${err.message}`))
        .finally(() => setLoading(false));
    } else {
        // Reset le formulaire si on navigue de edit vers create
        setOfferData({ title: '', description: '', location: '', contractType: '', requiredSkills: '' });
        setPageTitle('Créer une nouvelle offre');
    }
  }, [id, isEditing]); // Réagir aux changements de l'ID

  const handleChange = (e) => {
    setOfferData({
      ...offerData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditing) {
        await OfferService.updateOffer(id, offerData);
      } else {
        await OfferService.createOffer(offerData);
      }
      // Rediriger vers la page de gestion après succès
      navigate('/offers/manage');
    } catch (err) {
      setError(`Erreur lors de la ${isEditing ? 'mise à jour' : 'création'}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) return <div>Chargement de l'offre...</div>;

  return (
    <div className="form-card" style={{ maxWidth: '700px' }}>
      <h2 className="form-title">{pageTitle}</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title" className="form-label">Titre de l'offre</label>
          <input type="text" id="title" className="form-input" value={offerData.title} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea id="description" className="form-input" value={offerData.description} onChange={handleChange} rows="6" required></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="location" className="form-label">Lieu</label>
          <input type="text" id="location" className="form-input" value={offerData.location} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label htmlFor="contractType" className="form-label">Type de contrat</label>
          <select id="contractType" className="form-input" value={offerData.contractType} onChange={handleChange} required>
            <option value="">Sélectionnez...</option>
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="Stage">Stage</option>
            <option value="Alternance">Alternance</option>
            <option value="Freelance">Freelance</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="requiredSkills" className="form-label">Compétences requises (séparées par des virgules)</label>
          <input type="text" id="requiredSkills" className="form-input" value={offerData.requiredSkills} onChange={handleChange} />
        </div>

        {error && <div className="message message-error">{error}</div>}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
           <button type="button" className="btn" onClick={() => navigate('/offers/manage')} style={{ background: 'var(--gray-color)', color: 'white', width: 'auto' }}>
             Annuler
           </button>
           <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: 'auto', flexGrow: 1 }}>
             {loading && <span className="loading"></span>}
             {isEditing ? 'Mettre à jour' : 'Créer l\'offre'}
           </button>
        </div>
      </form>
    </div>
  );
}

export default OfferCreateEditPage;