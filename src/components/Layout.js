// src/components/Layout.js
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Ajustez le chemin si nécessaire
import '../styles/App.css'; // Ajustez le chemin si nécessaire

const Layout = () => {
  const { currentUser, logout } = useAuth(); // Utilise le contexte pour l'état et la déconnexion
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Appel de la fonction de déconnexion du contexte
    navigate('/login'); // Rediriger vers la page de connexion après logout
  };

  // Détermine si l'utilisateur a un rôle RH/Admin (simplifié)
  const isRecruiter = currentUser?.roles?.some(role => role === 'ROLE_RH' || role === 'ROLE_ADMIN');
  // AJOUT: Détermine si l'utilisateur est un candidat
  const isCandidate = currentUser?.roles?.includes('ROLE_CANDIDAT');


  return (
    <div className="App">
      {/* Barre de Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          {/* Logo/Titre cliquable ramenant à l'accueil */}
          <Link to="/" className="nav-logo">SmartHire</Link>

          {/* Menu de navigation */}
          <ul className="nav-menu">
            <li><Link to="/" className="nav-link">Accueil</Link></li>

            {/* Lien pour voir les offres, visible par tous */}
            <li><Link to="/offers" className="nav-link">Voir les Offres</Link></li>

            {/* Liens conditionnels : Non connecté */}
            {!currentUser ? (
              <>
                <li><Link to="/login" className="nav-link">Connexion</Link></li>
                <li><Link to="/register" className="nav-button">Inscription</Link></li>
              </>
            ) : (
              // Liens conditionnels : Connecté
              <>
                <li><Link to="/dashboard" className="nav-link">Dashboard</Link></li>

                {/* Lien pour gérer les offres si RH/Admin */}
                {isRecruiter && (
                   <li><Link to="/offers/manage" className="nav-link">Gérer Offres</Link></li>
                )}

                 {/* AJOUT: Lien pour Mes Candidatures si Candidat */}
                 {isCandidate && (
                   <li><Link to="/my-applications" className="nav-link">Mes Candidatures</Link></li>
                 )}

                {/* Section utilisateur connecté */}
                <li style={{ display: 'flex', alignItems: 'center' }}> {/* Conteneur pour aligner texte et bouton */}
                  <span style={{ marginRight: '1rem', color: 'var(--light-slate)' /* var(--gray-color) remplacé */ }}>
                     {/* Afficher Prénom ou Email */}
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

      {/* Conteneur principal où le contenu des routes sera affiché */}
      <main className="container">
        <Outlet /> {/* Affiche le composant correspondant à la route enfant active */}
      </main>

      {/* Optionnel: Footer - Décommenté et style ajusté */}
       <footer style={{ textAlign: 'center', padding: '1.5rem', marginTop: 'auto', background: 'rgba(10, 25, 47, 0.8)', borderTop: '1px solid rgba(100, 255, 218, 0.1)', color: 'var(--slate)'}}>
           <p>&copy; {new Date().getFullYear()} SmartHire. Tous droits réservés.</p>
         </footer>
    </div>
  );
};

export default Layout;