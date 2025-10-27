// Fichier : src/components/InternalNotesModal.js

import React, { useState } from 'react';
import ApplicationService from '../services/ApplicationService';

// Icône X pour fermer
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

/**
 * Modal pour éditer les notes internes d'une candidature.
 * @param {Object} props
 * @param {Object} props.application - L'objet candidature complet (contient id, internalNotes, applicantName)
 * @param {Function} props.onClose - Fonction pour fermer le modal
 * @param {Function} props.onSuccess - Fonction appelée après un succès (avec l'application mise à jour)
 */
function InternalNotesModal({ application, onClose, onSuccess }) {
    const [notes, setNotes] = useState(application.internalNotes || '');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        try {
            const response = await ApplicationService.updateInternalNotes(application.id, notes);
            if (response.success && response.data) {
                onSuccess(response.data); // Renvoie l'application mise à jour
            } else {
                setError(response.message || "Erreur lors de la sauvegarde.");
            }
        } catch (err) {
            setError(err.message || "Une erreur inconnue est survenue.");
        } finally {
            setIsSaving(false);
        }
    };

    // Gérer la touche "Echap" pour fermer
    React.useEffect(() => {
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
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">Notes internes</h2>
                    <button onClick={onClose} className="btn-icon modal-close-btn" aria-label="Fermer">
                        <CloseIcon />
                    </button>
                </div>
                
                <p style={{ color: 'var(--text-secondary)', marginTop: '-10px', marginBottom: '15px' }}>
                    Pour : <strong>{application.applicantName || 'Candidat inconnu'}</strong>
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                    Ces notes sont privées et ne seront jamais visibles par le candidat.
                </p>

                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label htmlFor="internalNotes" className="form-label">
                            Vos notes
                        </label>
                        <textarea
                            id="internalNotes"
                            className="form-input"
                            rows="8"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Écrivez vos observations, impressions, ou les prochaines étapes..."
                        />
                    </div>

                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

                    <div className="modal-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <div className="spinner-small-white"></div>
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