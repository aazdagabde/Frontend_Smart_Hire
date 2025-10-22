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
      // Appel réel à l'API Spring Boot
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Stocker le token JWT et les infos utilisateur
        localStorage.setItem('token', data.data.jwt);
        localStorage.setItem('user', JSON.stringify({
          id: data.data.id,
          email: data.data.email,
          firstName: data.data.firstName,
          lastName: data.data.lastName,
          roles: data.data.roles
        }));
        
        setMessage('Connexion réussie ! Redirection...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        throw new Error(data.message || 'Erreur lors de la connexion');
      }
    } catch (error) {
      console.error('Erreur connexion:', error);
      setMessage(error.message || 'Erreur de connexion au serveur');
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

      {/* Information sur l'API */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(67, 97, 238, 0.1)', borderRadius: 'var(--border-radius)', fontSize: '0.9rem' }}>
        <p style={{ margin: 0, color: 'var(--primary-color)' }}>
          <strong>API Backend :</strong><br />
          URL: http://localhost:8080<br />
          Endpoint: /api/auth/login
        </p>
      </div>
    </div>
  );
}

export default LoginPage;