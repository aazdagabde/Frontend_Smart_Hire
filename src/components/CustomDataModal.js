// src/components/CustomDataModal.js
import React from 'react';
import '../styles/App.css'; // Pour les styles de base

// Styles (similaires à UpdateCvModal)
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(10, 25, 47, 0.8)',
  backdropFilter: 'blur(5px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1050,
};

const modalContentStyle = {
  background: 'var(--dark-navy)',
  padding: '2.5rem',
  borderRadius: 'var(--border-radius-lg)',
  boxShadow: 'var(--box-shadow-lg)',
  width: '90%',
  maxWidth: '600px',
  position: 'relative',
  border: '1px solid rgba(100, 255, 218, 0.1)',
  maxHeight: '80vh', // Hauteur max
  overflowY: 'auto'  // Scroll si nécessaire
};

const closeButtonStyle = {
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  background: 'transparent',
  border: 'none',
  color: 'var(--slate)',
  fontSize: '1.5rem',
  cursor: 'pointer',
};

function CustomDataModal({ data = [], applicantName, onClose }) {

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
        <button style={closeButtonStyle} onClick={onClose}>&times;</button>
        <h3 className="form-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          Réponses de {applicantName || 'Candidat'}
        </h3>

        {data.length === 0 ? (
            <p style={{ color: 'var(--slate)' }}>Aucune réponse personnalisée pour cette candidature.</p>
        ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {data.map(item => (
                    <div key={item.id} className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ color: 'var(--primary-color)', fontSize: '1rem' }}>
                            {item.label}
                        </label>
                        <p style={{ 
                            color: 'var(--lightest-slate)', 
                            fontSize: '0.9rem', 
                            whiteSpace: 'pre-wrap', // Respecte les sauts de ligne (pour TEXTAREA)
                            background: 'var(--navy-blue)',
                            padding: '0.75rem',
                            borderRadius: 'var(--border-radius)',
                            marginTop: '0.5rem'
                        }}>
                            {item.value || <span style={{color: 'var(--slate)'}}>(Pas de réponse)</span>}
                        </p>
                    </div>
                ))}
            </div>
        )}

        <button
            type="button"
            className="btn"
            onClick={onClose}
            style={{ background: 'var(--slate)', color: 'white', width: 'auto', marginTop: '2rem' }}
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

export default CustomDataModal;