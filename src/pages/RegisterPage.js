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
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false); // Pour colorer le message
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
      // 1. Appeler AuthService.register
      const apiResponse = await AuthService.register(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password
      );

      // 2. --- CORRECTION ICI ---
      // Mettre à jour l'état 'message' avec la PROPRIÉTÉ .message (string)
      setMessage(apiResponse.message || "Inscription réussie !");
      setIsSuccess(true); // Indiquer que c'est un succès
      
      // Vider le formulaire
      setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });

      // Redirection après succès
      setTimeout(() => {
        navigate('/login');
      }, 2500);

    } catch (err) {
      // 3. --- CORRECTION ICI ---
      // En cas d'erreur, mettre à jour l'état 'message' avec la PROPRIÉTÉ .message de l'erreur
      setMessage(err.message || "Une erreur est survenue.");
      setIsSuccess(false); // Indiquer que c'est une erreur
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

         {/* Affichage des messages (utilise isSuccess pour la couleur) */}
        {message && (
            <div className={`message ${isSuccess ? 'message-success' : 'message-error'}`}>
            {message}
            </div>
        )}

        {/* Bouton de soumission */}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading && <span className="loading" style={{ marginRight: '0.5rem' }}></span>}
          {loading ? 'Inscription...' : "S'inscrire"}
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