// src/App.js
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './styles/App.css';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import OfferListPage from './pages/OfferListPage';
import OfferDetailPage from './pages/OfferDetailPage';
import OfferManagePage from './pages/OfferManagePage';
import OfferCreateEditPage from './pages/OfferCreateEditPage';

// Composants structurels
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// (Garder vos composants UnauthorizedPage et NotFoundPage tels quels)
const UnauthorizedPage = () => (
    <div className="form-card" style={{ textAlign: 'center' }}>
        <h2 className='form-title' style={{ color: 'var(--danger-color)'}}>Accès Interdit</h2>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem', width: 'auto' }}>Retour à l'accueil</Link>
    </div>
);

const NotFoundPage = () => (
     <div className="form-card" style={{ textAlign: 'center' }}>
        <h2 className='form-title'>404 - Page Non Trouvée</h2>
        <p>Désolé, la page que vous cherchez n'existe pas.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem', width: 'auto' }}>Retour à l'accueil</Link>
    </div>
);

function App() {
  const RECRUITER_ROLE = 'ROLE_RH'; // Define role constant for clarity

  return (
    <Routes>
      <Route path="/" element={<Layout />}>

        {/* --- Routes Publiques --- */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="offers" element={<OfferListPage />} />
        <Route path="offers/:id" element={<OfferDetailPage />} />

        {/* --- Routes Protégées (Connexion requise) --- */}
        {/* Wrapper général pour toute route nécessitant une connexion */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
          {/* Ajoutez d'autres routes générales protégées ici (ex: profil) */}
          {/* <Route path="profile" element={<ProfilePage />} /> */}
        </Route>

        {/* --- Routes Protégées (Rôle RH requis) --- */}
        {/* Wrapper spécifique pour les routes nécessitant ROLE_RH */}
        <Route element={<ProtectedRoute requiredRole={RECRUITER_ROLE} />}>
          <Route path="offers/manage" element={<OfferManagePage />} />
          <Route path="offers/create" element={<OfferCreateEditPage />} />
          <Route path="offers/edit/:id" element={<OfferCreateEditPage />} />
          {/* Ajoutez d'autres routes RH ici (ex: voir candidats) */}
           {/* <Route path="offers/:id/applications" element={<OfferApplicationsPage />} /> */}
        </Route>

        {/* --- Route 404 --- */}
        <Route path="*" element={<NotFoundPage />} />

      </Route>
    </Routes>
  );
}

export default App;