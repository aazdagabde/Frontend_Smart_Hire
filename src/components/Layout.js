// src/components/Layout.js
import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
// CORRECTION : Importer les hooks au lieu des contextes
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Importer le composant d'image de profil
import ProfilePicture from './ProfilePicture';

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
  // CORRECTION : Utiliser les hooks
  const { auth, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const isRecruiter = auth?.user?.roles?.some(role => role === 'ROLE_RH' || role === 'ROLE_ADMIN');
  const isCandidate = auth?.user?.roles?.includes('ROLE_CANDIDAT');

  return (
    <div className={`layout ${theme}`}>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">SmartHire</Link>
          <button 
            className="navbar-toggler" 
            type="button" 
            onClick={toggleMobileMenu}
            aria-controls="navbarNav" 
            aria-expanded={isMobileMenuOpen} 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/" onClick={closeMobileMenu}>Accueil</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/offers" onClick={closeMobileMenu}>Offres</Link>
              </li>
              {auth.isAuthenticated && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/dashboard" onClick={closeMobileMenu}>Dashboard</Link>
                  </li>
                  {isCandidate && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/my-applications" onClick={closeMobileMenu}>Mes Candidatures</Link>
                    </li>
                  )}
                  {isRecruiter && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/offers/manage" onClick={closeMobileMenu}>Gérer mes offres</Link>
                    </li>
                  )}
                </>
              )}
            </ul>
            <div className="d-flex align-items-center">
              {auth.isAuthenticated ? (
                <>
                  <span className="navbar-text me-3 d-none d-lg-inline">
                    Rôle: {auth.user.roles.join(', ')}
                  </span>
                  
                  {/* Ajout du composant (inchangé) */}
                  <ProfilePicture />

                  <button onClick={handleLogout} className="btn btn-outline-light ms-3">
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline-light me-2" onClick={closeMobileMenu}>Connexion</Link>
                  <Link to="/register" className="btn btn-primary" onClick={closeMobileMenu}>S'inscrire</Link>
                </>
              )}
              <button onClick={toggleTheme} className="btn btn-secondary ms-2">
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container my-4">
        <Outlet />
      </main>

      <footer className="footer bg-dark text-white text-center py-3">
        © {new Date().getFullYear()} SmartHire. Tous droits réservés.
      </footer>
    </div>
  );
};

export default Layout;