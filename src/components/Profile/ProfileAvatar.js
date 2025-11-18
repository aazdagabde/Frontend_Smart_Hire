// src/components/Profile/ProfileAvatar.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; //
import './ProfileComponents.css'; //
import NoProfileImage from '../../assets/noprofile.jpeg'; //

// --- CORRECTION AVERTISSEMENT ---
// On déplace la constante API_URL ici, à l'extérieur du composant.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Icône de Crayon (Edit)
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const ProfileAvatar = ({ onClick, refreshKey }) => {
  const { currentUser } = useAuth();
  const [imageUrl, setImageUrl] = useState(NoProfileImage); 

  useEffect(() => {
    if (currentUser && currentUser.id) {
      const newUrl = `${API_URL}/profile/${currentUser.id}/picture?timestamp=${refreshKey}`;
      
      fetch(newUrl)
        .then(res => {
          if (res.ok) {
            setImageUrl(newUrl);
          } else {
            setImageUrl(NoProfileImage); 
          }
        })
        .catch(() => setImageUrl(NoProfileImage)); 
    }
  }, [currentUser, refreshKey]); // Dépendance correcte

  return (
    <div className="profile-avatar-container" onClick={onClick} title="Modifier le profil">
      <img
        src={imageUrl}
        alt="Avatar"
        className="profile-avatar-image"
        onError={(e) => { e.target.src = NoProfileImage; }} 
      />
      <div className="profile-avatar-overlay">
        <EditIcon />
      </div>
    </div>
  );
};

export default ProfileAvatar;