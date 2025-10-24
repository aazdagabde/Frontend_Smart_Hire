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
        // OfferService.getOfferById returns the full { success, data, message } object
        const apiResponse = await OfferService.getOfferById(id);

        // --- MODIFICATION HERE ---
        // Check if apiResponse.data exists before setting the offer state
        if (apiResponse && apiResponse.data) {
          setOffer(apiResponse.data); // Set the offer state with the data property
        } else {
          // Handle case where data is missing in the response
          console.warn("Offer data not found in API response:", apiResponse);
          setOffer(null); // Set offer to null
          setError("Détails de l'offre non trouvés dans la réponse.");
        }
        // --- END MODIFICATION ---

      } catch (err) {
        setError(err.message || "Erreur lors du chargement de l'offre.");
        // Make sure offer state is null on error
        setOffer(null);
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

  // Add a check at the beginning of the return statement just in case
  if (loading) return <div style={{ textAlign: 'center' }}><span className="loading"></span> Chargement de l'offre...</div>;
  if (error) return <div className="message message-error">{error}</div>;
  // Explicitly check if offer is null AFTER loading and error checks
  if (!offer) return <div className="message message-error">Offre non trouvée ou erreur de chargement.</div>;

  // Now you can safely access offer.title, offer.description etc. below
  const isCandidate = currentUser?.roles?.includes('ROLE_CANDIDAT');

  return (
    <div className="form-card" style={{ maxWidth: '800px', margin: 'auto' }}>
      <h2 className="form-title" style={{ marginBottom: '1rem' }}>{offer.title}</h2>
      {/* Ensure creatorName exists, otherwise fallback */}
      <p style={{ color: 'var(--gray-color)', textAlign: 'center', marginBottom: '1rem' }}>
         Publié par {offer.createdByFullName || 'Inconnu'} {/* Use createdByFullName based on JobOfferResponse */}
         {offer.createdAt && ` le ${new Date(offer.createdAt).toLocaleDateString()}`}
      </p>

      <div style={{ marginBottom: '1.5rem' }}>
        <strong>Lieu :</strong> {offer.location || 'Non spécifié'}<br />
        <strong>Type de contrat :</strong> {offer.contractType || 'Non spécifié'}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <strong>Description :</strong>
        {/* Check if description exists before rendering */}
        <p style={{ whiteSpace: 'pre-wrap' }}>{offer.description || 'Pas de description.'}</p>
      </div>

      {/* Remove offer.requiredSkills as it's not in the DTO */}
      {/* {offer.requiredSkills && ( ... )} */}

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