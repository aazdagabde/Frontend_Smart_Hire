// src/pages/Auth/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css'; // Assurez-vous d'importer le CSS (code fourni plus bas)

// Icônes SVG simples
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation(); 
  const { login } = useAuth(); 

  const from = location.state?.from?.pathname || "/dashboard";

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setMessage(''); 
    setLoading(true); 

    try {
      await login(email, password);
      navigate(from, { replace: true }); 
    } catch (error) {
      console.error("Erreur de connexion:", error);
      const errorMessage = error.response?.data?.message || error.message || "Email ou mot de passe incorrect.";
      setMessage(errorMessage);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* En-tête avec Logo (Placeholder texte ici) */}
        <div className="auth-header">
          <h1 className="brand-logo">SmartHire</h1>
          <p className="auth-subtitle">Bienvenue ! Connectez-vous pour continuer.</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          
          <div className="input-group">
            <label htmlFor="email">Email professionnel</label>
            <div className="input-wrapper">
              <MailIcon />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@smarthire.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="input-group">
            <div className="label-row">
              <label htmlFor="password">Mot de passe</label>
            </div>
            <div className="input-wrapper">
              <LockIcon />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <div className="forgot-password">
                <Link to="/forgot-password">Mot de passe oublié ?</Link>
            </div>
          </div>

          {message && (
            <div className="message-box error">
              <span className="icon">⚠️</span> {message}
            </div>
          )}

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Se connecter'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Pas encore de compte ? <Link to="/register" className="link-highlight">Créer un compte</Link></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;