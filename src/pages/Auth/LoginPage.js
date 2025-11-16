// src/pages/Auth/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Utiliser le contexte d'authentification

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // AJOUT : 'rememberMe' est vrai par défaut. 'doNotRemember' est l'inverse.
  const [doNotRemember, setDoNotRemember] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); // Pour les messages d'erreur ou de succès
  const navigate = useNavigate();
  const location = useLocation(); 
  const { login } = useAuth(); 

  // L'état 'from' est récupéré pour la redirection après connexion
  const from = location.state?.from?.pathname || "/dashboard";

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setMessage(''); 
    setLoading(true); 

    try {
      // Calculer 'rememberMe' basé sur l'état 'doNotRemember'
      const rememberMe = !doNotRemember;
      await login(email, password, rememberMe); // <-- Passer la valeur à login()

      // --- AJOUT ---
      // Définit l'indicateur pour ouvrir le modal de profil dans le Layout
      sessionStorage.setItem('isFirstLogin', 'true');
      // --- FIN DE L'AJOUT ---

      navigate(from, { replace: true }); 
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setMessage(error.message || 'Une erreur est survenue lors de la connexion.');
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="form-card">
      <h2 className="form-title">Connexion</h2>

      <form onSubmit={handleLogin}>
        {/* ... (Champ Email inchangé) ... */}
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

        {/* ... (Champ Mot de passe inchangé) ... */}
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

        {/* --- NOUVELLE SECTION "NE PAS ME RAPPELER" --- */}
        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input
            type="checkbox"
            id="doNotRemember"
            checked={doNotRemember}
            onChange={(e) => setDoNotRemember(e.target.checked)}
            style={{ width: 'auto' }}
          />
          <label htmlFor="doNotRemember" className="form-label" style={{ marginBottom: 0, fontWeight: 'normal' }}>
            Ne pas me rappeler
          </label>
        </div>
        {/* --- FIN DE LA NOUVELLE SECTION --- */}


        {/* ... (Affichage des messages inchangé) ... */}
        {message && (
          <div className={`message ${message.includes('réussie') ? 'message-success' : 'message-error'}`}>
            {message}
          </div>
        )}

        {/* ... (Bouton de soumission inchangé) ... */}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading && <span className="loading" style={{ marginRight: '0.5rem' }}></span>}
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      {/* ... (Lien vers la page d'inscription inchangé) ... */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p>Pas encore de compte ? <Link to="/register" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>S'inscrire</Link></p>
      </div>
    </div>
  );
}

export default LoginPage;