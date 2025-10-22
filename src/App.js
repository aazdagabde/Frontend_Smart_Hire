// src/App.js
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
// Importer le CSS global (chemin mis à jour)
import './styles/App.css';

// Importer les pages depuis leur nouveau dossier
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import OfferListPage from './pages/OfferListPage';
import OfferDetailPage from './pages/OfferDetailPage';
import OfferManagePage from './pages/OfferManagePage';
import OfferCreateEditPage from './pages/OfferCreateEditPage';
// Importer d'autres pages ici au besoin...

// Importer les composants structurels
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Un composant simple pour la page Non Autorisé
const UnauthorizedPage = () => (
    <div className="form-card" style={{ textAlign: 'center' }}>
        <h2 className='form-title' style={{ color: 'var(--danger-color)'}}>Accès Interdit</h2>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem', width: 'auto' }}>Retour à l'accueil</Link>
    </div>
);

// Un composant simple pour la page 404
const NotFoundPage = () => (
     <div className="form-card" style={{ textAlign: 'center' }}>
        <h2 className='form-title'>404 - Page Non Trouvée</h2>
        <p>Désolé, la page que vous cherchez n'existe pas.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem', width: 'auto' }}>Retour à l'accueil</Link>
    </div>
);

function App() {
  return (
    <Routes>
      {/* Route de base utilisant le Layout */}
      <Route path="/" element={<Layout />}>

        {/* Routes Publiques accessibles via <Outlet /> dans Layout */}
        <Route index element={<HomePage />} /> {/* La page d'accueil à la racine */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="offers" element={<OfferListPage />} />       {/* Liste publique des offres */}
        <Route path="offers/:id" element={<OfferDetailPage />} /> {/* Détail public d'une offre */}

        {/* Routes Protégées (nécessitent d'être connecté) */}
        <Route element={<ProtectedRoute />}> {/* Wrapper pour les routes nécessitant une connexion */}
          <Route path="dashboard" element={<DashboardPage />} />
          {/* <Route path="profile" element={<ProfilePage />} /> */} {/* Ex: Page profil utilisateur */}
          {/* <Route path="applications/status" element={<ApplicationStatusPage />} /> */} {/* Pour candidats */}
          {/* <Route path="/apply/:offerId" element={<ApplyPage />} /> */} {/* Page pour postuler (Sprint 2) */}

          {/* Routes spécifiques RH/Admin (pourraient nécessiter une vérification de rôle supplémentaire dans ProtectedRoute ou un composant dédié) */}
          <Route path="offers/manage" element={<OfferManagePage />} />      {/* Gestion des offres par RH */}
          <Route path="offers/create" element={<OfferCreateEditPage />} />    {/* Création d'offre par RH */}
          <Route path="offers/edit/:id" element={<OfferCreateEditPage />} />  {/* Édition d'offre par RH */}
          {/* <Route path="offers/:id/applications" element={<OfferApplicationsPage />} /> */} {/* Voir candidats (Sprint 2) */}
          {/* <Route path="candidates/analysis" element={<CandidateAnalysisPage />} /> */}

          {/* Ajoutez d'autres routes protégées ici */}

        </Route> {/* Fin des routes protégées générales */}

        {/* Route pour toutes les autres URL non correspondantes (404) */}
        <Route path="*" element={<NotFoundPage />} />

      </Route> {/* Fin de la route Layout */}
    </Routes>
  );
}

export default App;