// src/components/Layout.js
import React, { useState, useEffect } from 'react'; // Ajout de useEffect
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; //
import { useTheme } from '../contexts/ThemeContext'; //

// NOUVEAUX IMPORTS
import ProfileAvatar from './profile/ProfileAvatar';
import ProfileEditModal from './profile/ProfileEditModal';

// Icons améliorés
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const Layout = () => {
  const { currentUser, logout } = useAuth(); //
  const { theme, toggleTheme } = useTheme(); //
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- NOUVELLE LOGIQUE D'ÉTAT ---
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [avatarRefreshKey, setAvatarRefreshKey] = useState(0);

  // --- NOUVELLE LOGIQUE "PREMIÈRE CONNEXION" ---
  useEffect(() => {
    // Vérifie si l'indicateur 'isFirstLogin' est dans sessionStorage
    const isFirst = sessionStorage.getItem('isFirstLogin');
    
    if (currentUser && isFirst) {
      setIsProfileModalOpen(true); // Ouvre le modal
      sessionStorage.removeItem('isFirstLogin'); // Supprime l'indicateur
    }
  }, [currentUser]); // Se déclenche quand currentUser est chargé

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  }

  const isRecruiter = currentUser?.roles?.some(role => role === 'ROLE_RH' || role === 'ROLE_ADMIN');
  const isCandidate = currentUser?.roles?.includes('ROLE_CANDIDAT');
  
  // Fonction pour fermer le modal de profil
  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  // Fonction pour rafraîchir l'avatar après mise à jour
  const handleProfileUpdate = () => {
    setAvatarRefreshKey(key => key + 1);
    // TODO (Optionnel): Mettre à jour le 'currentUser' dans AuthContext
    // si le nom/prénom a changé, pour qu'il s'affiche
    // instantanément dans la navbar sans rafraîchir la page.
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
            SmartHire
          </Link>

          {/* Menu Desktop */}
          <ul className="nav-menu">
            <li><Link to="/" className="nav-link">Accueil</Link></li>
            <li><Link to="/offers" className="nav-link">Offres</Link></li>
            
            {!currentUser ? (
              <>
                <li><Link to="/login" className="nav-link">Connexion</Link></li>
                <li><Link to="/register" className="nav-button">Inscription</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/dashboard" className="nav-link">Dashboard</Link></li>
                {isRecruiter && (
                  <li><Link to="/offers/manage" className="nav-link">Gérer Offres</Link></li>
                )}
                {isCandidate && (
                  <li><Link to="/my-applications" className="nav-link">Mes Candidatures</Link></li>
                )}
                <li className="nav-user-info" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  
                  {/* --- MODIFICATION ICI --- */}
                  <ProfileAvatar 
                    onClick={() => setIsProfileModalOpen(true)}
                    refreshKey={avatarRefreshKey}
                  />
                  <span className="nav-user-name" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {currentUser.firstName || currentUser.email}
                  </span>
                  {/* --- FIN MODIFICATION --- */}

                  <button className="nav-button" onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>
                    Déconnexion
                  </button>
                </li>
              </>
            )}
            
            {/* Theme Toggle Button */}
            <li>
              <button 
                onClick={toggleTheme} 
                className="theme-toggle-button" 
                aria-label={`Passer en mode ${theme === 'dark' ? 'clair' : 'sombre'}`}
                title={`Mode ${theme === 'dark' ? 'clair' : 'sombre'}`}
              >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
            </li>
          </ul>

          {/* Burger Button */}
          <button 
            className={`nav-burger ${isMobileMenuOpen ? 'toggle' : ''}`} 
            onClick={toggleMobileMenu}
            aria-label="Menu"
            aria-expanded={isMobileMenuOpen}
          >
            <div className="line1"></div>
            <div className="line2"></div>
            <div className="line3"></div>
          </button>
        </div>

        {/* Mobile Menu */}
        <ul className={`nav-menu-mobile ${isMobileMenuOpen ? 'active' : ''}`}>
          <li><Link to="/" className="nav-link" onClick={closeMobileMenu}>Accueil</Link></li>
          <li><Link to="/offers" className="nav-link" onClick={closeMobileMenu}>Offres</Link></li>
          
          {!currentUser ? (
            <>
              <li><Link to="/login" className="nav-link" onClick={closeMobileMenu}>Connexion</Link></li>
              <li><Link to="/register" className="nav-button" onClick={closeMobileMenu}>Inscription</Link></li>
            </>
          ) : (
            <>
              {/* --- MODIFICATION MENU MOBILE --- */}
              <li style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ProfileAvatar 
                  onClick={() => {
                    setIsProfileModalOpen(true);
                    closeMobileMenu();
                  }}
                  refreshKey={avatarRefreshKey}
                />
                <span className="nav-user-name" style={{ color: 'var(--text-color)', fontWeight: 'bold' }}>
                  {currentUser.firstName || currentUser.email}
                </span>
              </li>
              {/* --- FIN MODIFICATION --- */}
            
              <li><Link to="/dashboard" className="nav-link" onClick={closeMobileMenu}>Dashboard</Link></li>
              {isRecruiter && (
                <li><Link to="/offers/manage" className="nav-link" onClick={closeMobileMenu}>Gérer Offres</Link></li>
              )}
              {isCandidate && (
                <li><Link to="/my-applications" className="nav-link" onClick={closeMobileMenu}>Mes Candidatures</Link></li>
              )}
              <li className="nav-user-info" style={{ padding: '1rem' }}>
                 <button className="nav-button" onClick={handleLogout} style={{ width: '100%' }}>
                    Déconnexion
                  </button>
              </li>
            </>
          )}
          
          {/* Theme Toggle Button Mobile */}
          <li>
            <button 
              onClick={() => { 
                toggleTheme(); 
                closeMobileMenu(); 
              }} 
              className="theme-toggle-button-mobile" 
              aria-label={`Passer en mode ${theme === 'dark' ? 'clair' : 'sombre'}`}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              <span>Mode {theme === 'dark' ? 'clair' : 'sombre'}</span>
            </button>
          </li>
        </ul>
      </nav>

      <main className="container">
        <Outlet />
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} SmartHire. Tous droits réservés.</p>
      </footer>

      {/* --- AJOUT DU MODAL À LA FIN DU LAYOUT --- */}
      {/* Le modal est appelé ici. Il est invisible par défaut 
        (show={isProfileModalOpen} est false) et ne s'affiche
        que lorsque isProfileModalOpen devient true.
      */}
      <ProfileEditModal 
        show={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default Layout;