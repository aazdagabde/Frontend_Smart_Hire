// src/pages/OfferDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import OfferService from '../services/OfferService';
import ApplicationService from '../services/ApplicationService'; 
import { useAuth } from '../contexts/AuthContext'; // Importer le hook d'authentification

function OfferDetailPage() {
  const { id } = useParams();
  // Correction : Récupérer currentUser au lieu de user et isAuthenticated séparément
  const { currentUser, loading: authLoading } = useAuth(); 
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  useEffect(() => {
    const fetchOffer = async () => {
      // Ne commence le chargement de l'offre que si l'authentification est terminée
      if (authLoading) return; 

      setLoading(true);
      setError(''); // Réinitialiser l'erreur à chaque chargement
      try {
        const apiResponse = await OfferService.getOfferById(id);
        // Utiliser la structure de réponse { success, data, message }
        if (apiResponse.success && apiResponse.data) {
          setOffer(apiResponse.data);
        } else {
          setError(apiResponse.message || "Offre non trouvée ou inaccessible.");
          setOffer(null);
        }
      } catch (err) {
        console.error("Error fetching offer details:", err);
         if (err.message.includes('404') || err.message.toLowerCase().includes('not found')) {
            setError("Offre non trouvée ou non publiée.");
        } else if (err.message.includes('403')) {
            setError("Accès interdit à cette offre.");
        } else {
            setError(err.message || 'Erreur lors du chargement de l\'offre.');
        }
        setOffer(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [id, authLoading]); // Ajouter authLoading aux dépendances

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setApplyError(''); // Effacer l'erreur à chaque changement
    setApplySuccess(''); // Effacer le succès si on change de fichier
    if (file && file.type !== "application/pdf") {
      setApplyError("Le fichier doit être au format PDF.");
      setCvFile(null);
      e.target.value = null; 
    } else if (file && file.size > 5 * 1024 * 1024) { // 5MB
      setApplyError("Le fichier ne doit pas dépasser 5MB.");
      setCvFile(null);
      e.target.value = null; 
    } else {
      setCvFile(file);
    }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!cvFile) {
      setApplyError("Veuillez sélectionner un CV (PDF).");
      return;
    }

    setIsApplying(true);
    setApplyError('');
    setApplySuccess('');

    try {
      const formData = new FormData();
      formData.append('cv', cvFile);

      const apiResponse = await ApplicationService.applyToOffer(id, formData);
      
      // Utiliser la structure { success, message }
      if (apiResponse.success) {
        setApplySuccess(apiResponse.message || "Candidature envoyée avec succès !");
        setCvFile(null); // Optionnel : vider le champ fichier après succès
        if (document.getElementById('cvFile')) { // Vérifier si l'élément existe avant de reset
          document.getElementById('cvFile').value = null;
        }
      } else {
        // L'erreur est gérée dans le bloc catch car handleApiResponse lance une Error
         setApplyError(apiResponse.message || "Une erreur est survenue lors de l'envoi.");
      }
    } catch (err) {
      console.error("Erreur applyToOffer:", err);
      if (err.message.includes("déjà postulé")) {
          setApplyError("Vous avez déjà postulé à cette offre.");
      } else {
          setApplyError(err.message || "Échec de l'envoi de la candidature.");
      }
    } finally {
      setIsApplying(false);
    }
  };

  // Attendre la fin du chargement de l'authentification ET de l'offre
  if (authLoading || loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary-color)' }}>
        <span className="loading"></span> Chargement...
      </div>
    );
  }

  if (error) {
    // Afficher l'erreur de manière plus proéminente
    return <div className="message message-error" style={{ maxWidth: '800px', margin: 'auto' }}>{error}</div>;
  }

  if (!offer) {
     // Ce cas peut arriver si l'ID est invalide ou l'offre non trouvée/publiée
    return <div className="message message-info" style={{ maxWidth: '800px', margin: 'auto' }}>Offre introuvable ou non disponible.</div>;
  }

  // --- CORRECTION DE LA VÉRIFICATION DES RÔLES ---
  // L'objet currentUser contient un tableau `roles`
  const isCandidate = currentUser?.roles?.includes('ROLE_CANDIDAT');
  const isRecruiter = currentUser?.roles?.includes('ROLE_RH'); // Utiliser includes aussi pour RH

  // Formatage de la date (optionnel mais plus propre)
  const creationDate = offer.createdAt ? new Date(offer.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date inconnue';

  return (
    // Utiliser form-card pour le style général
    <div className="form-card" style={{ maxWidth: '800px', margin: 'auto' }}> 
      <h2 className="form-title" style={{ marginBottom: '1rem' }}>{offer.title}</h2>
       <p style={{ color: 'var(--slate)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Publié par {offer.createdByFullName || 'Entreprise'} le {creationDate}
      </p>

      {/* Section Infos Clés */}
      <div style={{ background: 'rgba(10, 25, 47, 0.6)', padding: '1rem', borderRadius: 'var(--border-radius)', marginBottom: '1.5rem', border: '1px solid rgba(100, 255, 218, 0.1)' }}>
        <p><strong>📍 Lieu :</strong> {offer.location || 'Non spécifié'}</p>
        <p style={{ marginTop: '0.5rem' }}><strong>📄 Type de contrat :</strong> {offer.contractType || 'Non spécifié'}</p>
      </div>

      {/* Section Description */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--bright-blue)', fontSize: '1.1rem' }}>Description du poste :</h3>
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{offer.description || 'Pas de description fournie.'}</p>
      </div>

      {/* --- Section Candidature --- */}
      {/* Afficher si l'utilisateur est un candidat ET n'a pas encore postulé avec succès */}
      {isCandidate && !applySuccess && (
        <div className="apply-section" style={{ borderTop: '1px solid rgba(100, 255, 218, 0.1)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--bright-blue)', fontSize: '1.1rem' }}>Postuler à cette offre</h3>
            <form onSubmit={handleSubmitApplication}>
              <div className="form-group">
                <label htmlFor="cvFile" className="form-label" style={{ textTransform: 'none' }}>
                  Votre CV (PDF, 5MB max)
                </label>
                <input
                  type="file"
                  id="cvFile"
                  name="cvFile"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  required
                  className="form-input" // Utiliser la classe existante
                  disabled={isApplying} 
                />
              </div>

              {applyError && <div className="message message-error">{applyError}</div>}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
                disabled={isApplying || !cvFile || !!applyError} // Désactiver aussi si erreur de fichier
              >
                {isApplying && <span className="loading" style={{ marginRight: '0.5rem' }}></span>}
                {isApplying ? 'Envoi...' : "Envoyer ma candidature"}
              </button>
            </form>
        </div>
      )}
      
      {/* Afficher message de succès si la candidature a été envoyée */}
      {applySuccess && (
         <div className="message message-success">{applySuccess}</div>
      )}

      {/* Afficher un message pour les visiteurs non connectés */}
      {!currentUser && (
        <div className="message message-info" style={{ textAlign: 'center', marginTop: '2rem' }}>
           <p style={{marginTop: '1rem', color: 'var(--slate)'}}>
               <Link to="/login" style={{ color: 'var(--bright-blue)' }}>Connectez-vous</Link> ou <Link to="/register" style={{ color: 'var(--bright-blue)' }}>inscrivez-vous</Link> en tant que candidat pour postuler.
            </p>
        </div>
      )}

      {/* Afficher un message pour les RH connectés */}
      {isRecruiter && (
         <div className="message message-info" style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{marginTop: '1rem', color: 'var(--slate)', fontStyle: 'italic'}}>
                (Vous êtes connecté en tant que Recruteur)
            </p>
         </div>
      )}
      {/* --- Fin des messages conditionnels --- */}


      {/* Lien Retour */}
      <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
        <Link to="/offers" style={{ color: 'var(--bright-blue)', textDecoration: 'none' }}>
          &larr; Retour à la liste des offres
        </Link>
      </div>
    </div>
  );
}

export default OfferDetailPage;