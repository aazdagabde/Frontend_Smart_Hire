
import React, { useState, useEffect } from 'react';
import ApplicationService from '../services/ApplicationService';
import '../styles/App.css'; // Import main styles

// Icône X pour fermer (peut être partagée ou définie ici)

/**
 * Modal pour éditer les notes internes d'une candidature.
 * @param {Object} props
 * @param {Object} props.application - L'objet candidature complet
 * @param {Function} props.onClose - Fonction pour fermer le modal
 * @param {Function} props.onSuccess - Fonction appelée après succès (avec l'application mise à jour)
 */
function InternalNotesModal({ application, onClose, onSuccess }) {
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); // State for success message

    // Initialiser les notes quand le modal s'ouvre ou l'application change
    useEffect(() => {
        setNotes(application?.internalNotes || '');
        setError(''); // Reset error on open
        setSuccessMessage(''); // Reset success message on open
    }, [application]);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccessMessage(''); // Clear previous success message

        try {
            // Assurez-vous que ApplicationService.updateInternalNotes existe !
            const response = await ApplicationService.updateInternalNotes(application.id, notes);
            if (response.success && response.data) {
                setSuccessMessage("Notes enregistrées !"); // Set success message
                // Appeler onSuccess après un délai pour laisser le temps de voir le message
                setTimeout(() => {
                    onSuccess(response.data); // Renvoie l'application mise à jour
                    // onClose(); // onSuccess devrait maintenant fermer le modal dans OfferApplicantsPage
                }, 1000); // 1 seconde delay
            } else {
                setError(response.message || "Erreur lors de la sauvegarde.");
            }
        } catch (err) {
            console.error("Erreur sauvegarde notes:", err); // Log l'erreur complète
            setError(err.message || "Une erreur inconnue est survenue.");
        } finally {
            // Ne pas remettre isSaving à false immédiatement si succès pour voir le message
             if (!successMessage) {
                setIsSaving(false);
             }
        }
    };

    // Gérer la touche "Echap" pour fermer
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    return (
        // Utilisation des classes CSS globales pour l'overlay et le contenu
        <div className="modalOverlayStyle" onClick={onClose}>
            {/* Ajout de la classe spécifique pour potentiellement ajuster max-width via CSS */}
            <div className="modalContentStyle internal-notes-modal-content" onClick={(e) => e.stopPropagation()} >
                {/* Utilisation de la classe CSS globale pour le bouton fermer */}
                <button onClick={onClose} className="closeButtonStyle" aria-label="Fermer">
                   &times; {/* Utilisation de &times; pour un X standard */}
                </button>

                 {/* Titre utilisant form-title */}
                 <h3 className="form-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'left' }}>
                     Notes Internes
                 </h3>

                 {/* Nom du candidat */}
                 <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    Pour : <strong>{application?.applicantName || 'Candidat inconnu'}</strong>
                 </p>

                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label htmlFor="internalNotes" className="form-label">
                            Vos notes
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '10px', fontStyle: 'italic' }}>(privées)</span>
                        </label>
                        <textarea
                            id="internalNotes"
                            className="form-input"
                            rows="10" // Augmenté le nombre de lignes
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Écrivez vos observations, impressions, ou les prochaines étapes..."
                            disabled={isSaving}
                            style={{ minHeight: '200px' }} // Hauteur minimale augmentée
                        />
                    </div>

                    {/* Affichage des messages d'erreur ou de succès */}
                    {error && (
                        <div className="message message-error">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="message message-success">
                            {successMessage}
                        </div>
                    )}

                    {/* Actions modales alignées à droite */}
                    <div className="form-actions" style={{ marginTop: '1.5rem', borderTop: 'none', padding: 0 }}>
                        <button
                            type="button"
                            className="btn btn-secondary btn-auto" // Utilisation de btn-secondary
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary btn-auto"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <div className="spinner-small" style={{ borderTopColor: 'var(--background-color)'}}></div> {/* Spinner adapté au fond du bouton */}
                                    <span>Enregistrement...</span>
                                </>
                            ) : (
                                'Enregistrer les notes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default InternalNotesModal;