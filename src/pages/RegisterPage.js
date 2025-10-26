// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService'; // Importer le service mis à jour

function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '' // <<< NOUVEAU CHAMP
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
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
    setIsSuccess(false);

    // --- Validations (inchangées) ---
    if (formData.password !== formData.confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas.');
      return;
    }
    if (formData.password.length < 6) {
        setMessage('Le mot de passe doit contenir au moins 6 caractères.');
        return;
    }
    // --- Fin Validations ---

    setLoading(true);

    try {
      // <<< MODIFICATION ICI : Passer phoneNumber à AuthService.register >>>
      const apiResponse = await AuthService.register(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password,
        formData.phoneNumber // <<< NOUVEAU PARAMÈTRE
      );

      setMessage(apiResponse.message || "Inscription réussie !");
      setIsSuccess(true);

      // <<< MODIFICATION ICI : Vider aussi phoneNumber >>>
      setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phoneNumber: '' });

      setTimeout(() => {
        navigate('/login');
      }, 2500);

    } catch (err) {
      setMessage(err.message || "Une erreur est survenue.");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <h2 className="form-title">Inscription</h2>

      <form onSubmit={handleRegister}>
        {/* Prénom */}
        <div className="form-group">
          <label htmlFor="firstName" className="form-label">Prénom</label>
          <input type="text" id="firstName" className="form-input" value={formData.firstName} onChange={handleChange} placeholder="Entrez votre prénom" required autoComplete="given-name" />
        </div>
        {/* Nom */}
        <div className="form-group">
          <label htmlFor="lastName" className="form-label">Nom</label>
          <input type="text" id="lastName" className="form-input" value={formData.lastName} onChange={handleChange} placeholder="Entrez votre nom" required autoComplete="family-name"/>
        </div>
        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input type="email" id="email" className="form-input" value={formData.email} onChange={handleChange} placeholder="Entrez votre email" required autoComplete="email"/>
        </div>

        {/* <<< NOUVEAU BLOC : Numéro de téléphone >>> */}
        <div className="form-group">
          <label htmlFor="phoneNumber" className="form-label">Numéro de téléphone (Optionnel)</label>
          <input
            type="tel" // Utiliser type="tel" pour une meilleure sémantique/UX mobile
            id="phoneNumber"
            className="form-input"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Ex: 0612345678"
            autoComplete="tel" // Aide le navigateur à pré-remplir
          />
        </div>
        {/* <<< FIN DU NOUVEAU BLOC >>> */}

        {/* Mot de passe */}
        <div className="form-group">
          <label htmlFor="password" className="form-label">Mot de passe</label>
          <input type="password" id="password" className="form-input" value={formData.password} onChange={handleChange} placeholder="Créez un mot de passe (min. 6 caractères)" required minLength="6" autoComplete="new-password"/>
        </div>
        {/* Confirmation Mot de passe */}
        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe</label>
          <input type="password" id="confirmPassword" className="form-input" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirmez votre mot de passe" required minLength="6" autoComplete="new-password"/>
        </div>

        {message && (
            <div className={`message ${isSuccess ? 'message-success' : 'message-error'}`}>
            {message}
            </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading && <span className="loading" style={{ marginRight: '0.5rem' }}></span>}
          {loading ? 'Inscription...' : "S'inscrire"}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p>Déjà un compte ? <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Se connecter</Link></p>
      </div>
    </div>
  );
}

export default RegisterPage;