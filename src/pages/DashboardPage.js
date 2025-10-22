// src/pages/DashboardPage.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { currentUser } = useAuth();

  // Déterminer le type d'utilisateur pour afficher un contenu pertinent
  const isRecruiter = currentUser?.roles?.some(role => role === 'ROLE_RH' || role === 'ROLE_ADMIN');
  const isCandidate = currentUser?.roles?.includes('ROLE_CANDIDAT'); // Ou simplement !isRecruiter si vous n'avez que 2 types

  return (
    <div className="dashboard-card" style={{ width: '100%', maxWidth: '800px' }}> {/* Style ajouté */}
      <h2 className="dashboard-title">Tableau de Bord</h2>
      <p style={{ marginBottom: '1.5rem' }}>Bienvenue, {currentUser?.firstName || currentUser?.email}!</p>

      {isRecruiter && (
        <div>
          <h3>Espace Recruteur</h3>
          <p>Gérez vos offres d'emploi, consultez les candidatures et analysez les profils.</p>
          {/* Ajouter des liens ou des composants spécifiques au RH ici */}
          {/* <Link to="/offers/manage">Gérer mes offres</Link> */}
          {/* <Link to="/candidates/analysis">Analyse des candidats</Link> */}
        </div>
      )}

      {isCandidate && (
        <div>
          <h3>Espace Candidat</h3>
          <p>Consultez les offres recommandées, suivez vos candidatures et mettez à jour votre profil.</p>
          {/* Ajouter des liens ou des composants spécifiques au Candidat ici */}
           {/* <Link to="/offers">Voir les offres</Link> */}
           {/* <Link to="/applications/status">Mes candidatures</Link> */}
           {/* <Link to="/profile">Mon profil</Link> */}
        </div>
      )}

      {/* Si un utilisateur n'a pas de rôle défini (ce ne devrait pas arriver avec votre backend actuel) */}
      {!isRecruiter && !isCandidate && (
          <p>Votre rôle n'est pas défini. Veuillez contacter l'administrateur.</p>
      )}

    </div>
  );
};

export default DashboardPage;