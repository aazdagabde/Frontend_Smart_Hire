import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './HomePage.css';

// CORRECTION MAJEURE ICI : Utilisation du nom de fichier exact uploadé
// Si ce fichier n'est pas dans src/assets, déplacez-le ou ajustez le chemin !
import heroImage from '../assets/home_im1.png'; 

const HomePage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="home-container">
      
      {/* ==================== HERO SECTION ==================== */}
      <div className="hero-wrapper">
        <div className="hero-content">
          <span className="badge-pro">🚀 IA & Recrutement 2.0</span>
          
          <h1 className="hero-title">
            Recrutez <br />
            <span>Sans Limites.</span>
          </h1>
          
          <p className="hero-subtitle">
            SmartHire transforme votre processus d'embauche. Analyse de CV par IA, scoring automatique et workflows intelligents. 
            <strong>Dites adieu aux tâches répétitives.</strong>
          </p>

          <div className="action-area">
            {!currentUser ? (
              <div className="hero-buttons">
                <Link to="/register" className="btn-custom btn-primary-pro">
                  Commencer l'Essai
                </Link>
                <Link to="/login" className="btn-custom btn-secondary-pro">
                  Connexion
                </Link>
              </div>
            ) : (
              <div className="hero-buttons-logged">
                <div style={{width: '100%', marginBottom: '15px', color: 'var(--text-accent)', fontWeight: '600'}}>
                  👋 Heureux de vous revoir !
                </div>
                <Link to="/dashboard" className="btn-custom btn-primary-pro">
                  Accéder au Dashboard
                </Link>
                <Link to="/offers" className="btn-custom btn-secondary-pro">
                  Voir les offres
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="hero-visual">
          <img 
            src={heroImage} 
            alt="Dashboard Interface SmartHire" 
            className="hero-img-pro"
            // Ajout d'une protection au cas où l'image ne charge pas
            onError={(e) => {e.target.style.display='none'; console.error("Erreur chargement image");}} 
          />
        </div>
      </div>

      {/* ==================== STATS BAR ==================== */}
      <div className="stats-bar">
        <div className="stat-item">
          <h3>10x</h3>
          <p>Plus Rapide</p>
        </div>
        <div className="stat-item">
          <h3>98%</h3>
          <p>Précision IA</p>
        </div>
        <div className="stat-item">
          <h3>24/7</h3>
          <p>Disponibilité</p>
        </div>
      </div>

      {/* ==================== FEATURES SECTION ==================== */}
      <section className="section-container features-section">
        <div className="section-header">
          <h2>La Puissance de l'IA</h2>
          <p>Des outils conçus pour les recruteurs exigeants et les candidats ambitieux.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="icon-box">🧠</div>
            <h3>Analyse Sémantique</h3>
            <p>Gemini AI comprend le parcours du candidat au-delà des mots-clés simples pour un matching parfait.</p>
          </div>

          <div className="feature-card">
            <div className="icon-box">📊</div>
            <h3>Scoring Instantané</h3>
            <p>Classez 500 candidatures en 2 secondes. Identifiez immédiatement le top 5% des profils.</p>
          </div>

          <div className="feature-card">
            <div className="icon-box">⚡</div>
            <h3>Automation n8n</h3>
            <p>Envoyez des e-mails personnalisés et planifiez des entretiens sans lever le petit doigt.</p>
          </div>

          <div className="feature-card">
            <div className="icon-box">📱</div>
            <h3>App Mobile Flutter</h3>
            <p>Une expérience fluide pour les candidats. Notifications push pour chaque étape du processus.</p>
          </div>
        </div>
      </section>

      {/* ==================== AUDIENCE SECTION (DARK CONTRAST) ==================== */}
      <section className="section-container audience-section">
        <div className="audience-grid">
          <div className="audience-card">
            <h3>🏢 Entreprises</h3>
            <ul className="check-list">
              <li>✅ Diffusion d'offres multi-canaux</li>
              <li>✅ Vivier de talents qualifiés</li>
              <li>✅ Collaboration en équipe</li>
              <li>✅ Analytics de performance</li>
            </ul>
          </div>
          
          <div className="audience-card">
            <h3>👨‍💻 Candidats</h3>
            <ul className="check-list">
              <li>✅ CV Parser intelligent (PDF)</li>
              <li>✅ Matching d'offres personnalisé</li>
              <li>✅ Suivi transparent</li>
              <li>✅ Candidature en 1 clic</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="home-footer">
        <p>© 2025 SmartHire. Le futur du recrutement.</p>
      </footer>

    </div>
  );
};

export default HomePage;