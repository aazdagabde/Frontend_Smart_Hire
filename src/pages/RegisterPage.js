import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    
    // Validation côté client
    if (formData.password !== formData.confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setMessage('Le prénom et le nom sont obligatoires');
      return;
    }

    if (!formData.email.trim()) {
      setMessage('L\'email est obligatoire');
      return;
    }

    setLoading(true);

    try {
      // Appel réel à l'API Spring Boot
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('Inscription réussie ! Redirection vers la page de connexion...');
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }
      
    } catch (error) {
      console.error('Erreur inscription:', error);
      setMessage(error.message || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <h2 className="form-title">Inscription</h2>
      
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="firstName" className="form-label">Prénom</label>
          <input
            type="text"
            id="firstName"
            className="form-input"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Entrez votre prénom"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName" className="form-label">Nom</label>
          <input
            type="text"
            id="lastName"
            className="form-input"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Entrez votre nom"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
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
            value={formData.password}
            onChange={handleChange}
            placeholder="Créez un mot de passe (min. 6 caractères)"
            required
            minLength="6"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe</label>
          <input
            type="password"
            id="confirmPassword"
            className="form-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirmez votre mot de passe"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading && <span className="loading"></span>}
          {loading ? 'Inscription...' : "S'inscrire"}
        </button>
      </form>

      {message && (
        <div className={`message ${message.includes('réussie') ? 'message-success' : 'message-error'}`}>
          {message}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p>Déjà un compte ? <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Se connecter</Link></p>
      </div>

      {/* Information sur l'API */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(67, 97, 238, 0.1)', borderRadius: 'var(--border-radius)', fontSize: '0.9rem' }}>
        <p style={{ margin: 0, color: 'var(--primary-color)' }}>
          <strong>API Backend :</strong><br />
          URL: http://localhost:8080<br />
          Endpoint: /api/auth/register
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;