import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTacticStore } from '../stores/useTacticStore';
import FormationPanel from '../components/FormationPanel/FormationPanel';
import CompareMode from '../components/CompareMode/CompareMode';
import { useIsMobile } from '../hooks/useIsMobile';

const Compare: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { formations, loadFormations, currentFormation } = useTacticStore();

  useEffect(() => {
    if (formations.length === 0) {
      loadFormations().then(() => {
        const first = useTacticStore.getState().formations[0];
        if (first) useTacticStore.getState().setFormation(first);
      });
    }
    // Enable compare mode
    const state = useTacticStore.getState();
    if (!state.compareMode) state.toggleCompareMode();
  }, []);

  return (
    <div className="app-layout" style={{ flexDirection: isMobile ? 'column' : 'row' }}>
      {!isMobile && <FormationPanel />}

      <div className="app-main">
        <nav className="navbar">
          <div className="navbar-left">
            <button className="nav-btn" onClick={() => navigate('/')}>
              {isMobile ? '←' : '← Accueil'}
            </button>
            <button className="nav-btn" onClick={() => navigate('/editor')}>
              ⚽ {isMobile ? 'Éditer' : 'Éditeur'}
            </button>
            {currentFormation && (
              <span className="navbar-formation-badge">{currentFormation.name}</span>
            )}
            {!isMobile && <span className="navbar-title">Mode Comparaison</span>}
          </div>
        </nav>

        <div className="editor-layout" style={{ overflow: 'auto' }}>
          <CompareMode />
        </div>
      </div>
    </div>
  );
};

export default Compare;
