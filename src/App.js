// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './styles/App.css';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import OfferListPage from './pages/OfferListPage';     // <-- Ajout
import OfferDetailPage from './pages/OfferDetailPage';   // <-- Ajout
import OfferManagePage from './pages/OfferManagePage'; // <-- Ajout
import OfferCreateEditPage from './pages/OfferCreateEditPage'; // <-- Ajout
// Importer ProfilePage, ApplicationStatusPage etc. quand créées

// Composants structurels
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

const UnauthorizedPage = () => (
    <div>
        <h2>Accès non autorisé</h2>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
    </div>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>

        {/* Routes Publiques */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="offers" element={<OfferListPage />} />       {/* <-- Ajout liste publique */}
        <Route path="offers/:id" element={<OfferDetailPage />} /> {/* <-- Ajout détail public */}

        {/* Routes Protégées (nécessitent connexion) */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
          {/* <Route path="profile" element={<ProfilePage />} /> */}
          {/* <Route path="applications/status" element={<ApplicationStatusPage />} /> */} {/* Pour candidats */}
          {/* <Route path="/apply/:offerId" element={<ApplyPage />} /> */} {/* Page pour postuler (Sprint 2) */}

          {/* Routes Protégées pour RH/Admin */}
          {/* Note: Pour une protection basée sur les rôles plus fine,
               il faudrait passer `allowedRoles` à ProtectedRoute,
               ou créer un composant spécifique comme `AdminRoute` */}
          <Route path="offers/manage" element={<OfferManagePage />} />      {/* <-- Ajout gestion RH */}
          <Route path="offers/create" element={<OfferCreateEditPage />} />    {/* <-- Ajout création RH */}
          <Route path="offers/edit/:id" element={<OfferCreateEditPage />} />  {/* <-- Ajout édition RH */}
          {/* <Route path="offers/:id/applications" element={<OfferApplicationsPage />} /> */} {/* Voir candidats (Sprint 2) */}
          {/* <Route path="candidates/analysis" element={<CandidateAnalysisPage />} /> */}
        </Route> {/* Fin des routes protégées */}

        {/* Route fourre-tout pour les pages non trouvées */}
        <Route path="*" element={
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>404 - Page Non Trouvée</h2>
            <p>La page que vous cherchez n'existe pas.</p>
          </div>
        } />

      </Route> {/* Fin du Layout */}
    </Routes>
  );
}

export default App;