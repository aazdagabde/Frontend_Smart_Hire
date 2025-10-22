// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="hero-section" style={{ maxWidth: '800px', margin: 'auto' }}> {/* Style ajouté pour centrer */}
      <h1 className="hero-title">Bienvenue sur SmartHire</h1>
      <p className="hero-subtitle">
        La plateforme intelligente pour optimiser votre recrutement ou trouver l'emploi idéal.
      </p>
      {!currentUser ? (
        <div className="hero-buttons">
          <Link to="/login" className="btn btn-primary">Se connecter</Link>
          <Link to="/register" className="btn btn-primary" style={{ background: 'transparent', border: '2px solid white' }}>
            S'inscrire
          </Link>
        </div>
      ) : (
         <div style={{ marginTop: '2rem' }}>
             <p style={{ fontSize: '1.1rem'}}>Vous êtes connecté.</p>
             <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem', width: 'auto' }}>
                 Accéder au Dashboard
             </Link>
         </div>
      )}
    </div>
  );
};

export default HomePage;