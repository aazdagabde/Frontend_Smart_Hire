// src/pages/Auth/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

// Icônes
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const MailIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>);
const LockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const BriefcaseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>);

function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '',phoneNumber: '',password: '', confirmPassword: '', role: 'ROLE_CANDIDAT'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectRole = (role) => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      const response = await AuthService.register(
        formData.firstName, formData.lastName, formData.email,formData.phoneNumber, formData.password, formData.role
      );
      setMessage(response.message || 'Inscription réussie !');
      await login(formData.email, formData.password, true);
      sessionStorage.setItem('isFirstLogin', 'true');
      navigate('/dashboard'); 
    } catch (err) {
      console.error("Erreur d'inscription:", err);
      setError(err.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  const PhoneIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>);

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <h1 className="brand-logo">SmartHire</h1>
          <p className="auth-subtitle">Rejoignez la plateforme intelligente de recrutement.</p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          
          {/* Sélection du Rôle stylisée */}
          <div className="role-selection-group">
            <label className="group-label">Je souhaite m'inscrire en tant que :</label>
            <div className="role-cards">
              <div 
                className={`role-card ${formData.role === 'ROLE_CANDIDAT' ? 'active' : ''}`}
                onClick={() => selectRole('ROLE_CANDIDAT')}
              >
                <div className="role-icon"><UserIcon /></div>
                <span>Candidat</span>
              </div>
              <div 
                className={`role-card ${formData.role === 'ROLE_RH' ? 'active' : ''}`}
                onClick={() => selectRole('ROLE_RH')}
              >
                <div className="role-icon"><BriefcaseIcon /></div>
                <span>Recruteur</span>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="input-group">
              <label>Prénom</label>
              <div className="input-wrapper">
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Jean" />
              </div>
            </div>
            <div className="input-group">
              <label>Nom</label>
              <div className="input-wrapper">
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Dupont" />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>Email</label>
            <div className="input-wrapper">
              <MailIcon />
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="jean.dupont@email.com" />
            </div>
          </div>

           <div className="input-group">
            <label>phoneNumber</label>
            <div className="input-wrapper">
              <PhoneIcon />
              <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required placeholder="07123456789" />
            </div>
          </div>

          <div className="row">
            <div className="input-group">
              <label>Mot de passe</label>
              <div className="input-wrapper">
                <LockIcon />
                <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" />
              </div>
            </div>
            <div className="input-group">
              <label>Confirmation</label>
              <div className="input-wrapper">
                <LockIcon />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="••••••••" />
              </div>
            </div>
          </div>

          {error && <div className="message-box error">{error}</div>}
          {message && <div className="message-box success">{message}</div>}

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Créer mon compte'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Déjà membre ? <Link to="/login" className="link-highlight">Se connecter</Link></p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;