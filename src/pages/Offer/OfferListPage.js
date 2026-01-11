// src/pages/OfferListPage.js
import React, { useState, useEffect } from 'react';
import OfferService from '../../services/OfferService';
import { Link } from 'react-router-dom';
import defaultOfferImage from '../../assets/image_offre.png'; // Image par défaut

// Icônes simples
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;

// Helper pour la deadline
const getDeadlineInfo = (deadlineDate) => {
  if (!deadlineDate) return null;
  const deadline = new Date(deadlineDate);
  const now = new Date();
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: "Expirée", urgent: true };
  if (diffDays <= 3) return { text: `J-${diffDays} !`, urgent: true };
  return { text: deadline.toLocaleDateString('fr-FR'), urgent: false };
};

function OfferListPage() {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    let result = offers;
    if (activeFilter !== 'ALL') {
        result = result.filter(o => o.contractType === activeFilter);
    }
    setFilteredOffers(result);
  }, [activeFilter, offers]);

  const fetchOffers = async (term = '') => {
    setLoading(true);
    try {
      const apiResponse = await OfferService.getAllPublicOffers(term);
      if (apiResponse?.data && Array.isArray(apiResponse.data)) {
        setOffers(apiResponse.data);
        setFilteredOffers(apiResponse.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOffers(searchTerm);
  };

  return (
    <div className="page-container">
      <div style={{maxWidth: '800px', margin: '0 auto 3rem auto', textAlign:'center'}}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--secondary-color)', marginBottom: '1rem'}}>
          Trouvez votre futur <span style={{color: 'var(--primary-color)'}}>Job</span>
        </h1>
        <p style={{color: 'var(--text-muted)', fontSize: '1.1rem'}}>
          Découvrez les meilleures opportunités sélectionnées par SmartHire.
        </p>
      </div>

      <div className="search-container-modern">
        <SearchIcon />
        <form onSubmit={handleSearchSubmit} style={{flex: 1, display: 'flex'}}>
            <input
            type="text"
            className="search-input-modern"
            placeholder="Rechercher un poste, une compétence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
        </form>
        <button onClick={handleSearchSubmit} className="btn-search-modern">
            Rechercher
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {['ALL', 'CDI', 'CDD', 'STAGE', 'FREELANCE'].map(type => (
            <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`badge ${activeFilter === type ? 'badge-contract' : 'badge-location'}`}
                style={{ border: 'none', cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
                {type === 'ALL' ? 'Tout voir' : type}
            </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner"></div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredOffers.map(offer => {
            const deadlineInfo = getDeadlineInfo(offer.deadline);
            return (
              // On retire le padding par défaut de la carte pour coller l'image aux bords
              <div key={offer.id} className="offer-card-modern" style={{padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                
                {/* --- IMAGE MINIATURE --- */}
                <div style={{height: '180px', width: '100%', position: 'relative', backgroundColor: '#f1f5f9'}}>
                    <img
                        src={offer.hasImage ? OfferService.getOfferImageUrl(offer.id) : defaultOfferImage}
                        alt={offer.title}
                        style={{width: '100%', height: '100%', objectFit: 'cover'}}
                        onError={(e) => {e.target.onerror = null; e.target.src = defaultOfferImage}}
                    />
                     {/* Badge ContractType superposé sur l'image */}
                    <span className="badge badge-contract" style={{position: 'absolute', top: '10px', left: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                        {offer.contractType}
                    </span>
                </div>

                {/* --- CONTENU DE LA CARTE --- */}
                <div style={{padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column'}}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        {deadlineInfo && (
                            <span className={`badge badge-deadline ${deadlineInfo.urgent ? 'urgent' : ''}`} title="Date limite">
                                <ClockIcon />&nbsp;{deadlineInfo.text}
                            </span>
                        )}
                    </div>
                    
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--secondary-color)', marginBottom: '0.5rem' }}>
                        {offer.title}
                    </h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        <MapPinIcon /> {offer.location}
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {offer.description}
                    </p>

                    <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Publié le {new Date(offer.createdAt).toLocaleDateString()}</span>
                        <Link to={`/offers/${offer.id}`} style={{ textDecoration: 'none', color: 'var(--primary-color)', fontWeight: '600', fontSize: '0.9rem' }}>
                            Voir l'offre →
                        </Link>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OfferListPage;