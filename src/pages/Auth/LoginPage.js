// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Utiliser le contexte d'authentification

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); // Pour les messages d'erreur ou de succès
  const navigate = useNavigate();
  const location = useLocation(); // Pour récupérer l'URL précédente si redirigé ici
  const { login } = useAuth(); // Récupérer la fonction login depuis le contexte

  // Déterminer la destination après une connexion réussie
  // Si l'utilisateur a été redirigé vers login, 'location.state.from' contiendra l'URL d'origine
  const from = location.state?.from?.pathname || "/dashboard"; // Par défaut: /dashboard

  const handleLogin = async (e) => {
    e.preventDefault(); // Empêcher le rechargement de la page
    setMessage(''); // Réinitialiser les messages
    setLoading(true); // Activer l'indicateur de chargement

    try {
      await login(email, password); // Appel de la fonction login du AuthContext
      // Pas besoin de définir un message de succès ici, la redirection suffit
      // setMessage('Connexion réussie ! Redirection...'); // Optionnel
      navigate(from, { replace: true }); // Rediriger vers la page d'origine ou le dashboard
    } catch (error) {
      // Afficher le message d'erreur renvoyé par AuthService/AuthContext
      console.error("Erreur de connexion:", error);
      setMessage(error.message || 'Une erreur est survenue lors de la connexion.');
    } finally {
      setLoading(false); // Désactiver l'indicateur de chargement
    }
  };

  return (
    // Utiliser la classe CSS définie dans App.css
    <div className="form-card">
      <h2 className="form-title">Connexion</h2>

      <form onSubmit={handleLogin}>
        {/* Champ Email */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Entrez votre email"
            required // Champ obligatoire
            autoComplete="email" // Aide le navigateur à pré-remplir
          />
        </div>

        {/* Champ Mot de passe */}
        <div className="form-group">
          <label htmlFor="password" className="form-label">Mot de passe</label>
          <input
            type="password"
            id="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Entrez votre mot de passe"
            required // Champ obligatoire
            autoComplete="current-password" // Aide le navigateur
          />
        </div>

        {/* Affichage des messages d'erreur/succès */}
        {message && (
          <div className={`message ${message.includes('réussie') ? 'message-success' : 'message-error'}`}>
            {message}
          </div>
        )}

        {/* Bouton de soumission */}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {/* Afficher un spinner pendant le chargement */}
          {loading && <span className="loading" style={{ marginRight: '0.5rem' }}></span>}
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      {/* Lien vers la page d'inscription */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p>Pas encore de compte ? <Link to="/register" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>S'inscrire</Link></p>
      </div>

      {/* Suppression du compte de test */}
      {/* <div style={{ marginTop: '2rem', ... }}>...</div> */}
    </div>
  );
}

export default LoginPage;