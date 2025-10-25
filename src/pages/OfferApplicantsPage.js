// src/pages/OfferApplicantsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ApplicationService from '../services/ApplicationService';
import OfferService from '../services/OfferService'; // Pour récupérer le titre de l'offre

function OfferApplicantsPage() {
  const { offerId } = useParams(); // Récupère l'ID de l'offre depuis l'URL
  const [applicants, setApplicants] = useState([]);
  const [offerTitle, setOfferTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingCvId, setDownloadingCvId] = useState(null); // Pour savoir quel CV est en cours de téléchargement

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Récupérer le titre de l'offre (optionnel mais utile)
        const offerResponse = await OfferService.getOfferById(offerId);
        if (offerResponse.success && offerResponse.data) {
          setOfferTitle(offerResponse.data.title);
        }

        // Récupérer la liste des candidats
        const applicantsResponse = await ApplicationService.getApplicationsForOffer(offerId);
        if (applicantsResponse.success && Array.isArray(applicantsResponse.data)) {
          setApplicants(applicantsResponse.data);
        } else {
          setError(applicantsResponse.message || "Impossible de charger les candidats.");
          setApplicants([]);
        }
      } catch (err) {
        console.error(err);
        // Gérer les erreurs spécifiques si nécessaire (403 Forbidden, 404 Not Found)
        if (err.message.includes('403') || err.message.includes('autorisé')) {
             setError("Vous n'avez pas l'autorisation de voir les candidats pour cette offre.");
        } else if (err.message.includes('404') || err.message.toLowerCase().includes('not found')) {
            setError("L'offre ou les candidatures n'ont pas été trouvées.");
        } else {
            setError(err.message || 'Une erreur est survenue.');
        }
        setApplicants([]); // S'assurer que c'est un tableau vide en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [offerId]); // Se déclenche si offerId change

  // Fonction pour gérer le téléchargement du CV
  const handleDownloadCv = async (applicationId, filename) => {
    setDownloadingCvId(applicationId); // Indiquer qu'on télécharge ce CV
    setError(''); // Reset error
    try {
        await ApplicationService.downloadCv(applicationId);
        // Le service gère le téléchargement, pas besoin de faire plus ici
    } catch (err) {
        console.error("Erreur téléchargement CV:", err);
        setError(`Erreur lors du téléchargement du CV ${filename}: ${err.message}`);
    } finally {
        setDownloadingCvId(null); // Fin du téléchargement
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 className="form-title">Candidats pour "{offerTitle || `Offre #${offerId}`}"</h2>
      <Link to="/offers/manage" style={{ display: 'inline-block', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
        &larr; Retour à la gestion des offres
      </Link>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <span className="loading"></span> Chargement des candidats...
        </div>
      )}
      {error && <div className="message message-error">{error}</div>}

      {!loading && !error && (
        <>
          {applicants.length === 0 ? (
            <div className="message message-info" style={{ textAlign: 'center' }}>
              Aucun candidat n'a postulé à cette offre pour le moment.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}> {/* Pour la responsivité sur petits écrans */}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--primary-color)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem' }}>Nom du Candidat</th>
                    <th style={{ padding: '0.75rem' }}>Date de Candidature</th>
                    <th style={{ padding: '0.75rem' }}>Statut</th>
                    <th style={{ padding: '0.75rem' }}>CV</th>
                    {/* Ajoutez ici la colonne Score IA (Sprint 3) */}
                  </tr>
                </thead>
                <tbody>
                  {applicants.map(app => (
                    <tr key={app.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.75rem' }}>{app.applicantName}</td>
                      <td style={{ padding: '0.75rem' }}>
                        {new Date(app.appliedAt).toLocaleDateString('fr-FR')}
                      </td>
                       <td style={{ padding: '0.75rem' }}>
                        {/* Utiliser les mêmes helpers que MyApplicationsPage */}
                        {app.status} {/* Remplacer par translateStatus si besoin */}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <button
                          className="btn"
                          onClick={() => handleDownloadCv(app.id, app.cvFileName)}
                          disabled={downloadingCvId === app.id} // Désactiver pendant le téléchargement
                          style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', width: 'auto', background: 'var(--gray-color)' }}
                        >
                          {downloadingCvId === app.id ? <span className="loading" style={{width: '12px', height: '12px'}}></span> : 'Télécharger'}
                        </button>
                      </td>
                       {/* Cellule pour Score IA (Sprint 3) */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default OfferApplicantsPage;