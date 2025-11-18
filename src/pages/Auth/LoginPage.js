// src/pages/Auth/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Utiliser le contexte d'authentification

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [doNotRemember, setDoNotRemember] = useState(false); // <-- SUPPRIMÉ
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
      // const rememberMe = !doNotRemember; // <-- SUPPRIMÉ
      await login(email, password); // <-- 'rememberMe' supprimé de l'appel

      // sessionStorage.setItem('isFirstLogin', 'true'); // <-- SUPPRIMÉ (géré par AuthContext)

      navigate(from, { replace: true }); 
    } catch (error) {
      console.error("Erreur de connexion:", error);
      // Afficher l'erreur retournée par l'API si elle existe
      const errorMessage = error.response?.data?.message || error.message || "Email ou mot de passe incorrect.";
      setMessage(errorMessage);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="form-card" style={{ maxWidth: '450px' }}> {/* Style ajouté pour la largeur max */}
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

        {/* --- SECTION "NE PAS ME RAPPELER" SUPPRIMÉE --- */}
        

        {/* Affichage des messages */}
        {message && (
          <div className="message message-error"> {/* Toujours 'message-error' pour le login */}
            {message}
          </div>
        )}

        
        <button typeS="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
          {loading && <span className="loading" style={{ marginRight: '0.5rem' }}></span>}
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      
      <div className="form-footer"> {/* Utilisation de la classe 'form-footer' */}
        <p>Pas encore de compte ? 
          <Link to="/register" className="form-link">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;