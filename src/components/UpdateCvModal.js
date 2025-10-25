// src/components/UpdateCvModal.js
import React, { useState } from 'react';
import ApplicationService from '../services/ApplicationService';
import '../styles/App.css'; // Pour les styles de base

// Styles spécifiques au modal (peuvent être mis dans un fichier CSS séparé)
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(10, 25, 47, 0.8)', // Fond semi-transparent navy
  backdropFilter: 'blur(5px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1050, // Au-dessus de la navbar
};

const modalContentStyle = {
  background: 'var(--dark-navy)', // Fond de carte
  padding: '2.5rem',
  borderRadius: 'var(--border-radius-lg)',
  boxShadow: 'var(--box-shadow-lg)',
  width: '90%',
  maxWidth: '500px',
  position: 'relative',
  border: '1px solid rgba(100, 255, 218, 0.1)'
};

const closeButtonStyle = {
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  background: 'transparent',
  border: 'none',
  color: 'var(--slate)',
  fontSize: '1.5rem',
  cursor: 'pointer',
};

function UpdateCvModal({ applicationId, onClose, onSuccess }) {
  const [newCvFile, setNewCvFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError('');
    setSuccessMessage('');
    if (file && file.type !== "application/pdf") {
      setError("Le nouveau fichier doit être au format PDF.");
      setNewCvFile(null);
      e.target.value = null; // Reset file input
    } else if (file && file.size > 5 * 1024 * 1024) { // 5MB limit
      setError("Le fichier ne doit pas dépasser 5MB.");
      setNewCvFile(null);
      e.target.value = null; // Reset file input
    } else {
      setNewCvFile(file);
    }
  };

  const handleUpdateCv = async (e) => {
    e.preventDefault();
    if (!newCvFile) {
      setError("Veuillez sélectionner un nouveau fichier PDF.");
      return;
    }

    setIsUpdating(true);
    setError('');
    setSuccessMessage('');

    try {
      // Préparer les données FormData pour l'envoi
      const formData = new FormData();
      formData.append('cv', newCvFile);

      // Appeler la nouvelle fonction du service
      const apiResponse = await ApplicationService.updateCv(applicationId, formData);

      if (apiResponse.success) {
        setSuccessMessage(apiResponse.message || "CV mis à jour avec succès !");
        // Appeler le callback onSuccess après un court délai pour montrer le message
        setTimeout(() => {
          onSuccess(); // Déclenche le rafraîchissement et la fermeture
        }, 1500);
      } else {
        setError(apiResponse.message || "Erreur lors de la mise à jour.");
      }
    } catch (err) {
      console.error("Erreur updateCv:", err);
      setError(err.message || "Échec de la mise à jour du CV.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}> {/* Ferme si on clique hors du modal */}
      <div style={modalContentStyle} onClick={e => e.stopPropagation()}> {/* Empêche la fermeture si on clique DANS le modal */}
        <button style={closeButtonStyle} onClick={onClose}>&times;</button>
        <h3 className="form-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Modifier mon CV</h3>

        <form onSubmit={handleUpdateCv}>
          <div className="form-group">
            <label htmlFor="newCvFile" className="form-label">Nouveau CV (PDF, 5MB max)</label>
            <input
              type="file"
              id="newCvFile"
              accept="application/pdf"
              onChange={handleFileChange}
              required
              className="form-input"
              disabled={isUpdating}
            />
          </div>

          {error && <div className="message message-error">{error}</div>}
          {successMessage && <div className="message message-success">{successMessage}</div>}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="button"
              className="btn"
              onClick={onClose}
              disabled={isUpdating}
              style={{ background: 'var(--slate)', color: 'white', width: 'auto' }}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUpdating || !newCvFile || !!error}
              style={{ width: 'auto', flexGrow: 1 }}
            >
              {isUpdating && <span className="loading"></span>}
              {isUpdating ? 'Mise à jour...' : 'Mettre à jour le CV'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateCvModal;