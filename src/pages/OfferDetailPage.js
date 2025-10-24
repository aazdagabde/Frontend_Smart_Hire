// src/pages/OfferDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import OfferService from '../services/OfferService';
import { useAuth } from '../contexts/AuthContext';

function OfferDetailPage() {
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOffer = async () => {
      setLoading(true);
      setError('');
      try {
        const apiResponse = await OfferService.getOfferById(id); // Appelle GET /api/offers/{id}
        if (apiResponse && apiResponse.data) {
          // Vérification supplémentaire : le backend retourne 404 si l'offre n'est pas PUBLISHED
          // Donc si on a une réponse ici, elle devrait être bonne.
          setOffer(apiResponse.data);
        } else {
          console.warn("Offer data not found in API response:", apiResponse);
          setOffer(null);
          // Le backend devrait déjà renvoyer 404 si l'offre est DRAFT ou non trouvée
          // Mais on garde un message générique au cas où
          setError("Offre non trouvée ou inaccessible.");
        }
      } catch (err) {
        console.error("Error fetching offer details:", err); // Log l'erreur
        setError(err.message || "Erreur lors du chargement de l'offre.");
        setOffer(null); // Important de reset en cas d'erreur
        // Gérer spécifiquement 404 ou 403 si le backend les renvoie
        if (err.message.includes('404') || err.message.toLowerCase().includes('not found')) {
            setError("Offre non trouvée.");
        } else if (err.message.includes('403')) {
            setError("Accès interdit à cette offre.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) { // Ne fetch que si l'ID est présent
        fetchOffer();
    } else {
        setError("ID de l'offre manquant.");
        setLoading(false);
    }
  }, [id]);

  const handleApplyClick = () => {
      // Pour l'instant, navigue vers une page non existante (sera implémenté au Sprint 2)
      navigate(`/apply/${id}`);
      // Alternative: Afficher une alerte
      // alert("La fonctionnalité de candidature sera ajoutée au Sprint 2 !");
  };


  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}><span className="loading"></span> Chargement de l'offre...</div>;

  // Afficher l'erreur de manière proéminente s'il y en a une
  if (error) return <div className="message message-error" style={{ maxWidth: '800px', margin: 'auto' }}>{error}</div>;

  // Si pas d'erreur mais offre est null (ne devrait pas arriver sauf si ID manquant initialement)
  if (!offer) return <div className="message message-error" style={{ maxWidth: '800px', margin: 'auto' }}>Offre introuvable.</div>;

  const isCandidate = currentUser?.roles?.includes('ROLE_CANDIDAT');
  // Formatage de la date (optionnel mais plus propre)
  const creationDate = offer.createdAt ? new Date(offer.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date inconnue';

  return (
    <div className="form-card" style={{ maxWidth: '800px', margin: 'auto' }}>
      <h2 className="form-title" style={{ marginBottom: '1rem' }}>{offer.title}</h2>
      <p style={{ color: 'var(--gray-color)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Publié par {offer.createdByFullName || 'Entreprise'} le {creationDate}
      </p>

      {/* Section Infos Clés */}
      <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: 'var(--border-radius)', marginBottom: '1.5rem', border: '1px solid #e9ecef' }}>
        <p><strong>📍 Lieu :</strong> {offer.location || 'Non spécifié'}</p>
        <p style={{ marginTop: '0.5rem' }}><strong>📄 Type de contrat :</strong> {offer.contractType || 'Non spécifié'}</p>
      </div>

      {/* Section Description */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--secondary-color)', fontSize: '1.1rem' }}>Description du poste :</h3>
        {/* white-space: pre-wrap pour conserver les retours à la ligne du backend */}
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{offer.description || 'Pas de description fournie.'}</p>
      </div>

       {/* Bouton Postuler */}
       <div style={{ textAlign: 'center', marginTop: '2rem' }}>
           {currentUser && isCandidate && (
              <button onClick={handleApplyClick} className="btn btn-primary" style={{ width: 'auto' }}>
                  Postuler à cette offre (Sprint 2)
              </button>
           )}
           {!currentUser && (
               <p style={{marginTop: '1rem', color: 'var(--gray-color)'}}>
                   <Link to="/login" style={{ color: 'var(--primary-color)' }}>Connectez-vous</Link> ou <Link to="/register" style={{ color: 'var(--primary-color)' }}>inscrivez-vous</Link> pour postuler.
                </p>
           )}
           {currentUser && !isCandidate && (
                <p style={{marginTop: '1rem', color: 'var(--gray-color)', fontStyle: 'italic'}}>
                    (Seuls les candidats peuvent postuler)
                </p>
           )}
       </div>

      {/* Lien Retour */}
      <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
        <Link to="/offers" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
          &larr; Retour à la liste des offres
        </Link>
      </div>
    </div>
  );
}

export default OfferDetailPage;