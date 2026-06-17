import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Konva from 'konva';
import toast from 'react-hot-toast';
import { useTacticStore } from '../stores/useTacticStore';
import FormationPanel from '../components/FormationPanel/FormationPanel';
import Pitch from '../components/Pitch/Pitch';
import TacticsInfo from '../components/TacticsInfo/TacticsInfo';
import RosterPanel from '../components/RosterPanel/RosterPanel';
import ShareModal from '../components/ShareModal/ShareModal';
import CompareMode from '../components/CompareMode/CompareMode';
import { useIsMobile } from '../hooks/useIsMobile';
import BottomNav from '../components/BottomNav/BottomNav';

const Editor: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stageRef = useRef<Konva.Stage>(null);
  
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<'pitch' | 'formations' | 'roster' | 'analysis'>('pitch');

  const {
    currentFormation,
    currentTeam,
    compareMode,
    toggleCompareMode,
    loadFormations,
    loadTeams,
    loadComposition,
    saveComposition,
    resetPositions,
    formations,
    rosterPanelOpen,
    toggleRosterPanel,
  } = useTacticStore();

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareSlug, setShareSlug] = useState('');
  const [pitchPreview, setPitchPreview] = useState<string | undefined>();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load data on mount
  useEffect(() => {
    const initLoad = async () => {
      if (formations.length === 0) {
        await loadFormations();
        const first = useTacticStore.getState().formations[0];
        if (first && !useTacticStore.getState().currentFormation) {
          useTacticStore.getState().setFormation(first);
        }
      }
      loadTeams();
    };
    initLoad();
  }, []);

  // Load shared composition from slug
  useEffect(() => {
    const slug = searchParams.get('slug');
    if (slug) {
      loadComposition(slug).then(() => toast.success('Composition chargée !'));
    }
  }, []);

  // Export PNG
  const handleExport = () => {
    if (!stageRef.current) return;
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `tacticboard-${currentFormation?.name || 'terrain'}.png`;
    link.href = dataURL;
    link.click();
    toast.success('Terrain exporté en PNG !');
  };

  // Save + show share modal
  const handleSave = async () => {
    if (!saveTitle.trim()) {
      toast.error('Entrez un titre pour votre composition');
      return;
    }
    setIsSaving(true);
    try {
      // Capture pitch preview
      const imageUrl = stageRef.current?.toDataURL({ pixelRatio: 1 });
      const slug = await saveComposition(saveTitle);
      setShareSlug(slug);
      setPitchPreview(imageUrl);
      setShowSaveDialog(false);
      setSaveTitle('');
      setShowShareModal(true);
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="app-layout" style={{ flexDirection: 'column' }}>
      <div className="app-layout" style={{ flex: 1, overflow: 'hidden' }}>
        {/* Left sidebar */}
        {!isMobile && <FormationPanel />}

        {/* Main area */}
        <div className="app-main">
          {/* Navbar */}
          <nav className="navbar">
            <div className="navbar-left">
              <button className="nav-btn" onClick={() => navigate('/')}>
                {isMobile ? '←' : '← Accueil'}
              </button>
              {!isMobile && (
                <button className="nav-btn" onClick={() => navigate('/team')}>
                  👥 {currentTeam ? currentTeam.name : 'Mon équipe'}
                </button>
              )}
              {currentFormation && (
                <span className="navbar-formation-badge">{currentFormation.name}</span>
              )}
              {!isMobile && (
                <span className="navbar-title">
                  {compareMode ? 'Mode Comparaison' : 'Éditeur'}
                </span>
              )}
            </div>

            <div className="navbar-right">
              {currentTeam && !isMobile && (
                <button
                  className={`nav-btn ${rosterPanelOpen ? 'active-team' : ''}`}
                  onClick={toggleRosterPanel}
                  style={{ borderColor: rosterPanelOpen ? currentTeam.color : undefined, color: rosterPanelOpen ? currentTeam.color : undefined }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: currentTeam.color,
                      marginRight: 4,
                    }}
                  />
                  Effectif
                </button>
              )}
              <button
                className={`nav-btn ${compareMode ? 'compare-active' : ''}`}
                onClick={toggleCompareMode}
              >
                ⚡ {compareMode ? (isMobile ? 'Quitter' : 'Quitter') : (isMobile ? 'Comparer' : 'Comparer')}
              </button>
              {!compareMode && (
                <>
                  <button className="nav-btn" onClick={resetPositions}>↺</button>
                  {!isMobile && (
                    <button className="nav-btn" onClick={handleExport} disabled={!currentFormation}>
                      📷 PNG
                    </button>
                  )}
                  {!isMobile && (
                    <button
                      className="nav-btn primary"
                      onClick={() => setShowSaveDialog(true)}
                      disabled={!currentFormation}
                    >
                      💾 Sauvegarder
                    </button>
                  )}
                </>
              )}
            </div>
          </nav>

          {/* Editor body */}
          <div className="editor-layout" style={{ flex: 1 }}>
            {compareMode ? (
              <CompareMode />
            ) : (
              <div className="pitch-container">
                <Pitch stageRef={stageRef} />
              </div>
            )}
            {!compareMode && !isMobile && <TacticsInfo />}
          </div>
        </div>
      </div>

      {/* Roster panel (bottom) */}
      {!compareMode && !isMobile && <RosterPanel />}

      {/* Bottom navigation - Mobile only */}
      {isMobile && !compareMode && (
        <BottomNav
          activeTab={mobileTab}
          setActiveTab={setMobileTab}
          onShareClick={() => setShowSaveDialog(true)}
          hasTeam={!!currentTeam}
        />
      )}

      {/* Mobile Bottom Sheets */}
      {isMobile && !compareMode && mobileTab === 'formations' && (
        <div className="bottom-sheet-overlay" onClick={() => setMobileTab('pitch')}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bottom-sheet-header">
              <h3>Formations</h3>
              <button className="bottom-sheet-close" onClick={() => setMobileTab('pitch')}>✕</button>
            </div>
            <div className="bottom-sheet-content">
              <FormationPanel />
            </div>
          </div>
        </div>
      )}

      {isMobile && !compareMode && mobileTab === 'roster' && (
        <div className="bottom-sheet-overlay" onClick={() => setMobileTab('pitch')}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bottom-sheet-header">
              <h3>Effectif - {currentTeam?.name || 'Mon équipe'}</h3>
              <button className="bottom-sheet-close" onClick={() => setMobileTab('pitch')}>✕</button>
            </div>
            <div className="bottom-sheet-content">
              <RosterPanel />
            </div>
          </div>
        </div>
      )}

      {isMobile && !compareMode && mobileTab === 'analysis' && (
        <div className="bottom-sheet-overlay" onClick={() => setMobileTab('pitch')}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bottom-sheet-header">
              <h3>Fiche d'analyse</h3>
              <button className="bottom-sheet-close" onClick={() => setMobileTab('pitch')}>✕</button>
            </div>
            <div className="bottom-sheet-content">
              <TacticsInfo />
            </div>
          </div>
        </div>
      )}

      {/* Save dialog */}
      {showSaveDialog && (
        <div className="player-form-overlay" onClick={() => setShowSaveDialog(false)}>
          <div className="player-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="player-form-header">
              <div className="player-form-position">
                <span className="position-badge">💾</span>
                <h3>Sauvegarder la composition</h3>
              </div>
              <button className="close-btn" onClick={() => setShowSaveDialog(false)}>✕</button>
            </div>
            <div className="player-form-body">
              <div className="form-field">
                <label>Titre de la composition</label>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="ex: Équipe A vs Équipe B — 20/06"
                  className="form-input"
                  autoFocus
                  maxLength={100}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>
              <p style={{ fontSize: 12, color: 'rgba(240,242,248,0.4)' }}>
                Un lien de partage sera généré — vous pourrez le partager sur WhatsApp, X, Facebook, etc.
              </p>
            </div>
            <div className="player-form-footer">
              <button className="btn-clear" onClick={() => setShowSaveDialog(false)}>Annuler</button>
              <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Sauvegarde...' : '💾 Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          slug={shareSlug}
          formationName={currentFormation?.name}
          pitchImageUrl={pitchPreview}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default Editor;
