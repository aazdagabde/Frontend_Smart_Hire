// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); // Pour savoir d'où vient l'utilisateur
  const { login } = useAuth();

  // Déterminer où rediriger après connexion
  const from = location.state?.from?.pathname || "/dashboard"; // Default to dashboard

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      await login(email, password);
      setMessage('Connexion réussie ! Redirection...');
      // Rediriger vers la page d'origine ou le dashboard
      navigate(from, { replace: true });
    } catch (error) {
      // Afficher un message d'erreur plus spécifique si possible
      const errorMessage = error.response?.data?.message || error.message || 'Email ou mot de passe incorrect.';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <h2 className="form-title">Connexion</h2>
      
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Entrez votre email"
            required
            autoComplete="email"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password" className="form-label">Mot de passe</label>
          <input
            type="password"
            id="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Entrez votre mot de passe"
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading && <span className="loading"></span>}
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      {message && (
        <div className={`message ${message.includes('réussie') ? 'message-success' : 'message-error'}`}>
          {message}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p>Pas encore de compte ? <Link to="/register" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>S'inscrire</Link></p>
      </div>
    </div>
  );
}

export default LoginPage;