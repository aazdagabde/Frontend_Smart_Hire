// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AuthService from '../services/AuthService';
import ProfileService from '../services/ProfileService'; // Importer le service de profil

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // Nouvel état pour gérer le modal de photo
    const [showUploadPhotoModal, setShowUploadPhotoModal] = useState(false);

    // Au montage du composant, vérifier si un utilisateur est déjà dans le localStorage
    useEffect(() => {
        const user = AuthService.getCurrentUser(); 
        if (user) {
            setCurrentUser(user);
        }
        setLoading(false);
    }, []);

    const login = async (email, password, rememberMe) => {
        try {
            // 1. Connexion
            const loginResponse = await AuthService.login(email, password, rememberMe);
            
            // 2. Récupérer le profil complet
            // Nous avons besoin de ProfileService pour obtenir 'hasProfilePicture'
            try {
                const profileData = await ProfileService.getProfile();
                const userWithProfile = {
                    ...loginResponse,
                    ...profileData
                };
                setCurrentUser(userWithProfile); // Stocker le profil complet

                // 3. Vérifier si la photo manque et déclencher le modal
                if (!profileData.hasProfilePicture) {
                    setShowUploadPhotoModal(true);
                }

            } catch (profileError) {
                console.error("Erreur lors de la récupération du profil:", profileError);
                // Gérer le cas où le profil n'existe pas ou l'appel échoue
                // Pour l'instant, on connecte l'utilisateur sans la vérification de la photo
                setCurrentUser(loginResponse); // Solution de repli
            }
            
            return loginResponse;

        } catch (error) {
            console.error("Erreur de connexion:", error);
            setCurrentUser(null);
            AuthService.logout();
            throw error;
        }
    };

    const logout = () => {
        AuthService.logout();
        setCurrentUser(null);
        setShowUploadPhotoModal(false);
    };

    // Fonction pour rafraîchir les données utilisateur (après upload par exemple)
    const refreshUserData = async () => {
        try {
            const profileData = await ProfileService.getProfile();
            setCurrentUser(prevUser => ({
                ...prevUser,
                ...profileData
            }));
        } catch (error) {
            console.error("Erreur lors du rafraîchissement du profil:", error);
            // Déconnexion si le profil ne peut être récupéré
            logout(); 
        }
    };

    const value = {
        currentUser,
        loading,
        login,
        logout,
        refreshUserData, // Exposer la fonction
        showUploadPhotoModal, // Exposer l'état
        setShowUploadPhotoModal, // Exposer le setter
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem' }}>
                Chargement...
            </div>
        ); 
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};