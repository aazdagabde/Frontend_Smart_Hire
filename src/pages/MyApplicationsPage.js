// src/pages/MyApplicationsPage.js
import React, { useState, useEffect } from 'react';
import ApplicationService from '../services/ApplicationService';
import { Link } from 'react-router-dom';

function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        // Appelle la nouvelle fonction du service
        const apiResponse = await ApplicationService.getMyApplications();
        if (apiResponse.success && Array.isArray(apiResponse.data)) {
          setApplications(apiResponse.data);
        } else {
          setError(apiResponse.message || "Impossible de charger les candidatures.");
          setApplications([]);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'Une erreur est survenue lors de la récupération de vos candidatures.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []); // Se déclenche une seule fois au montage

  // Helper pour obtenir le style du statut
  const getStatusStyle = (status) => {
    const baseStyle = {
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '0.9rem',
      fontWeight: '500',
      textTransform: 'capitalize'
    };
    switch (status) {
      case 'PENDING':
        return { ...baseStyle, backgroundColor: '#f0f0f0', color: '#555' }; // Gris
      case 'REVIEWED':
        return { ...baseStyle, backgroundColor: '#e0f7fa', color: '#007bff' }; // Bleu clair
      case 'ACCEPTED':
        return { ...baseStyle, backgroundColor: '#e8f5e9', color: '#28a745' }; // Vert
      case 'REJECTED':
        return { ...baseStyle, backgroundColor: '#ffebee', color: '#dc3545' }; // Rouge
      default:
        return baseStyle;
    }
  };
  
  // Helper pour traduire le statut
  const translateStatus = (status) => {
     switch (status) {
      case 'PENDING': return 'En attente';
      case 'REVIEWED': return 'Examinée';
      case 'ACCEPTED': return 'Acceptée';
      case 'REJECTED': return 'Rejetée';
      default: return status;
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      <h2 className="form-title">Mes Candidatures</h2>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary-color)' }}>
          <span className="loading"></span> Chargement de vos candidatures...
        </div>
      )}
      {error && <div className="message message-error">{error}</div>}

      {!loading && !error && (
        <>
          {applications.length === 0 ? (
            <div className="message message-info" style={{ textAlign: 'center' }}>
              Vous n'avez postulé à aucune offre pour le moment.
              <br/>
              <Link to="/offers" className="btn btn-primary" style={{marginTop: '1rem', width: 'auto'}}>Voir les offres</Link>
            </div>
          ) : (
            <div className="applications-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* En-tête du tableau (visible sur grands écrans) */}
              <div className="form-card" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', backgroundColor: '#f9f9f9', fontWeight: '600' }}>
                 <div style={{flex: 3}}>Offre</div>
                 <div style={{flex: 2}}>Date de candidature</div>
                 <div style={{flex: 1, textAlign: 'right'}}>Statut</div>
              </div>

              {/* Liste des candidatures */}
              {applications.map(app => (
                <div key={app.id} className="form-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  
                  <div style={{flex: 3, display: 'flex', flexDirection: 'column'}}>
                    <h3 style={{ marginBottom: '0.25rem', fontSize: '1.2rem' }}>
                      <Link to={`/offers/${app.jobOfferId}`} style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '600' }}>
                        {app.jobOfferTitle}
                      </Link>
                    </h3>
                     <p style={{ color: 'var(--gray-color)', fontSize: '0.9rem' }}>
                      CV soumis: {app.cvFileName}
                    </p>
                  </div>

                  <div style={{flex: 2}}>
                    <p style={{ color: '#333', fontSize: '0.95rem' }}>
                      {new Date(app.appliedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  <div style={{flex: 1, textAlign: 'right'}}>
                    <span style={getStatusStyle(app.status)}>
                      {translateStatus(app.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MyApplicationsPage;