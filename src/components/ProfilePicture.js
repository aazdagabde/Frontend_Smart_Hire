import React, { useState, useRef, useEffect } from 'react'; // Supprimé 'useContext'
// CORRECTION : Importer le hook
import { useAuth } from '../contexts/AuthContext';
import * as ProfileService from '../services/ProfileService';
import '../styles/ProfilePicture.css'; 
// CORRECTION : react-icons v5+ utilise 'fa6'
import { FaCamera } from 'react-icons/fa6'; 

const API_BASE_URL = 'http://localhost:8080';

const ProfilePicture = () => {
    // CORRECTION : Utiliser le hook
    const { auth } = useAuth();
    
    const getImageUrl = () => `${API_BASE_URL}/api/profile/${auth.user.id}/picture`;

    const [imageKey, setImageKey] = useState(Date.now()); 
    const [showDefault, setShowDefault] = useState(false);
    const fileInputRef = useRef(null); 

    useEffect(() => {
        setImageKey(Date.now());
        setShowDefault(false);
    }, [auth.user.id]);

    const handleImageError = () => {
        setShowDefault(true); 
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { 
            alert("Erreur: Le fichier est trop volumineux (max 5MB).");
            return;
        }
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            alert("Erreur: Le fichier doit être au format JPEG ou PNG.");
            return;
        }

        try {
            // CORRECTION : Le token n'est plus passé en argument
            await ProfileService.uploadProfilePicture(file);
            
            setImageKey(Date.now());
            setShowDefault(false);
        } catch (err) {
            console.error("Erreur lors de l'upload:", err);
            alert("Erreur: " + (err.message || "Impossible de mettre à jour la photo."));
        }
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    if (!auth.user || !auth.user.id) return null;

    const defaultInitial = auth.user.email ? auth.user.email.charAt(0).toUpperCase() : '?';

    return (
        <div className="profile-picture-container" onClick={handleClick} title="Modifier la photo de profil">
            {showDefault ? (
                <div className="default-avatar">
                    <span>{defaultInitial}</span>
                </div>
            ) : (
                <img 
                    key={imageKey} 
                    src={getImageUrl()} 
                    alt="Profil" 
                    onError={handleImageError} 
                    className="profile-picture"
                />
            )}
            
            <div className="profile-picture-overlay">
                <FaCamera />
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/jpeg, image/png"
            />
        </div>
    );
};

export default ProfilePicture;