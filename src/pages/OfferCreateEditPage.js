// src/pages/OfferCreateEditPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OfferService from '../services/OfferService';

function OfferCreateEditPage() {
  const [offerData, setOfferData] = useState({
    title: '',
    description: '',
    location: '',
    contractType: 'CDI', // Default value
    status: 'DRAFT',   // Add status, default to DRAFT
    // requiredSkills: '' // Remove requiredSkills
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageTitle, setPageTitle] = useState('Créer une nouvelle offre');
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  useEffect(() => {
    const initialOfferState = {
        title: '', description: '', location: '', contractType: 'CDI', status: 'DRAFT'
    };

    if (isEditing) {
      setPageTitle('Modifier l\'offre');
      setLoading(true);
      OfferService.getOfferById(id)
        .then(data => {
          // Make sure to use the correct data structure from the service
          const fetchedData = data.data; // Assuming data is wrapped
          setOfferData({
            title: fetchedData.title || '',
            description: fetchedData.description || '',
            location: fetchedData.location || '',
            contractType: fetchedData.contractType || 'CDI', // Keep default if missing
            status: fetchedData.status || 'DRAFT' // Add status, keep default if missing
          });
        })
        .catch(err => setError(`Impossible de charger l'offre: ${err.message || err}`))
        .finally(() => setLoading(false));
    } else {
        setOfferData(initialOfferState); // Reset form for creation
        setPageTitle('Créer une nouvelle offre');
    }
  }, [id, isEditing]);

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

    // Prepare data matching backend DTO (contractType and status are already strings)
    const payload = {
      title: offerData.title,
      description: offerData.description,
      location: offerData.location,
      contractType: offerData.contractType,
      status: offerData.status,
    };

    try {
      if (isEditing) {
        await OfferService.updateOffer(id, payload);
      } else {
        await OfferService.createOffer(payload);
      }
      navigate('/offers/manage');
    } catch (err) {
       // Assuming the service throws an error with a message property
       setError(`Erreur lors de la ${isEditing ? 'mise à jour' : 'création'}: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) return <div>Chargement de l'offre...</div>;

  return (
    <div className="form-card" style={{ maxWidth: '700px' }}>
      <h2 className="form-title">{pageTitle}</h2>

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title" className="form-label">Titre de l'offre</label>
          <input type="text" id="title" className="form-input" value={offerData.title} onChange={handleChange} required minLength="5" />
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea id="description" className="form-input" value={offerData.description} onChange={handleChange} rows="6" required minLength="20"></textarea>
        </div>

        {/* Location */}
        <div className="form-group">
          <label htmlFor="location" className="form-label">Lieu</label>
          <input type="text" id="location" className="form-input" value={offerData.location} onChange={handleChange} required />
        </div>

        {/* Contract Type */}
        <div className="form-group">
          <label htmlFor="contractType" className="form-label">Type de contrat</label>
          <select id="contractType" className="form-input" value={offerData.contractType} onChange={handleChange} required>
            {/* Options correspondent aux valeurs backend Enum */}
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="STAGE">Stage</option>
            <option value="ALTERNANCE">Alternance</option>
            <option value="FREELANCE">Freelance</option>
          </select>
        </div>

        {/* Status (NEW FIELD) */}
        <div className="form-group">
            <label htmlFor="status" className="form-label">Statut de l'offre</label>
            <select id="status" className="form-input" value={offerData.status} onChange={handleChange} required>
                <option value="DRAFT">Brouillon (Draft)</option>
                <option value="PUBLISHED">Publiée (Published)</option>
                <option value="ARCHIVED">Archivée (Archived)</option> {/* Optional, if you need it */}
            </select>
        </div>

        {/* Removed requiredSkills */}
        {/* <div className="form-group"> ... </div> */}

        {error && <div className="message message-error">{error}</div>}

        {/* Buttons */}
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