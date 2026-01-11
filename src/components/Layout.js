// src/components/Layout.js
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Imports des composants Profil 
import ProfileAvatar from './Profile/ProfileAvatar';
import ProfileEditModal from './Profile/ProfileEditModal';

// Import du fichier CSS corrigé
import './Layout.css';

// Icônes SVG simples
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
);

const Layout = () => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [avatarRefreshKey, setAvatarRefreshKey] = useState(0);

  // --- Logique "Première Connexion" ---
  useEffect(() => {
    const isFirst = sessionStorage.getItem('isFirstLogin');
    if (currentUser && isFirst) {
      setIsProfileModalOpen(true);
      sessionStorage.removeItem('isFirstLogin');
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
      navigate('/login');
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Fonction pour vérifier la route active
  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  // Rôles
  const isRecruiter = currentUser?.roles?.some(role => role === 'ROLE_RH' || role === 'ROLE_ADMIN');
  const isCandidate = currentUser?.roles?.includes('ROLE_CANDIDAT');
  
  const handleCloseProfileModal = () => setIsProfileModalOpen(false);
  const handleProfileUpdate = () => setAvatarRefreshKey(prev => prev + 1);

  return (
    <div className="layout-wrapper">
      
      {/* ==================== NAVBAR ==================== */}
      <nav className="navbar">
        <div className="nav-container">
          
          {/* 1. Logo */}
          <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
            <span>⚡</span>Smart<span className="logo-highlight">Hire</span>
          </Link>

          {/* 2. Menu Central (Desktop) */}
          <ul className="nav-menu">
            <li><Link to="/" className={isActive('/')}>Accueil</Link></li>
            <li><Link to="/offers" className={isActive('/offers')}>Offres</Link></li>
            
            {currentUser && (
              <>
                <li><Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link></li>
                {isRecruiter && (
                  <li><Link to="/offers/manage" className={isActive('/offers/manage')}>Gérer Les offres</Link></li>
                )}
                {isCandidate && (
                  <li><Link to="/my-applications" className={isActive('/my-applications')}>Candidatures</Link></li>
                )}
              </>
            )}
          </ul>

          {/* 3. Zone Droite (Auth & Tools) */}
          <div className="nav-auth-buttons">
            <button onClick={toggleTheme} className="theme-toggle-btn" title="Changer de thème">
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {!currentUser ? (
              <>
                <Link to="/login" className="nav-btn-login">Connexion</Link>
                <Link to="/register" className="nav-btn-register">S'inscrire</Link>
              </>
            ) : (
              <div className="nav-user-info">
                {/* Avatar cliquable pour ouvrir le modal */}
                <div onClick={() => setIsProfileModalOpen(true)} style={{cursor: 'pointer'}} title="Mon Profil">
                   <ProfileAvatar 
                    refreshKey={avatarRefreshKey}
                    size={35}
                  />
                </div>
                
                <span className="nav-user-name">
                  {currentUser.firstName || currentUser.email}
                </span>

                <button className="btn-logout" onClick={handleLogout}>
                  Sortir
                </button>
              </div>
            )}
          </div>

          {/* 4. Burger Menu (Mobile Only) */}
          <button 
            className="nav-burger" 
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            <div style={{transform: isMobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none', opacity: isMobileMenuOpen ? 1 : 1}}></div>
            <div style={{opacity: isMobileMenuOpen ? 0 : 1}}></div>
            <div style={{transform: isMobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none', opacity: isMobileMenuOpen ? 1 : 1}}></div>
          </button>
        </div>

        {/* ==================== MENU MOBILE DÉROULANT ==================== */}
        <div className={`nav-menu-mobile ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMobileMenu}>Accueil</Link>
          <Link to="/offers" className="nav-link" onClick={closeMobileMenu}>Offres</Link>

          {currentUser && (
            <>
              <Link to="/dashboard" className="nav-link" onClick={closeMobileMenu}>Dashboard</Link>
              {isRecruiter && <Link to="/offers/manage" className="nav-link" onClick={closeMobileMenu}>Gérer les offres</Link>}
              {isCandidate && <Link to="/my-applications" className="nav-link" onClick={closeMobileMenu}>Mes Candidatures</Link>}
              
              <div style={{borderTop: '1px solid var(--card-border)', margin: '10px 0'}}></div>
              
              <div 
                style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', cursor: 'pointer'}} 
                onClick={() => {setIsProfileModalOpen(true); closeMobileMenu();}}
              >
                <ProfileAvatar refreshKey={avatarRefreshKey} size={40} />
                <span style={{fontWeight: 'bold', color: 'var(--text-main)'}}>Mon Profil</span>
              </div>
              
              <button className="btn-logout" onClick={handleLogout} style={{width: '100%'}}>
                Déconnexion
              </button>
            </>
          )}

          {!currentUser && (
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px'}}>
              <Link to="/login" className="nav-btn-login" onClick={closeMobileMenu} style={{textAlign: 'center'}}>Connexion</Link>
              <Link to="/register" className="nav-btn-register" onClick={closeMobileMenu} style={{textAlign: 'center'}}>Créer un compte</Link>
            </div>
          )}
          
          <div style={{display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
             <button onClick={() => {toggleTheme();}} className="theme-toggle-btn">
               {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
             </button>
          </div>
        </div>
      </nav>

      {/* ==================== CONTENT & FOOTER ==================== */}
      <main className="layout-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} SmartHire. Innovation Recrutement.</p>
      </footer>

      {/* ==================== MODAL PROFIL ==================== */}
      <ProfileEditModal 
        show={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default Layout;