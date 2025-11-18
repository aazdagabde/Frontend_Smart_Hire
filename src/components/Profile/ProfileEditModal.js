// src/components/Profile/ProfileEditModal.js
import React, { useState, useEffect, useRef } from 'react';
import ProfileService from '../../services/ProfileService';
import { useAuth } from '../../contexts/AuthContext';
import './ProfileComponents.css';
import NoProfileImage from '../../assets/noprofile.jpeg';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// (Icône CloseIcon ... / Reste inchangée)
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// AJOUT : Composant simple pour le chargement
const ModalLoader = () => (
  <div style={{ padding: '40px 0', textAlign: 'center' }}>
    <div className="loading"></div> {/* Assurez-vous d'avoir une classe 'loading' dans votre CSS */}
    <p>Chargement du profil...</p>
  </div>
);

const ProfileEditModal = ({ show, onClose, onProfileUpdate }) => {
  const { currentUser, refreshUserData } = useAuth();
  const [profile, setProfile] = useState({ firstName: '', lastName: '', phoneNumber: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(NoProfileImage);
  
  // États de chargement et de messagerie
  const [loadingInitial, setLoadingInitial] = useState(false); // Pour le chargement initial
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingPicture, setLoadingPicture] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const fileInputRef = useRef(null);
  
  // 1. Charger les données du profil quand le modal s'ouvre
  useEffect(() => {
    if (show && currentUser) { 
      setError('');
      setMessage('');
      setSelectedFile(null);
      setLoadingInitial(true); // Active le loader
      
      // Utilise le service corrigé (GET /api/profile/me)
      ProfileService.getProfile()
        .then(data => {
          setProfile({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            phoneNumber: data.phoneNumber || ''
          });
          
          if (data.hasProfilePicture && data.id) {
            // L'URL de l'avatar est construite pour l'aperçu
            setPreview(`${API_URL}/profile/${data.id}/picture?timestamp=${new Date().getTime()}`);
          } else {
            setPreview(NoProfileImage);
          }
        })
        .catch(err => {
          console.error('Erreur chargement profil:', err);
          setError('Erreur lors du chargement du profil.');
        })
        .finally(() => {
          setLoadingInitial(false); // Désactive le loader
        });
    }
  }, [show, currentUser]); // Se déclenche à l'ouverture du modal

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
      setError('');
      setMessage('');
    }
  };

  // 3. Gérer la soumission des INFORMATIONS (Appelle PUT /api/profile/update)
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setLoadingInfo(true);
    setError('');
    setMessage('');

    try {
      await ProfileService.updateProfile(profile);
      setMessage('Informations mises à jour !');
      await refreshUserData(); // Rafraîchir le currentUser dans le contexte
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setError('Erreur: ' + (err.message || 'Une erreur est survenue'));
    } finally {
      setLoadingInfo(false);
    }
  };

  // 4. Gérer la soumission de la PHOTO (Appelle PUT /api/profile/picture)
  const handlePictureSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
        setError("Veuillez d'abord choisir un fichier.");
        return;
    }
    
    setLoadingPicture(true);
    setError('');
    setMessage('');

    try {
        await ProfileService.updateProfilePicture(selectedFile);
        setMessage('Photo mise à jour !');
        await refreshUserData(); 
        onProfileUpdate(); // Force le rafraîchissement de l'avatar dans la navbar
        
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setTimeout(() => setMessage(''), 2000);

    } catch (err) {
        setError('Erreur lors de l\'envoi: ' + (err.message || 'Une erreur est survenue'));
    } finally {
        setLoadingPicture(false);
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
        
        {/* Affichage des messages généraux */}
        {error && <div className="message message-error">{error}</div>}
        {message && <div className="message message-success">{message}</div>}

        {/* Affiche le loader si 'loadingInitial' est true */}
        {loadingInitial ? (
          <ModalLoader />
        ) : (
          <>
            {/* --- Section Photo (Logique Séparée) --- */}
            <form onSubmit={handlePictureSubmit}>
              <div className="form-group" style={{ alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
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
                  disabled={loadingPicture || loadingInfo}
                >
                  Choisir une photo
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={loadingPicture || !selectedFile || loadingInfo}
                >
                  {loadingPicture ? 'Envoi...' : 'Mettre à jour la photo'}
                </button>
              </div>
            </form>

            {/* --- Section Infos (Logique Séparée) --- */}
            <form onSubmit={handleInfoSubmit} style={{ paddingTop: '1rem' }}>
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">Prénom</label>
                <input
                  type="text"
                  id="firstName"
                  className="form-input"
                  value={profile.firstName}
                  onChange={(e) => setProfile(p => ({...p, firstName: e.target.value}))}
                  disabled={loadingInfo || loadingPicture}
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
                  disabled={loadingInfo || loadingPicture}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber" className="form-label">Téléphone</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  className="form-input"
                  value={profile.phoneNumber}
                  onChange={(e) => setProfile(p => ({...p, phoneNumber: e.target.value}))}
                  disabled={loadingInfo || loadingPicture}
                />
              </div>
              
              <button type="submit" className="btn btn-primary" disabled={loadingInfo || loadingPicture} style={{width: '100%'}}>
                {loadingInfo ? 'Sauvegarde...' : 'Sauvegarder les informations'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileEditModal;