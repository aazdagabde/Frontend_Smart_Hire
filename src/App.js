import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';

// Importe tes composants de page
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Composant HomePage amélioré
const HomePage = () => (
  <div className="hero-section">
    <h1 className="hero-title">Bienvenue sur Notre Plateforme</h1>
    <p className="hero-subtitle">
      Découvrez une expérience utilisateur exceptionnelle avec notre application moderne et sécurisée.
    </p>
    <div className="hero-buttons">
      <Link to="/login" className="btn btn-primary">Se connecter</Link>
      <Link to="/register" className="btn btn-primary" style={{background: 'transparent', border: '2px solid white'}}>
        S'inscrire
      </Link>
    </div>
  </div>
);

// Composant Dashboard amélioré
const DashboardPage = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Simuler une déconnexion
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="dashboard-card">
      <h2 className="dashboard-title">Tableau de Bord</h2>
      <p>Bienvenue dans votre espace personnel !</p>
      <p>Vous êtes maintenant connecté à votre compte.</p>
      <button className="btn btn-primary" onClick={handleLogout} style={{marginTop: '2rem', width: 'auto'}}>
        Se déconnecter
      </button>
    </div>
  );
};

function App() {
  const user = localStorage.getItem('user'); // Simulation simple d'authentification

  return (
    <div className="App">
      {/* Barre de navigation améliorée */}
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">MonApp</Link>
          <ul className="nav-menu">
            <li>
              <Link to="/" className="nav-link">Accueil</Link>
            </li>
            {!user ? (
              <>
                <li>
                  <Link to="/login" className="nav-link">Connexion</Link>
                </li>
                <li>
                  <Link to="/register" className="nav-button">Inscription</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/dashboard" className="nav-link">Dashboard</Link>
                </li>
                <li>
                  <button 
                    className="nav-button" 
                    onClick={() => {
                      localStorage.removeItem('user');
                      window.location.reload();
                    }}
                  >
                    Déconnexion
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;