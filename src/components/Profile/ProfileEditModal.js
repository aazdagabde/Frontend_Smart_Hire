// src/components/Profile/ProfileEditModal.js
import React, { useState, useEffect, useRef } from 'react';
import ProfileService from '../../services/ProfileService';
import { useAuth } from '../../contexts/AuthContext';
import './ProfileComponents.css';
import NoProfileImage from '../../assets/noprofile.jpeg';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

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
  const [preview, setPreview] = useState(NoProfileImage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);
  
  // 1. Charger les données du profil quand le modal s'ouvre
  useEffect(() => {
    if (show && currentUser) { // Vérifier que currentUser n'est pas null
      setError('');
      setMessage('');
      setSelectedFile(null);
      setLoading(true);
      
      ProfileService.getProfile()
        .then(data => {
          setProfile({
            firstName: data.firstName || currentUser.firstName || '',
            lastName: data.lastName || currentUser.lastName || '',
            phoneNumber: data.phoneNumber || ''
          });
          
          // Vérifier que currentUser.id existe avant de construire l'URL
          if (data.hasProfilePicture && currentUser.id) {
            setPreview(`${API_URL}/profile/${currentUser.id}/picture?timestamp=${new Date().getTime()}`);
          } else {
            setPreview(NoProfileImage);
          }
        })
        .catch(err => {
          console.error('Erreur chargement profil:', err);
          setError('Erreur lors du chargement du profil.');
        })
        .finally(() => setLoading(false));
    }
  }, [show, currentUser]); // currentUser comme dépendance

  // 2. Gérer la sélection du fichier image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
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
    
    // Vérifier que currentUser existe
    if (!currentUser) {
      setError('Utilisateur non connecté');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      let photoUpdated = false;
      
      if (selectedFile) {
        await ProfileService.updateProfilePicture(selectedFile);
        photoUpdated = true;
      }
      
      await ProfileService.updateProfile(profile);
      setMessage('Profil mis à jour avec succès !');
      
      if (photoUpdated) {
        onProfileUpdate(); 
      }
      
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      setError('Erreur: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ne pas rendre le modal si show est false ou currentUser est null
  if (!show || !currentUser) {
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
              src={preview || NoProfileImage} 
              alt="Aperçu" 
              className="profile-modal-avatar-preview"
              onError={(e) => { e.target.src = NoProfileImage; }}
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
              disabled={loading}
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