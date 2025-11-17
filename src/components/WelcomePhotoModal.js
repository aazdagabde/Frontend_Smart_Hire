// src/components/WelcomePhotoModal.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileService from '../services/ProfileService';
// Assurez-vous d'avoir un style CSS pour le modal (ex: 'Modal.css')
// import './Modal.css'; 

const WelcomePhotoModal = () => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setShowUploadPhotoModal, refreshUserData } = useAuth();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Veuillez sélectionner un fichier.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await ProfileService.uploadPicture(file);
            await refreshUserData(); // Rafraîchir le contexte (mettra à jour hasProfilePicture)
            setShowUploadPhotoModal(false); // Fermer le modal
        } catch (err) {
            setError("Échec de l'envoi. Veuillez réessayer.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Style simple pour le modal (à remplacer par votre système de modals si vous en avez un)
    const modalStyle = {
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        backgroundColor: 'white', padding: '20px', zIndex: 1000,
        border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    };
    const overlayStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999
    };

    return (
        <>
            <div style={overlayStyle} onClick={() => setShowUploadPhotoModal(false)}></div>
            <div style={modalStyle}>
                <h4>Bienvenue !</h4>
                <p>Nous avons remarqué que vous n'avez pas de photo de profil. Veuillez en ajouter une.</p>
                <form onSubmit={handleSubmit}>
                    <div style={{ margin: '10px 0' }}>
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                    </div>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Envoi...' : 'Enregistrer la photo'}
                    </button>
                    <button type="button" onClick={() => setShowUploadPhotoModal(false)} style={{ marginLeft: '10px' }}>
                        Plus tard
                    </button>
                </form>
            </div>
        </>
    );
};

export default WelcomePhotoModal;