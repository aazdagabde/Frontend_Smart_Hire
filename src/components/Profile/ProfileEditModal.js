// src/components/Profile/ProfileEditModal.js
import React, { useState, useEffect, useRef } from 'react';
import ProfileService from '../../services/ProfileService';
import { useAuth } from '../../contexts/AuthContext';
import './ProfileComponents.css'; // Partage le même CSS

// Icône pour fermer
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const ProfileEditModal = ({ show, onClose, onProfileUpdate }) => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({ firstName: '', lastName: '', phoneNumber: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  // URL de l'API
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

  // 1. Charger les données du profil quand le modal s'ouvre
  useEffect(() => {
    if (show) {
      setError('');
      setMessage('');
      setLoading(true);
      ProfileService.getProfile()
        .then(data => {
          setProfile({
            firstName: data.firstName || currentUser.firstName || '',
            lastName: data.lastName || currentUser.lastName || '',
            phoneNumber: data.phoneNumber || ''
          });
          if (data.hasProfilePicture) {
            setPreview(`${API_URL}/profile/${currentUser.id}/picture?timestamp=${new Date().getTime()}`);
          } else {
            setPreview('/default-avatar.png');
          }
        })
        .catch(err => setError('Erreur lors du chargement du profil.'))
        .finally(() => setLoading(false));
    }
  }, [show, currentUser.id, currentUser.firstName, currentUser.lastName]);

  // 2. Gérer la sélection du fichier image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Créer un aperçu local
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      let photoUpdated = false;
      // Étape A: Mettre à jour la photo si une nouvelle est sélectionnée
      if (selectedFile) {
        await ProfileService.updateProfilePicture(selectedFile);
        photoUpdated = true;
      }
      
      // Étape B: Mettre à jour les informations textuelles
      await ProfileService.updateProfile(profile);

      setMessage('Profil mis à jour avec succès !');
      setLoading(false);
      
      // Informer le parent (Layout) de rafraîchir l'avatar
      if (photoUpdated) {
        onProfileUpdate(); 
      }
      
      // Fermer le modal après un court délai
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      setError('Erreur: ' + err.message);
      setLoading(false);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
        <button className="profile-modal-close-btn" onClick={onClose}>
          <CloseIcon />
        </button>
        
        <h2 className="form-title" style={{ marginTop: 0 }}>Modifier votre profil</h2>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="message message-error">{error}</div>}
          {message && <div className="message message-success">{message}</div>}

          {/* Section Photo */}
          <div className="form-group" style={{ alignItems: 'center' }}>
            <img 
              src={preview || '/default-avatar.png'} 
              alt="Aperçu" 
              className="profile-modal-avatar-preview"
              onError={(e) => { e.target.src = '/default-avatar.png'; }}
            />
            <input
              type="file"
              accept="image/png, image/jpeg"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => fileInputRef.current.click()}
            >
              Choisir une photo
            </button>
          </div>

          {/* Section Infos */}
          <div className="form-group">
            <label htmlFor="firstName" className="form-label">Prénom</label>
            <input
              type="text"
              id="firstName"
              className="form-input"
              value={profile.firstName}
              onChange={(e) => setProfile(p => ({...p, firstName: e.target.value}))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName" className="form-label">Nom</label>
            <input
              type="text"
              id="lastName"
              className="form-input"
              value={profile.lastName}
              onChange={(e) => setProfile(p => ({...p, lastName: e.target.value}))}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;