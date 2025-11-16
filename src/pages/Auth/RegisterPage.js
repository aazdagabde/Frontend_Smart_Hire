// src/pages/Auth/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService'; // Service pour l'API d'inscription
import { useAuth } from '../../contexts/AuthContext'; // <-- AJOUT

function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ROLE_CANDIDAT' // Par défaut 'CANDIDAT'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth(); // <-- AJOUT

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      // Étape 1: Inscription
      const response = await AuthService.register(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password,
        formData.role
      );

      setMessage(response.message || 'Inscription réussie !');

      // --- MODIFICATIONS ---
      
      // Étape 2: Connexion automatique après inscription
      await login(formData.email, formData.password, true); // true = rememberMe

      // Étape 3: Définir l'indicateur pour le modal de profil
      sessionStorage.setItem('isFirstLogin', 'true');

      // Étape 4: Rediriger vers le tableau de bord
      navigate('/dashboard'); 
      
      // --- FIN DES MODIFICATIONS ---

    } catch (err) {
      console.error("Erreur d'inscription:", err);
      setError(err.message || 'Une erreur est survenue lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <h2 className="form-title">Inscription</h2>

      <form onSubmit={handleRegister}>
        
        {/* Type de compte (Candidat / RH) */}
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ marginBottom: '0.5rem' }}>Je suis un :</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="radio"
                name="role"
                value="ROLE_CANDIDAT"
                checked={formData.role === 'ROLE_CANDIDAT'}
                onChange={handleChange}
              />
              Candidat
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="radio"
                name="role"
                value="ROLE_RH"
                checked={formData.role === 'ROLE_RH'}
                onChange={handleChange}
              />
              Recruteur
            </label>
          </div>
        </div>

        {/* Prénom */}
        <div className="form-group">
          <label htmlFor="firstName" className="form-label">Prénom</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            className="form-input"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Entrez votre prénom"
            required
          />
        </div>

        {/* Nom */}
        <div className="form-group">
          <label htmlFor="lastName" className="form-label">Nom</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            className="form-input"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Entrez votre nom"
            required
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            placeholder="Entrez votre email"
            required
            autoComplete="email"
          />
        </div>

        {/* Mot de passe */}
        <div className="form-group">
          <label htmlFor="password" className="form-label">Mot de passe</label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            placeholder="Créez un mot de passe"
            required
            autoComplete="new-password"
          />
        </div>

        {/* Confirmer Mot de passe */}
        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="form-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirmez votre mot de passe"
            required
            autoComplete="new-password"
          />
        </div>

        {/* Affichage des messages */}
        {error && <div className="message message-error">{error}</div>}
        {message && <div className="message message-success">{message}</div>}

        {/* Bouton de soumission */}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading && <span className="loading" style={{ marginRight: '0.5rem' }}></span>}
          {loading ? 'Inscription...' : 'S\'inscrire'}
        </button>
      </form>

      {/* Lien vers la page de connexion */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p>Déjà un compte ? <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Se connecter</Link></p>
      </div>
    </div>
  );
}

export default RegisterPage;