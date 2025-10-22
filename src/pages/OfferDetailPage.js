// src/pages/OfferDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import OfferService from '../services/OfferService';
import { useAuth } from '../contexts/AuthContext'; // Pour savoir si on peut postuler

function OfferDetailPage() {
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams(); // Récupère l'ID de l'offre depuis l'URL
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOffer = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await OfferService.getOfferById(id);
        setOffer(data);
      } catch (err) {
        setError(err.message || "Erreur lors du chargement de l'offre.");
        if (err.message.includes('404') || err.message.toLowerCase().includes('not found')) {
            setError("Offre non trouvée.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [id]); // Recharger si l'ID change

  const handleApplyClick = () => {
      // Rediriger vers une page de candidature dédiée ou ouvrir une modale
      // Pour l'instant, on redirige (Sprint 2 implémentera le formulaire)
      navigate(`/apply/${id}`); // Créez cette route/page dans le Sprint 2
  };


  if (loading) return <div style={{ textAlign: 'center' }}><span className="loading"></span> Chargement de l'offre...</div>;
  if (error) return <div className="message message-error">{error}</div>;
  if (!offer) return <div className="message message-error">Offre non trouvée.</div>;

  const isCandidate = currentUser?.roles?.includes('ROLE_CANDIDAT');

  return (
    <div className="form-card" style={{ maxWidth: '800px', margin: 'auto' }}>
      <h2 className="form-title" style={{ marginBottom: '1rem' }}>{offer.title}</h2>
      <p style={{ color: 'var(--gray-color)', textAlign: 'center', marginBottom: '1rem' }}>
        Publié par {offer.creatorName || 'Inconnu'} le {new Date(offer.createdAt).toLocaleDateString()}
      </p>

      <div style={{ marginBottom: '1.5rem' }}>
        <strong>Lieu :</strong> {offer.location || 'Non spécifié'}<br />
        <strong>Type de contrat :</strong> {offer.contractType || 'Non spécifié'}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <strong>Description :</strong>
        <p style={{ whiteSpace: 'pre-wrap' }}>{offer.description}</p> {/* pre-wrap pour conserver les retours à la ligne */}
      </div>

      {offer.requiredSkills && (
        <div style={{ marginBottom: '1.5rem' }}>
          <strong>Compétences requises :</strong>
          <p>{offer.requiredSkills}</p>
        </div>
      )}

       {/* Bouton Postuler - Visible seulement pour les candidats connectés */}
       {currentUser && isCandidate && (
          <button onClick={handleApplyClick} className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Postuler à cette offre
          </button>
       )}
        {/* Message si pas candidat ou pas connecté */}
       {!currentUser && (
           <p style={{marginTop: '1rem', textAlign: 'center'}}>
               <Link to="/login" style={{ color: 'var(--primary-color)' }}>Connectez-vous</Link> ou <Link to="/register" style={{ color: 'var(--primary-color)' }}>inscrivez-vous</Link> pour postuler.
            </p>
       )}
        {currentUser && !isCandidate && (
            <p style={{marginTop: '1rem', textAlign: 'center', color: 'var(--gray-color)'}}>
                (Seuls les candidats peuvent postuler)
            </p>
       )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link to="/offers" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
          &larr; Retour à la liste des offres
        </Link>
      </div>
    </div>
  );
}

export default OfferDetailPage;