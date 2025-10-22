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
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      // Simulation d'une requête d'inscription
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simuler un succès d'inscription
      setMessage('Inscription réussie ! Redirection vers la page de connexion...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      setMessage("Une erreur s'est produite lors de l'inscription");
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
    </div>
  );
}

export default RegisterPage;