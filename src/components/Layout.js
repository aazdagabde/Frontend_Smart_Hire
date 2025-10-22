// src/components/Layout.js
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/App.css'; // Assurez-vous que les styles sont accessibles

const Layout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Rediriger vers login après déconnexion
  };
const isRecruiter = currentUser?.roles?.some(role => role === 'ROLE_RH' || role === 'ROLE_ADMIN');
  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">SmartHire</Link>
          <ul className="nav-menu">
            <li><Link to="/" className="nav-link">Accueil</Link></li>

            {/* Liens visibles par tous */}
            <li><Link to="/offers" className="nav-link">Voir les Offres</Link></li>

            {!currentUser ? (
              <>
                <li><Link to="/login" className="nav-link">Connexion</Link></li>
                <li><Link to="/register" className="nav-button">Inscription</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/dashboard" className="nav-link">Dashboard</Link></li>
                {/* <li><Link to="/profile" className="nav-link">Profil</Link></li> */}

                {/* Lien spécifique RH/Admin */}
                {isRecruiter && (
                   <li><Link to="/offers/manage" className="nav-link">Gérer Mes Offres</Link></li>
                )}

                 {/* Lien spécifique Candidat (si vous en ajoutez un, ex: Mes Candidatures) */}
                 {/* {!isRecruiter && (
                      <li><Link to="/applications/status" className="nav-link">Mes Candidatures</Link></li>
                 )} */}

                <li>
                  <span style={{ marginRight: '1rem', color: 'var(--gray-color)' }}>
                     {currentUser.firstName || currentUser.email}
                  </span>
                  <button className="nav-button" onClick={handleLogout}>
                    Déconnexion
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <main className="container">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;