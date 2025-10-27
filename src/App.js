// src/App.js
import React from 'react';
// Correction : Suppression de 'BrowserRouter as Router' de l'import
import { Routes, Route, Link } from 'react-router-dom';
// AuthProvider est déjà dans index.js
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import OfferListPage from './pages/Offer/OfferListPage';
import OfferDetailPage from './pages/Offer/OfferDetailPage';
import OfferManagePage from './pages/Offer/OfferManagePage';
import OfferCreateEditPage from './pages/Offer/OfferCreateEditPage';
import MyApplicationsPage from './pages/Application/MyApplicationsPage'; // Page ajoutée à l'étape 2
import OfferApplicantsPage from './pages/Offer/OfferApplicantsPage'; // Page ajoutée à l'étape 3

// Styles
import './styles/App.css'; // Peut être enlevé si déjà dans index.js ou layout.js

// Composants UnauthorizedPage et NotFoundPage (inchangés)
const UnauthorizedPage = () => (
    <div className="form-card" style={{ textAlign: 'center', maxWidth: '500px', margin: 'auto' }}>
        <h2 className='form-title' style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Accès Interdit</h2>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem', width: 'auto' }}>Retour à l'accueil</Link>
    </div>
);

const NotFoundPage = () => (
     <div className="form-card" style={{ textAlign: 'center', maxWidth: '500px', margin: 'auto' }}>
        <h2 className='form-title'>404 - Page Non Trouvée</h2>
        <p>Désolé, la page que vous cherchez n'existe pas.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem', width: 'auto' }}>Retour à l'accueil</Link>
    </div>
);


function App() {
  // Définir les rôles ici pour clarté
  const RECRUITER_ROLE = 'ROLE_RH';
  const CANDIDATE_ROLE = 'ROLE_CANDIDAT';

  return (
    // Correction : Suppression du <Router> redondant qui enveloppait <Routes>
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* --- Routes Publiques --- */}
        <Route index element={<HomePage />} />
        <Route path="offers" element={<OfferListPage />} />
        <Route path="offers/:id" element={<OfferDetailPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />

        {/* --- Routes Publiques Seulement (pour utilisateurs non connectés) --- */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* --- Routes Protégées (Connexion requise pour tous les rôles) --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
          {/* Ajoutez d'autres routes générales protégées ici (ex: profil) */}
        </Route>

        {/* --- Routes Protégées (Rôle RH requis) --- */}
        {/* Utilise 'requiredRole' pour spécifier le rôle */}
        <Route element={<ProtectedRoute requiredRole={RECRUITER_ROLE} />}>
          <Route path="offers/manage" element={<OfferManagePage />} />
          <Route path="offers/create" element={<OfferCreateEditPage />} />
          <Route path="offers/edit/:id" element={<OfferCreateEditPage />} />
          {/* Route pour voir les candidats d'une offre (Étape 3) */}
          <Route path="offers/:offerId/applicants" element={<OfferApplicantsPage />} />
        </Route>

        {/* --- Routes Protégées (Rôle CANDIDAT requis) --- */}
        <Route element={<ProtectedRoute requiredRole={CANDIDATE_ROLE} />}>
          <Route path="my-applications" element={<MyApplicationsPage />} />
        </Route>

        {/* --- Route 404 --- */}
        <Route path="*" element={<NotFoundPage />} />

      </Route>
    </Routes>
    // Correction : Fin de la suppression du <Router> redondant
  );
}

export default App;
