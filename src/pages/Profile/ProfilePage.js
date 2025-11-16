// src/pages/Profile/ProfilePage.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProfileService from '../../services/ProfileService';

// Style simple pour la page (vous pouvez l'intégrer à votre App.css)
const profileStyles = `
  .profile-container {
    display: flex;
    flex-wrap: wrap; /* Pour la responsivité sur petits écrans */
    gap: 2rem;
    max-width: 900px;
    margin: auto;
  }
  .profile-picture-section {
    flex: 1;
    min-width: 250px; /* Largeur min */
    text-align: center;
  }
  .profile-form-section {
    flex: 2;
    min-width: 300px; /* Largeur min */
  }
  .profile-picture {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
    background-color: #eee;
    margin-bottom: 1rem;
    border: 3px solid var(--border-color);
  }
`;

// DÉPLACER CETTE LIGNE À L'EXTÉRIEUR DU COMPOSANT
// Cela résout le warning de React Hook (exhaustive-deps)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

function ProfilePage() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(''); // Pour les succès/erreurs
  const [error, setError] = useState('');

  // Pour la photo de profil
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // 1. Charger les données du profil au montage
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await ProfileService.getProfile();
        setProfile({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phoneNumber: data.phoneNumber || ''
        });
        // Mettre à jour l'URL de l'image (en forçant la re-génération pour éviter le cache)
        if (data.hasProfilePicture) {
          setProfilePicUrl(`${API_URL}/profile/${currentUser.id}/picture?timestamp=${new Date().getTime()}`);
        }
      } catch (err) {
        setError("Erreur lors du chargement du profil. " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && currentUser.id) {
        fetchProfile();
    }
    // API_URL n'est plus une dépendance car elle est définie à l'extérieur
  }, [currentUser]); // Re-charger si l'utilisateur change

  // 2. Gérer le changement des champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // 3. Gérer la soumission du formulaire (Nom, Tél)
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const updatedData = await ProfileService.updateProfile(profile);
      setMessage("Profil mis à jour avec succès !");
      // Mettre à jour l'état local avec les données retournées (au cas où)
      setProfile({
        firstName: updatedData.firstName || '',
        lastName: updatedData.lastName || '',
        phoneNumber: updatedData.phoneNumber || ''
      });
    } catch (err) {
      setError("Erreur lors de la mise à jour. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Gérer la sélection du fichier image
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // 5. Gérer l'upload de la nouvelle image
  const handlePictureUpload = async () => {
    if (!selectedFile) return;

    setMessage('');
    setError('');
    setUploading(true);

    try {
      await ProfileService.updateProfilePicture(selectedFile);
      setMessage("Photo de profil mise à jour !");
      // Mettre à jour l'URL de l'image (avec timestamp pour forcer le rechargement)
      setProfilePicUrl(`${API_URL}/profile/${currentUser.id}/picture?timestamp=${new Date().getTime()}`);
      setSelectedFile(null); // Réinitialiser le fichier
      if(fileInputRef.current) fileInputRef.current.value = ""; // Vider le champ input file
    } catch (err) {
      setError("Erreur lors de l'upload. " + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading && !profile.firstName) {
    return <div className="loading" style={{textAlign: 'center', padding: '2rem'}}>Chargement du profil...</div>;
  }

  return (
    <>
      {/* Injecter le CSS */}
      <style>{profileStyles}</style>

      <div className="form-card" style={{ maxWidth: '900px' }}>
        <h2 className="form-title">Mon Profil</h2>

        {/* Affichage des messages */}
        {message && <div className="message message-success">{message}</div>}
        {error && <div className="message message-error">{error}</div>}

        <div className="profile-container">
          
          {/* Section Photo de Profil */}
          <div className="profile-picture-section">
            <img 
              src={profilePicUrl || '/default-avatar.png'} // Prévoyez une image par défaut
              alt="Profil" 
              className="profile-picture" 
              onError={(e) => { e.target.src = '/default-avatar.png'; }} // Fallback
            />
            
            <div className="form-group">
              <label htmlFor="picture" className="form-label">Changer de photo</label>
              <input
                type="file"
                id="picture"
                className="form-input"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </div>
            <button 
              onClick={handlePictureUpload} 
              className="btn btn-secondary" 
              disabled={uploading || !selectedFile}
              style={{width: '100%'}}
            >
              {uploading ? 'Envoi...' : 'Mettre à jour la photo'}
            </button>
          </div>

          {/* Section Formulaire d'informations */}
          <div className="profile-form-section">
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  value={currentUser.email}
                  disabled // L'email ne doit pas être modifiable
                />
              </div>

              <div className="form-group">
                <label htmlFor="firstName" className="form-label">Prénom</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="form-input"
                  value={profile.firstName}
                  onChange={handleChange}
                  placeholder="Votre prénom"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">Nom</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="form-input"
                  value={profile.lastName}
                  onChange={handleChange}
                  placeholder="Votre nom"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber" className="form-label">Téléphone</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  className="form-input"
                  value={profile.phoneNumber}
                  onChange={handleChange}
                  placeholder="Votre numéro de téléphone"
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfilePage;