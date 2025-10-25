// src/components/Layout.js
import React, { useState } from 'react'; // Importer useState pour gérer l'état du menu mobile
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Ajustez le chemin si nécessaire
import '../styles/App.css'; // Ajustez le chemin si nécessaire

const Layout = () => {
  const { currentUser, logout } = useAuth(); // Utilise le contexte pour l'état et la déconnexion
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // État pour gérer l'ouverture/fermeture du menu mobile

  const handleLogout = () => {
    logout(); // Appel de la fonction de déconnexion du contexte
    setIsMobileMenuOpen(false); // Fermer le menu mobile lors de la déconnexion
    navigate('/login'); // Rediriger vers la page de connexion après logout
  };

  // Fonction pour basculer l'état du menu mobile
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Fonction pour fermer le menu mobile (utile après avoir cliqué sur un lien)
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  }

  // Détermine si l'utilisateur a un rôle RH/Admin (simplifié)
  const isRecruiter = currentUser?.roles?.some(role => role === 'ROLE_RH' || role === 'ROLE_ADMIN');
  // Détermine si l'utilisateur est un candidat
  const isCandidate = currentUser?.roles?.includes('ROLE_CANDIDAT');


  return (
    <div className="App">
      {/* Barre de Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          {/* Logo/Titre cliquable ramenant à l'accueil */}
          {/* Ajout de onClick pour fermer le menu mobile si on clique sur le logo */}
          <Link to="/" className="nav-logo" onClick={closeMobileMenu}>SmartHire</Link>

          {/* Menu Desktop (sera masqué sur mobile par CSS via la classe .nav-menu) */}
          <ul className="nav-menu">
            <li><Link to="/" className="nav-link">Accueil</Link></li>
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
                 {/* Lien pour Mes Candidatures si Candidat */}
                 {isCandidate && (
                   <li><Link to="/my-applications" className="nav-link">Mes Candidatures</Link></li>
                 )}
                {/* Section utilisateur connecté */}
                {/* Utilisation de la classe nav-user-info pour styliser */}
                <li className="nav-user-info">
                  <span className="nav-user-name">
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

          {/* Bouton Burger (sera affiché sur mobile par CSS via la classe .nav-burger) */}
          {/* Ajout de la classe 'toggle' dynamiquement pour l'animation */}
          <button className={`nav-burger ${isMobileMenuOpen ? 'toggle' : ''}`} onClick={toggleMobileMenu} aria-label="Menu">
            <div className="line1"></div>
            <div className="line2"></div>
            <div className="line3"></div>
          </button>
        </div>

        {/* Menu Mobile (affiché conditionnellement en ajoutant la classe 'active') */}
        {/* Ajout de onClick={closeMobileMenu} sur chaque lien pour fermer le menu après navigation */}
        <ul className={`nav-menu-mobile ${isMobileMenuOpen ? 'active' : ''}`}>
           <li><Link to="/" className="nav-link" onClick={closeMobileMenu}>Accueil</Link></li>
           <li><Link to="/offers" className="nav-link" onClick={closeMobileMenu}>Voir les Offres</Link></li>
           {!currentUser ? (
             <>
               <li><Link to="/login" className="nav-link" onClick={closeMobileMenu}>Connexion</Link></li>
               <li><Link to="/register" className="nav-button" onClick={closeMobileMenu}>Inscription</Link></li>
             </>
           ) : (
             <>
               <li><Link to="/dashboard" className="nav-link" onClick={closeMobileMenu}>Dashboard</Link></li>
               {isRecruiter && (
                  <li><Link to="/offers/manage" className="nav-link" onClick={closeMobileMenu}>Gérer Offres</Link></li>
               )}
                {isCandidate && (
                  <li><Link to="/my-applications" className="nav-link" onClick={closeMobileMenu}>Mes Candidatures</Link></li>
                )}
               {/* Section utilisateur connecté dans le menu mobile */}
               <li className="nav-user-info">
                 <span className="nav-user-name">
                    {currentUser.firstName || currentUser.email}
                 </span>
                 <button className="nav-button" onClick={handleLogout}> {/* handleLogout ferme déjà le menu */}
                   Déconnexion
                 </button>
               </li>
             </>
           )}
        </ul>
      </nav>

      {/* Conteneur principal où le contenu des routes sera affiché */}
      <main className="container">
        <Outlet /> {/* Affiche le composant correspondant à la route enfant active */}
      </main>

      {/* Footer (inchangé) */}
       <footer style={{ textAlign: 'center', padding: '1.5rem', marginTop: 'auto', background: 'rgba(10, 25, 47, 0.8)', borderTop: '1px solid rgba(100, 255, 218, 0.1)', color: 'var(--slate)'}}>
           <p>&copy; {new Date().getFullYear()} SmartHire. Tous droits réservés.</p>
       </footer>
    </div>
  );
};

export default Layout;