import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Validation simple
      if (email === 'admin@example.com' && password === 'password') {
        localStorage.setItem('user', JSON.stringify({ email, name: 'Admin' }));
        setMessage('Connexion réussie ! Redirection...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        throw new Error('Email ou mot de passe incorrect');
      }
    } catch (error) {
      setMessage(error.message);
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

      {/* Compte de démonstration */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(67, 97, 238, 0.1)', borderRadius: 'var(--border-radius)', fontSize: '0.9rem' }}>
        <p style={{ margin: 0, color: 'var(--primary-color)' }}>
          <strong>Compte de test :</strong><br />
          Email: admin@example.com<br />
          Mot de passe: password
        </p>
      </div>
    </div>
  );
}

export default LoginPage;