import React, { useState } from 'react';

interface ShareModalProps {
  slug: string;
  formationName?: string;
  onClose: () => void;
  pitchImageUrl?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ slug, formationName, onClose, pitchImageUrl }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/editor?slug=${slug}`;
  const shareText = `🏟️ Regarde ma tactique ${formationName ? `en ${formationName}` : ''} sur TacticBoard !`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // WhatsApp
  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;
    window.open(url, '_blank');
  };

  // X / Twitter
  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  // Facebook
  const handleFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  // Native Web Share API (mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Ma tactique TacticBoard',
        text: shareText,
        url: shareUrl,
      });
    } else {
      handleCopy();
    }
  };

  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  return (
    <div className="player-form-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="share-modal-header">
          <div className="share-modal-title">
            <span className="share-icon">🔗</span>
            <div>
              <h3>Composition sauvegardée !</h3>
              <p className="share-subtitle">Partagez votre tactique avec votre équipe</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Pitch preview */}
        {pitchImageUrl && (
          <div className="share-pitch-preview">
            <img src={pitchImageUrl} alt="Aperçu du terrain" />
          </div>
        )}

        {/* URL */}
        <div className="share-url-section">
          <div className="share-url-box">
            <span className="share-url-text">{shareUrl}</span>
            <button
              className={`share-copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? '✅ Copié !' : '📋 Copier'}
            </button>
          </div>
        </div>

        {/* Social buttons */}
        <div className="share-buttons">
          <p className="share-buttons-label">Partager sur</p>

          <div className="share-socials">
            {/* WhatsApp */}
            <button className="social-btn whatsapp" onClick={handleWhatsApp}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </button>

            {/* X / Twitter */}
            <button className="social-btn twitter" onClick={handleTwitter}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X / Twitter
            </button>

            {/* Facebook */}
            <button className="social-btn facebook" onClick={handleFacebook}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>

            {/* Native Share (mobile) */}
            {canNativeShare && (
              <button className="social-btn native" onClick={handleNativeShare}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
                Partager
              </button>
            )}
          </div>
        </div>

        <div className="share-footer">
          <button className="btn-clear" onClick={onClose} style={{ flex: 1 }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
