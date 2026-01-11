import React, { useState, useEffect } from "react";
import DashboardService from "../services/DashboardService";
import { useAuth } from "../contexts/AuthContext";
import "./DashboardPage.css"; 

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeOffers: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier si l'utilisateur est un candidat
  const isCandidate = currentUser?.roles?.some(r => r === "ROLE_CANDIDAT");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await DashboardService.getDashboardStats();
        setStats(data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur dashboard:", err);
        setError("Impossible de charger les données.");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="loading-container">Chargement des statistiques...</div>;
  if (error) return <div className="error-container">{error}</div>;

  return (
      <div className="dashboard-container">
        
        <div className="dashboard-header">
          <h1>
            {isCandidate ? "Mon Espace Candidat" : "Tableau de Bord RH"} 
          </h1>
          <p>
            {isCandidate 
              ? "Suivez l'avancement de vos recherches d'emploi." 
              : "Vue d'ensemble de l'activité de recrutement."}
          </p>
        </div>

        <div className="stats-grid">
          
          {/* Carte 1 : Utilisateurs (RH) vs Entretiens (Candidat) */}
          <div className="stat-card users">
            <div className="stat-icon">{isCandidate ? "🤝" : "👥"}</div>
            <div className="stat-info">
              <h3>{stats.totalUsers}</h3> {/* Le backend envoie le nombre d'entretiens ici pour le candidat */}
              <p>{isCandidate ? "Entretiens acceptés" : "Utilisateurs Inscrits"}</p>
            </div>
          </div>

          {/* Carte 2 : Offres (Pour tous) */}
          <div className="stat-card offers">
            <div className="stat-icon">💼</div>
            <div className="stat-info">
              <h3>{stats.activeOffers}</h3>
              <p>Offres disponibles</p>
            </div>
          </div>

          {/* Carte 3 : Candidatures (Globales ou Mes candidatures) */}
          <div className="stat-card apps">
            <div className="stat-icon">📄</div>
            <div className="stat-info">
              <h3>{stats.totalApplications}</h3>
              <p>{isCandidate ? "Mes Candidatures" : "Total Candidatures"}</p>
            </div>
          </div>

          {/* Carte 4 : En attente (Globales ou Mes attentes) */}
          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.pendingApplications}</h3>
              <p>En Attente</p>
            </div>
          </div>

        </div>
      </div>
  );
};

export default DashboardPage;